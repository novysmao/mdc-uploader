# mdc-uploader
mdc-uploader是基于目睹云服务的大文件上传工具库，支持切片、多线程上传、多任务上传、错误重试、断点续传。

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick start](#quick-start)
- [Installation](#installation)
- [Build & Deploy](#build--deploy)
    - [开发版 - alpha](#%E5%BC%80%E5%8F%91%E7%89%88---alpha)
    - [线上正式版 - online](#%E7%BA%BF%E4%B8%8A%E6%AD%A3%E5%BC%8F%E7%89%88---online)
- [Api](#api)
  - [创建uploader实例](#%E5%88%9B%E5%BB%BAuploader%E5%AE%9E%E4%BE%8B)
    - [new MdcUploader(config: UploaderConfig): Uploader](#new-mdcuploaderconfig-uploaderconfig-uploader)
  - [本地文件上传任务](#%E6%9C%AC%E5%9C%B0%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0%E4%BB%BB%E5%8A%A1)
    - [Uploader.createLocalMediaTask(option: Upload.LocalMediaTaskOption): Promise&lt;LocalMediaTask&gt;](#uploadercreatelocalmediataskoption-uploadlocalmediataskoption-promiseltlocalmediataskgt)
      - [LocalMediaTask.loadFile(file: File): Promise&lt;void&gt;](#localmediataskloadfilefile-file-promiseltvoidgt)
      - [LocalMediaTask.start(): Promise&lt;void&gt;](#localmediataskstart-promiseltvoidgt)
      - [LocalMediaTask.resume(): Promise&lt;void&gt;](#localmediataskresume-promiseltvoidgt)
      - [LocalMediaTask.abort(): Promise&lt;void&gt;](#localmediataskabort-promiseltvoidgt)
    - [Uploader.createLocalMediaTasks(options: Upload.LocalMediaTaskOption[]): Promise<LocalMediaTask[]>](#uploadercreatelocalmediatasksoptions-uploadlocalmediataskoption-promiselocalmediatask)
  - [文档上传任务](#%E6%96%87%E6%A1%A3%E4%B8%8A%E4%BC%A0%E4%BB%BB%E5%8A%A1)
    - [Uploader.createDocTask(option: Upload.DocTaskOption): Promise&lt;DocTask&gt;](#uploadercreatedoctaskoption-uploaddoctaskoption-promiseltdoctaskgt)
      - [DocTask.start(): Promise&lt;void&gt;](#doctaskstart-promiseltvoidgt)
      - [DocTask.resume(): Promise&lt;void&gt;](#doctaskresume-promiseltvoidgt)
    - [Uploader.createDocTasks(options: Upload.DocTaskOption[]): Promise<DocTask[]>](#uploadercreatedoctasksoptions-uploaddoctaskoption-promisedoctask)
  - [远程url上传任务](#%E8%BF%9C%E7%A8%8Burl%E4%B8%8A%E4%BC%A0%E4%BB%BB%E5%8A%A1)
    - [Uploader.createRemoteMediaTask((option: Upload.RemoteMediaTaskOption): Promise&lt;RemoteMediaTask&gt;](#uploadercreateremotemediataskoption-uploadremotemediataskoption-promiseltremotemediataskgt)
    - [Uploader.createRemoteMediaTasks((options: Upload.RemoteMediaTaskOption[]): Promise<RemoteMediaTask[]>](#uploadercreateremotemediatasksoptions-uploadremotemediataskoption-promiseremotemediatask)
- [Events](#events)
  - [监听任务的状态变化](#%E7%9B%91%E5%90%AC%E4%BB%BB%E5%8A%A1%E7%9A%84%E7%8A%B6%E6%80%81%E5%8F%98%E5%8C%96)
  - [监听任务的上传进度](#%E7%9B%91%E5%90%AC%E4%BB%BB%E5%8A%A1%E7%9A%84%E4%B8%8A%E4%BC%A0%E8%BF%9B%E5%BA%A6)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick start
```
<script src="../dist/index.min.js"></script>
const uploader = new MdcUploader({
    token,
    host: 'http://mdc-console.dev.mudu.tv'
});
const localMediaTask = createLocalMediaTask(option);
const docTask = createDocTask(option);
const remoteMediaTask = createRemoteMediaTask(option);
```

## Installation
通过网页加载js代码
```
// 开发版
<script src="https://static.mudu.tv/mdc-uploader/alpha/latest/index.min.js"></script>
或者
https://static.mudu.tv/mdc-uploader/alpha/{版本号，例如v0.0.1}/index.min.js

// 线上正式版
<script src="https://static.mudu.tv/mdc-uploader/latest/index.min.js"></script>
或者
https://static.mudu.tv/mdc-uploader/{版本号，例如v0.0.1}/index.min.js
```

## Build & Deploy
版本对应package.json的version。编译时自动打包dist下所有文件，可以在gitlab - pipelines下载artifacts压缩包，过期时间为1个星期。
#### 开发版 - alpha
编译：对应dev分支，自动编译，其他分支不进行alpha版本编译。

部署：对应dev分支，手动部署。
#### 线上正式版 - online
编译：对应master，自动编译，其他分支不进行online版本编译。

部署：对应master tags，手动部署。

## Api
### 创建uploader实例
#### new MdcUploader(config: UploaderConfig): Uploader
创建一个upload实例，上传任务都需要通过upload实例来创建。可创建本地文件上传任务、文档上传任务、远程url上传任务。

UploaderConfig

参数 | 描述 | 是否必须 | 类型
--- | --- | --- | ---
token | token | 是 | string
host | 服务地址 | 否 | string
uploadPartDomain | 分片上传域名 | 否 | string
service | 服务类型，默认为'platform'。目睹云控制台传入'dashboard'，目睹云运营平台传入'background' | 否 | string
threads | 并发数，默认4 | 否 | number
retryTimes | 重试次数，默认3 | 否 | number

### 本地文件上传任务
#### Uploader.createLocalMediaTask(option: Upload.LocalMediaTaskOption): Promise&lt;LocalMediaTask&gt;
创建一个本地文件上传任务

LocalMediaTaskOption

参数 | 描述 | 是否必须 | 类型
--- | --- | --- | ---
file | 上传的文件，可先不传，可通过loadFile方法更新 | 否 | File
chunkSize | 分片大小（单位为字节），默认为2 * 1024 * 1000，即2M | 否 | number
appId | 应用ID | 是 | number
templateId | 转码模板ID | 否 | number
categoryId | 分类ID | 否 | number
name | 文件名字，默认取File.name | 否 | string
uploadId | 上传任务ID，如果为续传，则需要传该值 | 否 | number

##### LocalMediaTask.loadFile(file: File): Promise&lt;void&gt;
本地上传任务更新文件。
##### LocalMediaTask.start(): Promise&lt;void&gt;
开始上传

##### LocalMediaTask.resume(): Promise&lt;void&gt;
开始续传

##### LocalMediaTask.abort(): Promise&lt;void&gt;
终止上传

#### Uploader.createLocalMediaTasks(options: Upload.LocalMediaTaskOption[]): Promise<LocalMediaTask[]>
创建批量本地文件上传任务

### 文档上传任务
#### Uploader.createDocTask(option: Upload.DocTaskOption): Promise&lt;DocTask&gt;
创建一个文档上传任务

DocTaskOption

参数 | 描述 | 是否必须 | 类型
--- | --- | --- | ---
file | 上传的文件 | 是 | File
chunkSize | 分片大小（单位为字节），默认为2 * 1024 * 1000，即2M | 否 | number
appId | 应用ID | 是 | number
name | 文件名字，默认为空 | 否 | string
needTranscode | 是否转码，默认false | 否 | boolean
documentId | 文档ID，如果为续传，则需要传该值 | 否 | number

##### DocTask.start(): Promise&lt;void&gt;
开始上传

##### DocTask.resume(): Promise&lt;void&gt;
开始续传

#### Uploader.createDocTasks(options: Upload.DocTaskOption[]): Promise<DocTask[]>
创建批量文档上传任务

### 远程url上传任务
#### Uploader.createRemoteMediaTask((option: Upload.RemoteMediaTaskOption): Promise&lt;RemoteMediaTask&gt;
创建一个远程url上传任务

RemoteMediaTaskOption

参数 | 描述 | 是否必须 | 类型
--- | --- | --- | ---
url | url地址 | 是 | string
appId | 应用ID | 是 | number
templateId | 转码模板ID | 否 | number
categoryId | 分类ID | 否 | number
name | 文件名字，默认为空 | 否 | string

#### Uploader.createRemoteMediaTasks((options: Upload.RemoteMediaTaskOption[]): Promise<RemoteMediaTask[]>
创建批量远程url上传任务

## Events
任务的事件监听。

type Task = LocalMediaTask | RemoteMediaTask | DocTask
### 监听任务的状态变化
Task.on('status', (status: TaskStatus) => void)

TaskStatus

描述 | 状态 | 状态值
--- | --- | ---
初始状态 | None | 0
切片与计算md5中 | Calculating | 1
等待上传 | WaitingUpload | 2
上传中 | Uploading | 3
等待转码 | WaitingTranscode | 4
上传成功 | Success | 5
上传失败 | Failure | 6
转码失败 | TranscodeFail | 7
已终止 | Aborted | 8

### 监听任务的上传进度
Task.on('progress', (progress: string) => void)
progress为百分制、小数点后两位的值。