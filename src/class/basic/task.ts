import { FileChunkSize, FileChunkUploadThreads, MaxUploadRetryTimes } from "src/constants/index";
import { Events } from "src/core/events";
import { Upload, TaskStatus } from "src/types/upload";

/**
 * Task类
 * @property {TaskStatus} _status 任务状态
 * @property {string} _progress 任务进度，范围0-100
 * @property {Upload.TaskOption} _option 任务配置
 * @function _updateOption: 更新配置函数
 * @function _updateStatus: 更新任务状态函数
 * @function _updateProgress: 更新任务进度函数
 * 
 */
export class Task extends Events {
    protected readonly _id = new Date().valueOf();
    protected _status: TaskStatus = TaskStatus.None; // 自身状态
    protected _progress = '0'; // 上传进度

    protected _option: Upload.TaskOption = {
        appId: 0,
        uploadId: '',
        jobId: 0,
        file: null,
        chunkSize: FileChunkSize,
        name: '',
        url: '',
        threads: FileChunkUploadThreads,
        retryTimes: MaxUploadRetryTimes,
    };

    get id() {
        return this._id;
    }

    get option() {
        return this._option;
    }

    set option(opt) {
        this._option = {
            ...this._option,
            ...opt
        }
    }

    get progress() {
        return this._progress;
    }

    get status() {
        return this._status;
    }

    constructor(option: Upload.TaskOption) {
        super();

        this._updateOption(option);
    }

    _updateOption(option: Upload.TaskOption) {
        this._option = {
            ...this._option,
            ...option
        }
    }

    _updateStatus(status: TaskStatus) {
        if (status === this._status) return;
        
        this._status = status;
        this.emit('status', status);
    }

    _updateProgress(progress: string) {
        if (progress === this._progress) return;

        this._progress = progress;
        this.emit('progress', progress);
    }
}