import {
    nodeResolve
} from '@rollup/plugin-node-resolve'; // 解析代码中依赖的node_modules
import commonjs from '@rollup/plugin-commonjs'; //  commonjs 转换
import {
    terser
} from "rollup-plugin-terser"; // 压缩js代码,包括es6代码压缩
import serve from "rollup-plugin-serve"; // 本地起服务调试
import eslint from '@rollup/plugin-eslint'; // eslint插件
import typescript from '@rollup/plugin-typescript'; // 转换ts代码

const isNeedPure = process.env.NEED_PURE || process.env.NEED_PURE === 'production' || false;
const isProd = process.env.NODE_ENV === 'production'

const config = {
    input: 'src/index.ts',
    output: {
        file: `dist/index.min.js`,
        name: 'MdcUploader',
        format: 'umd',
        sourcemap: true,
        globals: {
            process: 'process'
        }
    },
    plugins: [
        eslint({
            include: ['src/!**/*.ts']
        }),
        nodeResolve({
            preferBuiltins: false
        }),
        commonjs(),
        typescript(),
        isNeedPure && terser({
            compress: {
                pure_funcs: ['console.log'] // 去掉console.log函数
            }
        }),
        !isProd && serve({
            open: true, // 自动打开页面
            port: 8080,
            openPage: '/demo/index.html', // 打开的页面
            contentBase: '',
        })
    ]
};

export default config