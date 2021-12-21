/**
 * 异步处理线程池
 * limit: 限制并发数
 * jobs: 任务
 * iteratorFn: 迭代函数，返回一个promise对象
 */
export default async <T>(limit: number, jobs: T[], iteratorFn: (job: T) => Promise<unknown>) => {
    const all = []; // 所有任务
    const executing: unknown[] = []; // 执行中的任务

    for (const job of jobs) {
        // 创建异步任务
        const p = Promise.resolve().then(() => iteratorFn(job));
        all.push(p);

        // 如果限制并发数小于任务总数，则进行并发控制
        if (limit <= jobs.length) {
            const e: Promise<unknown> = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);

            // 线程池饱和时，等待最快的异步任务完成
            if (executing.length >= limit) {
                await Promise.race(executing)
            }
        }
    }
    return Promise.all(all);
}