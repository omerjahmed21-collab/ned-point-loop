#!/usr/bin/env bash
# Starts the backend (Django, port 8000) and frontend (React, port 5173) together.
# Run:  bash run.sh      Stop: Ctrl+C
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
fi

(cd backend && source venv/bin/activate && python manage.py runserver 0.0.0.0:8000) &
BACKEND_PID=$!
trap "kill $BACKEND_PID 2>/dev/null" EXIT

sleep 2
echo ""
echo "  App:   http://localhost:5173"
echo "  Admin: http://localhost:5173/admin   (admin / admin12345)"
echo ""
cd frontend && npm run dev
