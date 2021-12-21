import { RemoteMediaTask } from './remote-media-task';
import { http } from 'src/core/http';
import { DocTask } from './doc-task';
import { Upload } from 'src/types/upload';
import { isAudio, isVideo } from 'src/core/index';
import { Task } from './basic/task';
import { LocalMediaTask } from './local-media-task';
import { FileChunkUploadThreads, MaxUploadRetryTimes, ServiceType } from 'src/constants/index';

export interface UploaderConfig {
    token: string;
    host?: string;
    uploadPartDomain?: string;
    threads?: number;
    retryTimes?: number;
}

export class Uploader {

    private config = {
        token: '',
        host: '',
        uploadPartDomain: '',
        service: ServiceType.Platform,
        threads: FileChunkUploadThreads,
        retryTimes: MaxUploadRetryTimes
    };

    constructor(config?: UploaderConfig) {
        // 初始化操作
        this.config = {
            ...this.config,
            ...config
        };
        this.updateToken();
        http.host = this.config.host || '';
        http.uploadPartDomain = this.config.uploadPartDomain || '';
        http.service = this.config.service || '';
    }

    set token(token: string) {
        this.config.token = token;
        this.updateToken();
    }

    set host(host: string) {
        this.config.host = host;
        http.host = host;
    }

    set uploadPartDomain(domain: string) {
        this.config.uploadPartDomain = domain;
        http.uploadPartDomain = domain;
    }

    set service(service: ServiceType) {
        this.config.service = service;
        http.service = service;
    }

    updateToken() {
        if (this.config.token) {
            http.headers = {
                Authorization: `Bearer ${this.config.token}`
            }
        }
    }

    async createLocalMediaTask(option: Upload.LocalMediaTaskOption) {
        const task = new LocalMediaTask(option);
        if (!option.uploadId) {
            await task.createJob();
        }
        return task;
    }

    async createLocalMediaTasks(options: Upload.LocalMediaTaskOption[]) {
        const promises: Promise<any>[] = [];
        options.map(option => {
            promises.push(
                new Promise(async (resolve) => {
                    const task = new LocalMediaTask(option);
                    await task.init()
                    resolve(task);
                })
            )
        })
        const tasks = await Promise.all(promises);
        await LocalMediaTask.createJobs(tasks);
        return tasks;
    }

    async createDocTask(option: Upload.DocTaskOption) {
        const task = new DocTask(option);
        if (!option.uploadId) {
            await task.createJob();
        }
        await task.createJob();
        return task;
    }

    async createDocTasks(options: Upload.DocTaskOption[]) {
        const promises: Promise<any>[] = [];
        options.map(option => {
            promises.push(
                new Promise(async (resolve) => {
                    const task = new DocTask(option);
                    await task.init()
                    resolve(task);
                })
            )
        })
        const tasks = await Promise.all(promises);
        await DocTask.createJobs(tasks);
        return tasks;
    }

    async createRemoteMediaTask(option: Upload.RemoteMediaTaskOption) {
        const task = new RemoteMediaTask(option);
        await task.createJob();
        return task;
    }
    
    async createRemoteMediaTasks(options: Upload.RemoteMediaTaskOption[]) {
        const tasks: RemoteMediaTask[] = [];
        options.map(option => {
            tasks.push(new RemoteMediaTask(option))
        })
        await RemoteMediaTask.createJobs(tasks)
        return tasks;
    }

    async createTask(option: Upload.TaskOption) {
        if (option.hasOwnProperty('url')) {
            return this.createRemoteMediaTask(option as Upload.RemoteMediaTaskOption)
        }
        if (option.hasOwnProperty('file')) {
            if (isVideo((option as Upload.LocalMediaTaskOption).file) || isAudio((option as Upload.LocalMediaTaskOption).file)) {
                return this.createLocalMediaTask(option as Upload.LocalMediaTaskOption);
            }
            return this.createDocTask(option as Upload.DocTaskOption);
        }
        return new Task(option as Upload.TaskOption);
    }

    async createTasks(options: Upload.TaskOption[]) {
        const promises: Promise<any>[] = [];
        options.map((option: Upload.TaskOption) => {
            promises.push(this.createTask(option))
        })
        const tasks = await Promise.all(promises);
        return tasks;
    }
}