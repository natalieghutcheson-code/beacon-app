#!/bin/sh

for port in 3000 3001 3002 3003
do
  pid=$(lsof -ti tcp:$port -sTCP:LISTEN 2>/dev/null)

  if [ -n "$pid" ]; then
    echo "Stopping local dev server on port $port (PID $pid)"
    kill $pid 2>/dev/null || true
  fi
done
