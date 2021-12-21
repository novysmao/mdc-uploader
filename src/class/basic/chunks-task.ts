import { asyncThreadPool, calcFileMD5 } from 'src/core/index';
import { Media } from 'src/types/media';
import { TaskStatus, Upload } from 'src/types/upload';
import { Task } from './task';

export interface ChunksTask {
    _option: Upload.ChunksTaskOption;
}

/**
 * ChunksTask 分片任务
 * 不对外做暴露，只做分片处理、分片上传，对外暴露的类从这里继承
 * 从Task继承
 */
export class ChunksTask extends Task {
    protected _fileMD5 = ''; // 文件md5
    protected _fileChunks: Blob[] = []; // 文件分片数据
    protected _uploadedChunks: number[] = []; // 已经上传的文件分片
    protected _failedChunks: number[] = []; // 上传失败的文件分片
    protected _retryTimes = 0; // 重试次数

    CHUNKS_TASK = true;

    _uploadPart = (params: Upload.ParamsUploadPart) => {
        return new Promise((resolve) => {
            resolve(params)
        });
    };

    get md5() {
        return this._fileMD5;
    }

    get chunks() {
        return this._fileChunks;
    }

    get uploadedChunks() {
        return this._uploadedChunks;
    }

    get failedChunks() {
        return this._failedChunks;
    }

    get retryTimes() {
        return this._retryTimes;
    }

    constructor(option: Upload.ChunksTaskOption) {
        super(option);
    }

    async _sliceFile() {
        this._updateStatus(TaskStatus.Calculating);

        const { md5, chunks } = await calcFileMD5(this._option.file as File, this._option.chunkSize);
        this._fileMD5 = md5;
        this._fileChunks = chunks;
        console.log(`${this._option.file?.name}的md5值为：${this._fileMD5}`);
    }

    async _uploadLoop(): Promise<boolean> {
        try {
            await this._upload();
        } catch(err) {
            if (this._retryTimes >= this._option.retryTimes) {
                return Promise.reject('超过重试次数')
            }
            this._retryTimes++;
            if (this._failedChunks.length !== 0 || this._uploadedChunks.length !== this.chunks.length) {
                return this._uploadLoop();
            }
        }
        return Promise.resolve(true);
    }

    async _upload() {
        this._updateStatus(TaskStatus.Uploading);

        console.log(`已经上传的分片为：${this._uploadedChunks}`)
        return asyncThreadPool(this._option.threads, [...this._fileChunks.keys()], (chunk) => {
            if (this._status === TaskStatus.Aborted) {
                return Promise.reject('message');
            }
            if ((this._uploadedChunks as number[]).indexOf(chunk + 1) !== -1) {
                console.log(`【该分片已经上传】: ${chunk + 1}`)
                return Promise.resolve();
            }
            return this._uploadChunk(chunk);
        })
    }

    // 上传分片
    async _uploadChunk(chunk: number) {
        console.log(`【分片开始上传】: ${chunk + 1}`);
        try {
            await this._uploadPart({
                sign: this._fileMD5,
                file: this._fileChunks[chunk],
                chunkNumber: chunk + 1,
                uploadId: this._option.uploadId
            })
            console.log(`【该分片上传成功】:${chunk + 1}`)
            this._uploadedChunks.push(chunk + 1)
            const progress = (this._uploadedChunks.length / this.chunks.length * 100).toFixed(2);
            const index = this._failedChunks.indexOf(chunk + 1);
            if (index !== -1) {
                this._failedChunks.splice(index, 1);
            }
            this._updateProgress(progress);
            return Promise.resolve(true)
        } catch (err) {
            console.log(`【该分片上传失败】:${chunk + 1}`)
            this._failedChunks.push(chunk + 1);
            return Promise.reject('分片上传失败')
        }
    }
}