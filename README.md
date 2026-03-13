# gameHub

游戏集合中心 - 支持多款游戏的统一管理和运行

## 开发

```bash
# Web开发模式
npm run dev

# Electron开发模式
npm run dev:electron

# 构建Web版本
npm run build

# 构建Electron版本
npm run build:electron
```

## Git推送脚本

项目内置了Git推送辅助脚本，自动处理代理和认证。

### 使用方法

**Windows CMD:**
```bash
scripts\git-push.bat "提交信息"
```

**Git Bash / WSL:**
```bash
bash scripts/git-push.sh "提交信息"
```

### 配置

设置环境变量 `GITHUB_TOKEN` 用于认证（可选）：

```bash
# Windows (PowerShell)
$env:GITHUB_TOKEN = "your_token_here"

# Linux/Mac
export GITHUB_TOKEN="your_token_here"
```

GitHub Token 创建地址: https://github.com/settings/tokens/new

### 脚本功能

- 自动设置代理 (192.168.31.30:7890)
- 自动提交未提交的变更
- 支持 GitHub Token 认证
- 推送完成后自动清理代理配置
- 推送完成后自动清理URL中的Token
