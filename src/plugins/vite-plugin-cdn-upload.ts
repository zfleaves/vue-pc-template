import type { Plugin } from 'vite';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import { debug } from 'node:console';

export interface CDNUploadOptions {
    /** CDN配置 */
    cdn?: {
        /** CDN上传地址 */
        uploadUrl?: string;
        /** CDN访问域名 */
        domain?: string;
        /** 认证信息 */
        auth?: {
            accessKey?: string;
            secretKey?: string;
        };
    };
    /** 环境配置 */
    env?: {
        /** 当前环境 */
        current?: 'production' | 'test' | 'dev';
        /** 环境路径映射 */
        paths?: {
            production?: string;
            test?: string;
            dev?: string;
        };
    };
    /** 图片处理配置 */
    image?: {
        /** 是否转换为WebP */
        toWebp?: boolean;
        /** 最大宽度 */
        maxWidth?: number;
        /** 压缩质量 */
        quality?: number;
    };
    /** 重试配置 */
    retry?: {
        /** 最大重试次数 */
        maxAttempts?: number;
        /** 重试延迟（毫秒） */
        delay?: number;
    };
}

const defaultOptions: CDNUploadOptions = {
    cdn: {
        uploadUrl: 'https://default-cdn-upload-url.com/upload',
        domain: 'https://default-cdn-domain.com',
        auth: {
            accessKey: '',
            secretKey: ''
        }
    },
    env: {
        current: 'dev',
        paths: {
            production: 'production/assets',
            test: 'testing/assets',
            dev: 'development/assets'
        }
    },
    image: {
        toWebp: true,
        maxWidth: 2000,
        quality: 75
    },
    retry: {
        maxAttempts: 3,
        delay: 1000
    }
};

interface CacheRecord {
    hash: string;
    cdnUrl: string;
    timestamp: number;
}

export default function cdnUploadPlugin(options: Partial<CDNUploadOptions> = {}): Plugin {
    // 深度合并用户配置和默认配置
    const mergedOptions = mergeDeep(defaultOptions, options) as CDNUploadOptions;

    // 获取当前环境，优先使用配置中的环境，其次使用process.env.NODE_ENV
    const currentEnv = mergedOptions.env?.current || process.env.NODE_ENV || 'development';
    // 判断是否为开发环境
    const isDev = currentEnv === 'dev' || currentEnv === 'development';
    console.log('isDev: ', isDev);

    // 定义缓存文件路径
    const CACHE_FILE = path.resolve('.cdn-cache.json');
    // 初始化缓存对象
    let cache: Record<string, CacheRecord> = {};

    // 深度合并函数，递归合并对象
    function mergeDeep(target: any, source: any): any {
        if (typeof target !== 'object' || typeof source !== 'object') return source;
        for (const key in source) {
            if (typeof source[key] === 'object' && source[key] !== null) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
        return target;
    }

    // 加载缓存文件
    async function loadCache() {
        try {
            const data = await fs.readFile(CACHE_FILE, 'utf-8');
            cache = JSON.parse(data);
        } catch {
            cache = {};
        }
    }

    // 保存缓存到文件
    async function saveCache() {
        await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    }

    // 计算文件的MD5哈希值
    async function calculateHash(buffer: Buffer): Promise<string> {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }

    // 上传文件到CDN，支持重试机制
    async function uploadToCDN(buffer: Buffer, fileName: string): Promise<string> {
        const maxAttempts = mergedOptions.retry?.maxAttempts || 3;
        const delay = mergedOptions.retry?.delay || 1000;

        // 添加文件大小限制（例如：10MB）
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds the limit of ${MAX_FILE_SIZE} bytes`);
        }

        // 定义上传函数
        const uploadFn = async () => {
            const formData = new FormData();
            formData.append('file', buffer, {
                filename: fileName,
                contentType: 'application/octet-stream'
            });
            formData.append('auth', JSON.stringify(mergedOptions.cdn?.auth || {}));

            if (!mergedOptions.cdn?.uploadUrl) {
                throw new Error('CDN upload URL is not configured');
            }

            const response = await axios.post(mergedOptions.cdn.uploadUrl, formData, {
                headers: formData.getHeaders(),
                timeout: 30000,
                maxContentLength: MAX_FILE_SIZE,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            });

            if (response.status === 200 && response.data.url) {
                return response.data.url;
            }

            throw new Error(`Upload failed: ${response.statusText}`);
        };

        // 定义重试函数
        const request = async (attemptsLeft: number): Promise<string> => {
            try {
                return await uploadFn();
            } catch (error) {
                if (attemptsLeft <= 1) {
                    throw new Error('Upload failed after all attempts');
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                console.log(`[cdn-upload] Retrying upload for ${fileName} (attempt ${maxAttempts - attemptsLeft + 2}/${maxAttempts})`);
                return request(attemptsLeft - 1);
            }
        };
        return request(maxAttempts);
    }

    // 返回Vite插件对象
    return {
        name: 'cdn-upload',

        // 在构建开始时加载缓存
        async buildStart() {
            await loadCache();
        },

        // 在生成bundle时处理每个文件
        async generateBundle(_, bundle) {
            // 在开发环境下跳过 CDN 上传
            if (isDev) {
                console.log('[cdn-upload] Skipping CDN upload in development environment');
                return;
            }

            // 获取当前环境和对应的CDN路径
            const env = mergedOptions.env?.current || 'dev';
            const envPath = mergedOptions.env?.paths?.[env];

            // 如果未配置当前环境的路径，发出警告并返回
            if (!envPath) {
                console.warn(`[cdn-upload] No path configured for environment: ${env}`);
                return;
            }

            // 遍历bundle中的所有文件
            // Object.values(bundle)
            // console.log('Object.values(outBundle): ', Object.values(bundle));
            for (const [fileName, chunk] of Object.entries(bundle)) {
                // 跳过没有source属性的chunk
                if (!('source' in chunk)) continue;
                console.log('fileName: ', fileName);

                // 获取文件内容并转换为Buffer
                const source = chunk.source;
                const buffer = typeof source === 'string' ? Buffer.from(source, 'utf8') : Buffer.from(source);
                // 计算文件的MD5哈希值
                const hash = await calculateHash(buffer);

                // 检查缓存，如果文件未改变则跳过上传
                if (cache[fileName] && cache[fileName].hash === hash) {
                    console.log(`[cdn-upload] Skipping ${fileName} (unchanged)`);
                    continue;
                }

                try {
                    // 构建CDN路径，替换Windows路径分隔符
                    const cdnPath = path.join(envPath, fileName).replace(/\\/g, '/');

                    // 上传文件到CDN
                    // const cdnUrl = await uploadToCDN(buffer, cdnPath);
                    const cdnUrl = 'https://cdn.example.com/path/to/your/file' + fileName + '/'
                    console.log('cdnUrl: ', cdnUrl);

                    // 更新缓存记录
                    cache[fileName] = {
                        hash,
                        cdnUrl,
                        timestamp: Date.now()
                    };

                    // 如果chunk包含代码，替换其中的资源URL
                    if ('code' in chunk && typeof chunk.code === 'string') {
                        chunk.code = chunk.code.replace(
                            new RegExp(`/${fileName}`, 'g'),
                            cdnUrl
                        );
                    }

                    // 如果是HTML文件，替换其中的src路径
                    if (fileName.endsWith('.html') && 'source' in chunk) {
                        const htmlContent = typeof chunk.source === 'string' 
                            ? chunk.source 
                            : chunk.source.toString();
                        
                        // 对fileName进行转义，以避免正则表达式中的特殊字符问题
                        const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        
                        // 替换所有src属性中的路径
                        chunk.source = htmlContent.replace(
                            new RegExp(`src=["'](.*?)${escapedFileName}["']`, 'g'),
                            `src="${cdnUrl}"`
                        );
                    }

                    // 记录上传成功日志
                    console.log(`[cdn-upload] Successfully uploaded ${fileName} to ${cdnUrl}`);
                } catch (error) {
                    // 捕获并记录上传错误
                    console.error(`[cdn-upload] Failed to upload ${fileName}:`, error);
                    // 上传失败时不修改原始文件
                }
            }

            // 保存更新后的缓存
            await saveCache();
        },

        // 在构建结束时清理过期缓存
        closeBundle: {
            sequential: true,
            async handler() {
                // 清理过期缓存（一周）
                const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
                const now = Date.now();

                for (const [fileName, record] of Object.entries(cache)) {
                    if (now - record.timestamp > ONE_WEEK) {
                        delete cache[fileName];
                    }
                }

                await saveCache();
            }
        }
    };
}