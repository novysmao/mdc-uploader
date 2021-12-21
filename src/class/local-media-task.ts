import { isVideo, secondsFormatDate } from "src/core/index";
import { abort, createUploadJob, queryJob, queryUploadJobs, resume, uploadPart } from "src/service/media";
import { Media } from "src/types/media";
import { TaskStatus, Upload } from "src/types/upload";
import { ChunksTask } from "./basic/chunks-task";
import { ExecutableTask } from "./basic/executable-task";
import MediaInfo from 'mediainfo.js'

export interface LocalMediaTask {
    _option: Upload.LocalMediaTaskOption;
}

/**
 * LocalMediaTask 本地音视频上传任务
 * 需要分片、需要排队
 * ChunksTask
 */
export class LocalMediaTask extends ChunksTask {
    LOCAL_MEDIA_TASK = true;

    protected _mediaInfo: Media.Info | null = null; // 媒体信息：分辨率、画面宽、画面高
    _uploadPart = uploadPart;

    static async createJobs(tasks: LocalMediaTask[]) {
        const params: Media.ParamsLocalUpload[] = [];
        tasks.map(task => {
            const { appId, file, chunkSize, name, categoryId, templateId } = task._option as Upload.LocalMediaTaskOption;
            const suffix = (file as File).name.split('.').pop() || '';
            let mediaType = (file as File).type.split('/').shift() || '';

            // windows下flv的File.type为空
            if ((file as File).name.replace(/.+\./,'') === 'flv') {
                mediaType = 'video';
            }
            
            params.push({
                appId,
                categoryId,
                templateId,
                mediaName: name || (file as File).name,
                chunkTotalNumber: task._fileChunks.length,
                format: suffix,
                size: (file as File).size,
                chunkSize,
                sign: task._fileMD5,
                mediaType,
                ...task._mediaInfo
            })
        })

        const res = await createUploadJob(params);
        res.map((v: Media.ResCreateJob, index: number) => {
            tasks[index]._updateOption(v)
        })
    }

    constructor(option: Upload.LocalMediaTaskOption) {
        super(option)
    }

    async _getMediaInfo() {
        const readChunk = (chunkSize: number, offset: number) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (event: any) => {
                    if (event.target.error) {
                        reject(event.target.error)
                    }
                    resolve(new Uint8Array(event.target.result))
                }
                reader.readAsArrayBuffer((this._option.file as File).slice(offset, offset + chunkSize))
            })
        return new Promise((resolve, reject) => {
            if (this._option.file) {
                MediaInfo({ format: 'object' }, (mediainfo: any) => {
                    mediainfo.analyzeData(() => this._option.file?.size, readChunk)
                        .then((result: any) => {
                            console.log(result.media)
                            const videoInfo: any = result.media.track.find((v: any) => v['@type'] === 'Video')
                            const audioInfo: any = result.media.track.find((v: any) => v['@type'] === 'Audio')
                            if (videoInfo) {
                                const { Duration, Width, Height } = videoInfo;
                                const mediainfo = {
                                    width: Math.floor(Number(Width)),
                                    height: Math.floor(Number(Height)),
                                    duration: Number(Duration) * 1000
                                }
                                this._mediaInfo = mediainfo;
                            } else {
                                const { Duration } = audioInfo;
                                const mediainfo = {
                                    duration: Number(Duration) * 1000
                                }
                                this._mediaInfo = mediainfo;
                            }
                            
                            resolve(true);
                        }).catch((error: any) => {
                            reject(error.stack)
                        })
                })
            } else {
                reject('文件不存在')
            }
        })  
    }

    async init() {
        if (this._option.file) {
            await this._resolveFile();
        }
    }

    async loadFile(file: File) {
        this._updateOption({ file } as Upload.LocalMediaTaskOption);
        await this._resolveFile();
    }

    async _resolveFile() {
        await this._sliceFile();
        await this._getMediaInfo();
        console.log(this._mediaInfo)
        this._updateStatus(TaskStatus.WaitingUpload);
    }

    async createJob() {
        await this.init();

        if (!TaskStatus.WaitingUpload) {
            return Promise.reject('任务还未准备好')
        }
        const { appId, file, chunkSize, name } = this._option as Upload.LocalMediaTaskOption;
        const suffix = (file as File).name.split('.').pop() || '';
        const mediaType = (file as File).type.split('/').shift() || '';
        const res = await createUploadJob([{
            appId,
            mediaName: name || (file as File).name,
            chunkTotalNumber: this._fileChunks.length,
            format: suffix,
            size: (file as File).size,
            chunkSize,
            mediaType,
            sign: this._fileMD5,
            ...this._mediaInfo
        }]);
        const { jobId, uploadId } = res[0];
        this._option = {
            ...this._option,
            ...{ jobId, uploadId }
        }
    }

    async start() {
        return new Promise((resolve, reject) => {
            ExecutableTask._canExecutableLoop(this._option.jobId).then(async res => {
                const { chunkSize, chunkNumbers } = res;
                if (chunkSize !== this._option.chunkSize) {
                    this._updateOption({ chunkSize } as Upload.LocalMediaTaskOption)
                    await this._sliceFile();
                }
                this._uploadedChunks = chunkNumbers;
                this._retryTimes = 0;
                return this._uploadLoop().then(() => {
                    this._updateStatus(TaskStatus.Success);
                    console.log('【所有分片上传完成！！！！！！】')
                    resolve(true)
                }).catch(err => {
                    this._updateStatus(TaskStatus.Failure);
                    console.log(err)
                    reject(err)
                });
            })
        })
    }

    async resume() {
        await resume(this._option.jobId);
        this._updateStatus(TaskStatus.WaitingUpload);
        await this.start();
    }

    async abort() {
        this._updateStatus(TaskStatus.Aborted);
        await abort(this._option.jobId);
    }

    async query() {
        const res: Media.Job = await queryJob(this._option.jobId);
        return res;
    }

    async queryJobs(params: Media.ParamsUploadJobs) {
        return queryUploadJobs(params);
    }
}
