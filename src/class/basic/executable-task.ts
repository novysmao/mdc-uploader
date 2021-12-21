import { executable } from 'src/service/media';
import { Media } from 'src/types/media';
import { Upload } from 'src/types/upload';
import { sleep } from "../../core/index";

export interface ExecutableTask {
    _option: Upload.ExecutableTaskOption;
}

/**
 * ExecutableTask 排队任务
 */
export class ExecutableTask {

    EXECUTABLE_TASK = true;

    static async _canExecutable(jobId: number) {
        return executable(jobId);
    }

    static async _canExecutableLoop(jobId: number): Promise<Media.ResQueryExecutableData> {
        const res = await this._canExecutable(jobId);
        if (res.canExecutable) {
            return Promise.resolve(res);
        }
        await sleep(1000);
        return this._canExecutableLoop(jobId);
    }
}