import calcFileMD5 from './calc-file-md5';
import asyncThreadPool from './async-thread-pool';

const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const random = (seed: number) => {
    return Math.floor(Math.random() * seed);
}

const stringify = (params: any) => {
    const arr: string[] = [];
    if (Object.prototype.toString.call(params) === '[object Object]') {
        Object.keys(params).map(key => {
            arr.push(`${key}=${params[key]}`)
        })
        return arr.join('&')
    }
}

const isVideo = (file: File | null) => {
    if (!file) return false;
    return file.type.startsWith('video/')
}

const isAudio = (file: File | null) => {
    if (!file) return false;
    return file?.type.startsWith('audio/')
}

const secondsFormatDate = (seconds: number) => {
    const padZero = (v: number) => {
        if (v >= 10) return v.toString();
        return `0${v}`;
    }
    const h = Math.floor((seconds / 3600) % 24);
    const m = Math.floor((seconds / 60) % 60);
    const s = Math.floor(seconds % 60);
    return `${padZero(h)}:${padZero(m)}:${padZero(s)}`;
}

export {
    isVideo,
    isAudio,
    sleep,
    secondsFormatDate,
    stringify,
    random,
    calcFileMD5,
    asyncThreadPool
}