import { createJob, queryDocs, resume, uploadPart } from "src/service/doc";
import { Doc } from "src/types/doc";
import { TaskStatus, Upload } from "src/types/upload";
import { ChunksTask } from "./basic/chunks-task";

export interface DocTask {
    _option: Upload.DocTaskOption
}

/**
 * DocTask 文档上传任务
 * 需要分片、不需要排队
 * 从ChunksTask继承
 */
export class DocTask extends ChunksTask {
    DOC_TASK = true;
    _uploadPart = uploadPart;

    static async createJobs(tasks: DocTask[]) {
        const params: Doc.ParamsUpload[] = [];
        tasks.map(task => {
            const { appId, chunkSize, name, needTranscode, file } = task._option as Upload.DocTaskOption;
            const suffix = (file as File).name.split('.').pop() || '';
            params.push({
                appId,
                sign: task._fileMD5,
                documentName: name,
                documentRealName: (file as File).name,
                chunkTotalNumber: task.chunks.length,
                needTranscode: needTranscode || false,
                chunkSize,
                size: (file as File).size,
                format: suffix
            })
        })
        const res = await createJob(params);
        res.map((v: Doc.ResCreateJob, index: number) => {
            const { jobId, uploadId } = v;
            tasks[index]._updateOption({ jobId, uploadId })
        })
    }

    constructor(option: Upload.DocTaskOption) {
        super(option)
    }

    async init() {
        if (this._option.file) {
            await this._resolveFile(); 
        }
    }

    async _resolveFile() {
        await this._sliceFile();
        this._updateStatus(TaskStatus.WaitingUpload);
    }

    async createJob() {
        await this.init();

        const { appId, file, name, needTranscode, chunkSize } = this._option;
        const suffix = (file as File).name.split('.').pop() || '';
        const res = await createJob([{
            sign: this._fileMD5,
            appId,
            documentName: name,
            documentRealName: (file as File).name,
            chunkTotalNumber: this.chunks.length,
            needTranscode: needTranscode || false,
            chunkSize,
            size: (file as File).size,
            format: suffix
        }])

        this._updateOption(res[0] as Upload.DocTaskOption);
    }

    async start() {
        return this._uploadLoop().then(() => {
            this._updateStatus(TaskStatus.Success);
            console.log('【所有分片上传完成！！！！！！】')
        }).catch(err => {
            console.log(err)
        });
    }

    async resume() {
        const res = await resume(this._option.documentId);
        const { chunkSize, uploadId, chunkNumbers } = res;
        if (chunkSize !== this._option.chunkSize) {
            await this._sliceFile();
        }
        this._updateOption({
            chunkSize,
            uploadId
        } as Upload.DocTaskOption);
        this._uploadedChunks = chunkNumbers;
        await this.start();
    }

    async queryDocs(params: Doc.ParamsQueryDocs) {
        return queryDocs(params)
    }
}