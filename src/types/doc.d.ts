import { ResponseBase } from 'src/types/base';
import { Upload } from './upload';

export const enum DocStatus {

}

namespace Doc {
    interface ParamsUpload {
        appId: number;
        documentName: string; // 文档名称
        documentRealName: string; // 文档真实名称
        chunkTotalNumber: number; // 总分片数
        needTranscode: boolean; // 是否需要转码，不传递默认false
        chunkSize: number; // 分片大小
        size: number;
        format: string;
        sign: string;
    }

    interface UploadInitInfo {
        documentId: number; // 文档ID
        uploadId: string; // obs全局唯一ID
        chunkSize: number; // 分片大小
    }

    interface UploadInfo {
        appId: number;
        appName: string; // 应用名称
        documentName: string; // 文档名称;
        documentId: number; // 文档ID
        url: string; // 文档访问路径
        state: DocStatus; // 文档状态
        createTime: string; // 创建时间
        needTranscode: boolean; // 是否转码
        uploadId: string;
    }

    interface UploadResumeData extends UploadInitInfo {
        canExecutable: boolean; // 是否可执行
        chunkNumbers: number[]; // 已经完成的分片
    }

    interface ParamsQueryDocs {
        documentName?: string;
        state?: DocStatus;
        page: number;
        perPage: number;
        documentId?: number;
        appIds?: numbers[];
        createTimeStart?: string;
        createTimeEnd?: string;
    }

    interface ResCreateJob {
        jobId: number;
        uploadId: string;
    }
}