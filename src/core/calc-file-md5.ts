import { FileSizeBenchmark, MaxFileChunkNumber } from "../constants/index";
import SparkMD5 from 'spark-md5';

const slice = File.prototype.slice || (File.prototype as any).mozSlice || (File.prototype as any).webkitSlice;

/**
 * 计算文件md5值，同时得到文件分片数据
 * 如果文件未超出大文件基准值，则不分片，超出分片
 * file: File 文件
 * chunkSize: number 分片大小
 * @return Promise<string> 返回md5值
 */
export default (file: File, chunkSize: number): Promise<{md5: string, chunks: Blob[]}> => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        const spark = new SparkMD5.ArrayBuffer();
        const chunks: Blob[] = [];

        fileReader.onerror = () => {
            reject();
        }

        if (file.size <= FileSizeBenchmark) {
            fileReader.readAsBinaryString(file);
            fileReader.onload = e => {
                const md5 = SparkMD5.hashBinary((e.target as any).result);
                console.log('file md5 hash completed');
                resolve({
                    md5,
                    chunks: [file]
                });
            }
            return;
        }

        console.log('开始对文件进行分片')

        const chunksLength = Math.ceil(file.size / chunkSize);
        let currentIndex = 0;

        if (chunksLength > MaxFileChunkNumber) {
            reject('超过了最大分片数，请调整分片大小')
        }

        const load = () => {
            const start = currentIndex * chunkSize;
            const end = (start + chunkSize >= file.size) ? file.size : (start + chunkSize);
            const chunk = slice.call(file, start, end);
            chunks.push(chunk);
            fileReader.readAsArrayBuffer(chunk);
        }

        fileReader.onload = e => {
            spark.append((e.target as any).result);
            currentIndex++;
            if (currentIndex < chunksLength) {
                load();
            } else {
                console.log('file md5 hash completed');
                resolve({
                    md5: spark.end(),
                    chunks
                });
            }
        }

        load();
    })
}