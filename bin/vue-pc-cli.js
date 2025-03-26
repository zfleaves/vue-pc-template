#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');

/**
 * 创建新项目
 */
async function createProject() {
  console.log(chalk.blue('🚀 欢迎使用 Vue PC Template CLI'));
  console.log(chalk.green('💡 这个工具将帮助你快速创建一个基于 Vue 3 的 PC 项目模板\n'));

  // 收集用户输入
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称:',
      default: 'my-vue-app',
      validate: (input) => {
        if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
        return '项目名称只能包含字母、数字、连字符和下划线';
      }
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入项目描述:',
      default: 'A Vue.js project'
    },
    {
      type: 'list',
      name: 'packageManager',
      message: '选择包管理器:',
      choices: ['pnpm', 'npm', 'yarn'],
      default: 'pnpm'
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: '是否立即安装依赖?',
      default: true
    }
  ]);

  const { projectName, description, packageManager, installDeps } = answers;
  const targetDir = path.join(process.cwd(), projectName);

  // 检查目标目录是否已存在
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `目标目录 ${projectName} 已存在，是否覆盖?`,
        default: false
      }
    ]);
    
    if (!overwrite) {
      console.log(chalk.yellow('❌ 操作取消'));
      return;
    }
    
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  // 创建目标目录
  fs.mkdirSync(targetDir, { recursive: true });

  // 复制模板文件
  const spinner = ora('正在创建项目...').start();
  
  try {
    // 复制项目文件，排除不需要的文件/目录
    const excludeDirs = ['.git', 'node_modules', 'dist', 'bin'];
    const excludeFiles = ['.DS_Store'];
    
    // 递归复制文件
    function copyDir(src, dest) {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (excludeDirs.includes(entry.name) || excludeFiles.includes(entry.name)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    
    copyDir(pkgRoot, targetDir);
    
    // 更新 package.json
    const pkgJsonPath = path.join(targetDir, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    
    pkgJson.name = projectName;
    pkgJson.description = description;
    pkgJson.version = '0.1.0';
    
    // 重置 git 仓库信息
    if (pkgJson.repository) {
      pkgJson.repository = {
        type: 'git',
        url: ''
      };
    }
    
    // 移除 bin 配置，因为这是新项目，不需要 CLI 功能
    delete pkgJson.bin;
    
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    
    // 初始化 Git 仓库
    execSync('git init', { cwd: targetDir });
    
    // 创建 .gitignore 文件（如果不存在）
    const gitignorePath = path.join(targetDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, `node_modules/\ndist/\n.DS_Store\n.cache\n`);
    }
    
    spinner.succeed('项目创建成功!');
    
    // 安装依赖
    if (installDeps) {
      spinner.text = '正在安装依赖...';
      spinner.start();
      
      try {
        let command;
        switch (packageManager) {
          case 'yarn':
            command = 'yarn';
            break;
          case 'pnpm':
            command = 'pnpm install';
            break;
          default:
            command = 'npm install';
        }
        
        execSync(command, { cwd: targetDir, stdio: 'inherit' });
        spinner.succeed('依赖安装完成!');
      } catch (error) {
        spinner.fail('依赖安装失败，请手动安装');
        console.error(error);
      }
    }
    
    // 显示成功信息
    console.log('\n🎉 项目创建成功!');
    console.log('\n📁 项目结构:');
    console.log(chalk.green(`  ${projectName}/`));
    
    console.log('\n👉 后续步骤:');
    console.log(chalk.cyan(`  cd ${projectName}`));
    if (!installDeps) {
      console.log(chalk.cyan(`  ${packageManager === 'yarn' ? 'yarn' : `${packageManager} install`}`));
    }
    console.log(chalk.cyan(`  ${packageManager === 'yarn' ? 'yarn dev' : `${packageManager} run dev`}`));
    
    console.log('\n📚 更多信息请查看 README.md');
    console.log(chalk.blue('\n感谢使用 Vue PC Template CLI! 🙏\n'));
    
  } catch (error) {
    spinner.fail('项目创建失败');
    console.error(error);
  }
}

// 执行主函数
createProject().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});