import { http } from "src/core/http"
import { ResponseBase } from "src/types/base";
import { Doc } from "src/types/doc";
import { Upload } from "src/types/upload";

/**
 * 文档上传
 * @param applicationId 应用ID
 * @param params Doc.ParamsUpload
 * @returns 
 */
export const createJob = (params: Doc.ParamsUpload[]): Promise<Doc.ResCreateJob[]> => {
    return http.post(`/documents`, params, {
        'Content-Type': 'application/json'
    });
}

/**
 * 文档重新上传
 * @param documentId 文档ID
 * @returns 
 */
export const resume = (documentId: number): Promise<Doc.UploadResumeData> => {
    return http.put(`/document/${documentId}/upload/continue`)
}

/**
 * 文档转码
 * @param documentId 文档ID
 * @returns 
 */
export const transcode = (documentId: number): Promise<ResponseBase<null>> => {
    return http.post(`/documents/${documentId}/transcode`, null, {
        'Content-Type': 'application/json'
    })
}

/**
 * 文档查询（单个）
 * @param documentId 文档ID
 * @returns 
 */
export const query = (documentId: number): Promise<Doc.UploadInfo> => {
    return http.get(`/documents/${documentId}`)
}

/**
 * 
 * @returns 
 */
export const queryDocs = (params: Doc.ParamsQueryDocs): Promise<Doc.UploadInfo[]> => {
    return http.get('/documents', params)
}

/**
 * 文档删除(单个)
 * @param documentId 文档ID
 * @returns 
 */
export const deleteDoc = (documentId: number): Promise<ResponseBase<null>> => {
    return http.delete(`/documents/${documentId}`)
}

/**
 * 大文件分段上传
 * @param file 分片数据
 * @param chunkNumber 当前分片编号
 * @param uploadId 全局分段任务ID（唯一）
 * @returns 
 */
 export const uploadPart = (params: Upload.ParamsUploadPart) => {
    return http.post('/mdc-document/upload-part', params, {
        'Content-Type': 'multipart/form-data'
    })
}