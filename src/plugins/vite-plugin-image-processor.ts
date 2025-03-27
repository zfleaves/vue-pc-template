import type { Plugin } from 'vite';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

/**
 * 图像处理插件选项
 */
export interface ImageProcessorOptions {
    /**
     * 是否转换为WebP格式
     * @default true
     */
    toWebp?: boolean;
    
    /**
     * 最大宽度限制（像素）
     * @default 2000
     */
    maxWidth?: number;
    
    /**
     * 图像质量（1-100）
     * @default 75
     */
    quality?: number;
    
    /**
     * 输出目录
     * @default 'dist'
     */
    outputDir?: string;
    
    /**
     * 是否保留原始文件
     * @default false
     */
    keepOriginal?: boolean;
}

/**
 * 图像处理插件
 * - 自动转换图像为WebP格式
 * - 限制图像最大宽度
 * - 控制压缩质量
 */
// 图像处理插件的主函数，接收配置选项并返回Vite插件对象
export default function imageProcessorPlugin(options: ImageProcessorOptions = {}): Plugin {
    // 解构配置选项，设置默认值
    const {
        toWebp = true,        // 是否转换为WebP格式，默认true
        maxWidth = 2000,      // 最大宽度限制，默认2000像素
        quality = 75,         // 图像质量，默认75
        outputDir = 'dist',   // 输出目录，默认'dist'
        keepOriginal = false   // 是否保留原始文件，默认false
    } = options;

    // 检查是否已安装sharp库
    let sharp: any;
    try {
        sharp = require('sharp');
    } catch (e) {
        // 如果未安装sharp，输出警告信息
        console.warn('[image-processor] Sharp is not installed. Image processing will be skipped.');
        console.warn('[image-processor] Install it with: npm install sharp');
    }

    // 返回Vite插件对象
    return {
        name: 'vite-plugin-image-processor',  // 插件名称
        
        // writeBundle钩子函数，在构建完成后执行
        async writeBundle(_, bundle) {
            // 如果没有安装sharp，跳过处理
            if (!sharp) return;
            
            // 遍历bundle中的所有文件
            for (const [fileName, asset] of Object.entries(bundle)) {
                // 只处理图像文件（jpg, jpeg, png, gif, webp）
                if (!fileName.match(/\.(jpe?g|png|gif|webp)$/i) || !('source' in asset)) {
                    continue;
                }
                
                try {
                    // 获取文件内容并转换为Buffer
                    const source = asset.source;
                    const buffer = typeof source === 'string' ? Buffer.from(source, 'utf8') : Buffer.from(source);
                    
                    // 创建Sharp实例并获取图像元数据
                    let image = sharp(buffer);
                    const metadata = await image.metadata();
                    
                    // 如果图像宽度超过最大限制，调整大小
                    if (maxWidth && metadata.width && metadata.width > maxWidth) {
                        image = image.resize(maxWidth, null, {
                            withoutEnlargement: true,  // 不放大小于最大宽度的图像
                        });
                    }
                    
                    // 如果需要转换为WebP格式且文件不是WebP格式
                    if (toWebp && !fileName.endsWith('.webp')) {
                        // 生成新的WebP文件名
                        const webpFileName = fileName.replace(/\.[^.]+$/, '.webp');
                        const webpOutputPath = path.join(outputDir, webpFileName);
                        
                        // 确保输出目录存在
                        const dir = path.dirname(webpOutputPath);
                        if (!existsSync(dir)) {
                            await fs.mkdir(dir, { recursive: true });
                        }
                        
                        // 保存WebP文件
                        await image
                            .webp({ quality })  // 设置WebP质量
                            .toFile(webpOutputPath);
                        
                        // 输出转换日志
                        console.log(`[image-processor] Converted ${fileName} to WebP: ${webpFileName}`);
                        
                        // 如果不保留原始文件，删除它
                        if (!keepOriginal) {
                            const originalPath = path.join(outputDir, fileName);
                            if (existsSync(originalPath)) {
                                await fs.unlink(originalPath);
                                console.log(`[image-processor] Removed original file: ${fileName}`);
                            }
                        }
                    } else if (metadata.width && metadata.width > maxWidth) {
                        // 如果不转换为WebP但需要调整大小，覆盖原始文件
                        const outputPath = path.join(outputDir, fileName);
                        
                        // 确保输出目录存在
                        const dir = path.dirname(outputPath);
                        if (!existsSync(dir)) {
                            await fs.mkdir(dir, { recursive: true });
                        }
                        
                        // 保存调整大小后的文件
                        await image.toFile(outputPath);
                        console.log(`[image-processor] Resized ${fileName} to ${maxWidth}px width`);
                    }
                } catch (error) {
                    // 捕获并记录处理过程中可能出现的错误
                    console.error(`[image-processor] Error processing ${fileName}:`, error);
                }
            }
        }
    };
}