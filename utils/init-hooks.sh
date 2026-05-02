#!/bin/bash
# 初始化 Git hooks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/hooks"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "初始化 Git hooks..."

# 复制 hooks 到 .git/hooks
for hook in "$HOOKS_DIR"/*; do
    if [ -f "$hook" ] && [ "${hook##*.}" != "example" ]; then
        hook_name=$(basename "$hook")
        cp "$hook" "$GIT_HOOKS_DIR/$hook_name"
        chmod +x "$GIT_HOOKS_DIR/$hook_name"
        echo "  安装: $hook_name"
    fi
done

echo "完成! Hooks 已配置."
echo ""
echo "可选 hook 类型:"
ls "$HOOKS_DIR" | grep -v example
