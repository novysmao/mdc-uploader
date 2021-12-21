import { progress } from './../service/media';
import { ResponseBase } from 'src/types/base';
import { Upload } from './upload';

namespace Media {
    interface Info {
        duration: number; // 毫秒
        width?: number; // 宽
        height?: number; // 高
    }
    
    interface Job {
        jobId: number; // 任务ID
        mediaName: string; // 媒资名称
        size: number; // 大小
        format: string; // 格式
        uploadType: UploadType; // 0:本地上传，1：URL上传
        url: string; // url
        templateName: string; // 模板名称
        categoryName: string; // 媒资分类
        enterpriseId: number; // 企业ID
    }

    interface ParamsLocalUpload {
        mediaName: string; // 媒资名称
        templateId?: number; // 模板id
        categoryId?: number; // 媒资分类ID
        appId: number; // 应用ID
        chunkTotalNumber: number; // 分片总数
        format: string; // 格式
        size: number; // 大小
        chunkSize: number; // 分片大小
        sign: string; // md5值
        duration?: number; // 时长，单位秒
        width?: number; // 宽
        height?: nunber; // 高
        mediaType: string; // 类型 video 或者 audio
    }

    interface ParamsUploadJobs {
        enterpriseId?: number; // 所属企业id查询
        appId?: number; // 所属应用id查询
        state?: UploadStatus; // 状态
        page: number; // 查询第几页，从1开始
        perPage: number; // 每页显示几条数据
        sort?: string; // 按哪个属性来排序，如按userName（保留字段）
        order?: string; // desc为降序，asc为升序（默认）（保留字段）
        mediaName?: string; // 媒资名称
        uploadType?: UploadType; // 类型
        createTimeStart?: string; // 创建时间开始
        createTimeEnd?: string; // 创建时间结束
    }

    type ParamsUploadFromUrl = Upload.UrlTaskOption;

    interface ResQueryExecutableData {
        jobId: number; // 任务ID
        canExecutable: boolean; // 可执行
        uploadId: string; // obs全局唯一ID
        chunkSize: number; // 每个分片大小
        chunkNumbers: number[]; // 已经上传的分片
    }

    // interface ResCreateJob {
    //     mediaId: number;
    //     objId: string;
    //     mediaPath: string;
    //     mediaName: string;
    //     mediaType: string;
    //     categoryId: number;
    //     categoryName: string;
    //     sourceType: string;
    //     enableType: number;
    //     state: number;
    //     coverStoragePath: string;
    //     storagePath: string;
    //     duration: string;
    //     size: number;
    //     width: number;
    //     height: height;
    //     format: string;
    //     framerate: number;
    //     bitrate: number;
    //     taskId: number;
    //     enterpriseId: number;
    //     enterpriseName: string;
    //     appId: number;
    //     appName: string;
    //     creatorId: number;
    //     creatorName: string;
    //     createTime: string;
    //     updaterId: number;
    //     updaterName: string;
    //     updateTime: string;
    // }
    interface ResCreateJob {
        jobId: number;
        uploadId: string;
    }

    interface ResProgressData {
        progress: number;
    }

    type ResQueryJob = ResponseBase<Job>;

    type ResQueryJobs = ResponseBase<Job[]>;
}