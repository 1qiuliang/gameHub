#!/bin/bash

# Git Push Helper Script
# 用法: ./scripts/git-push.sh "commit message" [proxy]
# proxy 可选，默认使用 192.168.31.30:7890

set -e

COMMIT_MSG="${1:-$(git log -1 --pretty=%B 2>/dev/null || echo 'update')}"
PROXY="${2:-192.168.31.30:7890}"
TOKEN=""  # 运行时填入或通过环境变量 GITHUB_TOKEN 提供

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Git Push Helper ===${NC}"

# 检查是否在git仓库中
if [ ! -d ".git" ]; then
    echo -e "${RED}错误: 当前目录不是git仓库${NC}"
    exit 1
fi

# 获取远程仓库URL
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
    echo -e "${RED}错误: 没有配置远程仓库${NC}"
    exit 1
fi

# 提取仓库信息
if [[ "$REMOTE_URL" == *"github.com"* ]]; then
    REPO=$(echo "$REMOTE_URL" | sed -E 's|.*github.com[/:]||; s|\.git$||')
    HOST="github.com"
elif [[ "$REMOTE_URL" == *"gitee.com"* ]]; then
    REPO=$(echo "$REMOTE_URL" | sed -E 's|.*gitee.com[/:]||; s|\.git$||')
    HOST="gitee.com"
else
    echo -e "${RED}错误: 不支持的远程仓库${NC}"
    exit 1
fi

echo "仓库: $HOST/$REPO"

# 检查是否有变更需要提交
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}有未提交的变更，正在提交...${NC}"
    git add .
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}提交完成${NC}"
fi

# 设置代理
echo -e "${YELLOW}设置代理: $PROXY${NC}"
git config --global http.proxy "http://$PROXY"
git config --global https.proxy "http://$PROXY"

# 推送函数
push_with_token() {
    local token="$1"
    local original_url="$2"

    # 保存原始URL
    git remote set-url origin "https://${token}@${HOST}/${REPO}.git"

    # 推送
    echo -e "${YELLOW}正在推送...${NC}"
    if git push; then
        echo -e "${GREEN}推送成功！${NC}"
        RESULT=0
    else
        echo -e "${RED}推送失败${NC}"
        RESULT=1
    fi

    # 恢复原始URL
    git remote set-url origin "$original_url"
    return $RESULT
}

# 尝试推送
if [ -n "$GITHUB_TOKEN" ]; then
    TOKEN="$GITHUB_TOKEN"
fi

if [ -n "$TOKEN" ]; then
    push_with_token "$TOKEN" "$REMOTE_URL"
else
    echo -e "${YELLOW}没有配置Token，尝试直接推送...${NC}"
    git push || {
        echo -e "${RED}推送失败，可能需要认证${NC}"
        echo "请设置环境变量 GITHUB_TOKEN 或在脚本中配置 TOKEN"
        echo "GitHub Token 创建地址: https://github.com/settings/tokens/new"
    }
fi

# 清理代理
echo -e "${YELLOW}清理代理配置...${NC}"
git config --global --unset http.proxy
git config --global --unset https.proxy

echo -e "${GREEN}完成！${NC}"