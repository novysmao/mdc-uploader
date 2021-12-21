export const FileSizeBenchmark = 10 * 1024 * 1000; // 自定义文件大小基准值100M，超过视为大文件，单位为B
export const FileChunkSize = 2 * 1024 * 1000; // 自定义分片大小2M，单位为B
export const FileChunkUploadThreads = 4; // 分片上传并发数
export const MaxFileChunkNumber = 10000; // 最大分片数
export const MaxUploadRetryTimes = 3; // 重试次数

export enum ServiceType {
    Platform = 'platform',
    Dashboard = 'dashboard',
    Background = 'background',
}