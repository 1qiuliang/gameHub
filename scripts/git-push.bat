@echo off
REM Git Push Helper Script for Windows
REM 用法: scripts\git-push.bat "commit message"
REM 需要设置环境变量 GITHUB_TOKEN 或在脚本中配置

setlocal enabledelayedexpansion

set COMMIT_MSG=%~1
if "%COMMIT_MSG%"=="" set COMMIT_MSG=update
set PROXY=192.168.31.30:7890

echo === Git Push Helper ===

REM 检查是否在git仓库中
if not exist ".git" (
    echo 错误: 当前目录不是git仓库
    exit /b 1
)

REM 获取远程仓库URL
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set REMOTE_URL=%%i

if "%REMOTE_URL%"=="" (
    echo 错误: 没有配置远程仓库
    exit /b 1
)

echo 仓库: %REMOTE_URL%

REM 检查是否有变更需要提交
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=*" %%i in ('git status --porcelain') do (
        set HAS_CHANGES=1
    )
)

if "%HAS_CHANGES%"=="1" (
    echo 有未提交的变更，正在提交...
    git add .
    git commit -m "%COMMIT_MSG%"
    echo 提交完成
)

REM 设置代理
echo 设置代理: %PROXY%
git config --global http.proxy http://%PROXY%
git config --global https.proxy http://%PROXY%

REM 推送
if "%GITHUB_TOKEN%"=="" (
    echo 没有配置Token，尝试直接推送...
    git push
) else (
    REM 提取仓库信息
    for /f "tokens=2 delims=:" %%i in ("%REMOTE_URL%") do set REPO_PATH=%%i
    set REPO_PATH=!REPO_PATH:/=\=!
    set REPO_PATH=!REPO_PATH:.git=!

    REM 临时设置带token的URL
    for /f "tokens=*" %%i in ('echo !REMOTE_URL!') do set ORIGINAL_URL=%%i
    git remote set-url origin https://%GITHUB_TOKEN%@github.com/!REPO_PATH!.git

    echo 正在推送...
    git push

    REM 恢复原始URL
    git remote set-url origin !ORIGINAL_URL!
)

REM 清理代理
echo 清理代理配置...
git config --global --unset http.proxy
git config --global --unset https.proxy

echo 完成！