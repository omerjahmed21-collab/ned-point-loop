#!/usr/bin/env bash
# One-time setup for NED Point Loop. Run:  bash setup.sh
set -e
cd "$(dirname "$0")"

echo "==> Backend: creating Python environment"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -q -r requirements.txt

echo "==> Backend: creating database and demo data"
python manage.py makemigrations accounts transport tracking passes -v0
python manage.py migrate -v0
python manage.py seed_demo
deactivate
cd ..

echo "==> Frontend: installing packages (takes a minute)"
cd frontend
if ! command -v npm >/dev/null 2>&1; then
  export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
fi
npm install --no-audit --no-fund
cd ..

echo ""
echo "Setup complete. Now run:  bash run.sh"
