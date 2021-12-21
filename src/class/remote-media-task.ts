import { Upload, TaskStatus } from "src/types/upload";
import { progress, uploadFromUrl } from 'src/service/media';
import { sleep } from 'src/core/index';
import { ChunksTask } from './basic/chunks-task';
import { Task } from "./basic/task";
import { Media } from "src/types/media";
export interface RemoteMediaTask {
    _option: Upload.RemoteMediaTaskOption;
}

/**
 * RemoteMediaTask 网络上传任务
 * 不需要分片、不需要排队
 * 通过applyMixins从ChunksTask和ExecutableTask混合继承
 * 从Task继承
 */
export class RemoteMediaTask extends Task {
    REMOTE_MEDIA_TASK = true;

    static async createJobs(tasks: RemoteMediaTask[]) {
        const params: Media.ParamsUploadFromUrl[] = [];
        tasks.map(task => {
            const { appId, name, templateId, categoryId, url } = task._option;
            params.push({
                appId, mediaName: name, templateId, categoryId, url
            })
        })
        await uploadFromUrl(params)
        return tasks;
    }

    constructor(option: Upload.RemoteMediaTaskOption) {
        super(option)
    }

    async init() {
        await this.createJob();
        await this.syncProgressFromRemote();
    }

    async createJob() {
        if (!TaskStatus.WaitingUpload) {
            return Promise.reject('任务还未准备好')
        }
        const { appId, name, templateId, categoryId, url } = this._option;
        uploadFromUrl([{
            appId, mediaName: name, templateId, categoryId, url
        }])
    }

    async syncProgressFromRemote() {
        this._updateStatus(TaskStatus.Uploading);
        const fun = async () => {
            const data = await progress(this._option.jobId);
            this._updateProgress(data.progress.toString());
            if (data.progress < 100) {
                await sleep(1000);
                await fun();
            }
        }
        await fun();
        this._updateStatus(TaskStatus.Success)
    }
}