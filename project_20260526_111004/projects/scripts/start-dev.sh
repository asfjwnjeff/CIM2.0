#!/bin/bash
# 后台启动开发服务器（关终端后继续运行）
set -Eeuo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.."
PROJECT="$(pwd)"
PID_FILE="$PROJECT/.dev-pid"
LOG_FILE="$PROJECT/logs/dev.log"

mkdir -p "$PROJECT/logs"

# 检查是否已在运行
if [[ -f "$PID_FILE" ]]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "开发服务器已在运行 (PID: $OLD_PID)"
    echo "访问: http://localhost:5000"
    exit 0
  fi
fi

# 后台启动
echo "启动开发服务器..."
nohup bash "$DIR/dev.sh" > "$LOG_FILE" 2>&1 &
PID=$!
echo $PID > "$PID_FILE"

sleep 2
if kill -0 "$PID" 2>/dev/null; then
  echo "✓ 开发服务器已启动 (PID: $PID)"
  echo "  访问: http://localhost:5000"
  echo "  日志: tail -f $LOG_FILE"
  echo "  停止: pnpm stop-dev"
else
  echo "✗ 启动失败，查看日志: $LOG_FILE"
  rm -f "$PID_FILE"
  exit 1
fi
