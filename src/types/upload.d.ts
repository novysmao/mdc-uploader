import { ResponseBase } from 'src/types/base';

export const enum UploadStatus {
    Waiting = 0,
    Uploading = 1,
    Fail = 2,
    Terminal = 3,
    Success = 4,
}

export const enum UploadType {
    Local = 0, // 本地上传
    Url = 1 // url上传
}

// 有先后顺序
export const enum TaskStatus {
    None = 0,
    Calculating = 1,
    WaitingUpload = 2,
    Uploading = 3,
    WaitingTranscode = 4,
    Success = 5,
    Failure = 6,
    TranscodeFail = 7,
    Aborted = 8,
}

namespace Upload {
    interface BaseTaskOption {
        appId: number; // 引用id
        name: string; // 名称
        templateId?: number; // 模板id
        categoryId?: number; // 分类id
        uploadId: string; // 全局分段任务ID
        threads: number; // 并发数
        retryTimes: number; // 重试次数
    }

    interface ChunksTaskOption extends BaseTaskOption{
        file: File | null; // 需要上传的文件
        chunkSize: number;
    }

    interface ExecutableTaskOption {
        jobId: number; // 上传任务的id，对应目睹云jobId
    }

    interface LocalMediaTaskOption extends ChunksTaskOption {
        jobId: number; // 上传任务的id，对应目睹云jobId
    }

    interface DocTaskOption extends ChunksTaskOption {
        jobId: number;
        documentId: number; // 文档ID
        needTranscode?: boolean; // 是否转码
    }

    interface RemoteMediaTaskOption extends ChunksTaskOption {
        jobId: number; // 上传任务的id，对应目睹云jobId
        mediaName: string; // 媒资名称
        url: string; // url
    }
    
    interface ParamsUploadPart {
        file: Blob | File;
        chunkNumber: number;
        uploadId: string;
        sign: string;
    }
    
    type TaskOption = LocalMediaTaskOption | DocTaskOption | RemoteMediaTaskOption | ChunksTaskOption | ExecutableTaskOption;
}