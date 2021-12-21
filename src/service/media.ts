import { Upload } from 'src/types/upload';
import { http } from "src/core/http"
import { Media } from "src/types/media"

/**
 * 上传任务轮询查看执行资格
 * @param jobId 上传任务id
 * @returns Promise<Upload.ResQueryExecutable>
 */
export const executable = (jobId: number): Promise<Media.ResQueryExecutableData> => {
    return http.get(`/upload-jobs/${jobId}/executable`, null)
}

/**
 * 终止上传
 * @param jobId 上传任务id
 * @returns Promise<ResponseBase>
 */
export const abort = (jobId: number) => {
    return http.put(`/upload-jobs/${jobId}/stop`)
}

/**
 * 继续上传（针对本地上传有效）
 * @param jobId 上传任务id
 * @returns 
 */
export const resume = (jobId: number) => {
    return http.put(`/upload-jobs/${jobId}/continue`)
}

/**
 * 大文件分段上传
 * @param file 分片数据
 * @param chunkNumber 当前分片编号
 * @param uploadId 全局分段任务ID（唯一）
 * @returns 
 */
export const uploadPart = (params: Upload.ParamsUploadPart) => {
    return http.post('/mdc-vod/upload-part', params, {
        'Content-Type': 'multipart/form-data'
    })
}

/**
 * 媒资本地上传
 * @param params Upload.ParamsLocalUpload
 * @returns 
 */
export const createUploadJob = (params: Media.ParamsLocalUpload[]): Promise<Media.ResCreateJob[]> => {
    return http.post('/medias/local-upload', params, {
        'Content-Type': 'application/json'
    })
}

/**
 * 查询批量上传作业
 * @param params 
 * @returns 
 */
export const queryUploadJobs = (params: Media.ParamsUploadJobs): Promise<Media.Job[]> => {
    return http.get(`/upload-jobs`, params);
}

/**
 * 查询单个上传任务
 * @param jobId 任务id
 * @returns 
 */
export const queryJob = (jobId: number): Promise<Media.Job> => {
    return http.get(`/upload-jobs/${jobId}`);
}

/**
 * 媒资URL上传
 * @param params 
 * @returns 
 */
export const uploadFromUrl = (params: Media.ParamsUploadFromUrl[]) => {
    return http.post('/medias/url-upload', params, {
        'Content-Type': 'application/json'
    })
}

/**
 * url上传进度查询
 * @param jobId 上传任务id
 * @returns 
 */
export const progress = (jobId: number): Promise<Media.ResProgressData> => {
    return http.get(`/upload-jobs/${jobId}/progress`)
}
