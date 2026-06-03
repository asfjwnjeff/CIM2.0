#!/bin/bash
# 停止后台开发服务器
set -Eeuo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.."
PROJECT="$(pwd)"
PID_FILE="$PROJECT/.dev-pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "开发服务器未在运行（找不到 PID 文件）"
  exit 0
fi

PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
  echo "正在停止开发服务器 (PID: $PID)..."
  kill -15 "$PID" 2>/dev/null || true
  sleep 1
  # 如果还没死，强杀
  if kill -0 "$PID" 2>/dev/null; then
    kill -9 "$PID" 2>/dev/null || true
  fi
  echo "✓ 已停止"
else
  echo "进程 $PID 未在运行，清理 PID 文件"
fi
rm -f "$PID_FILE"
