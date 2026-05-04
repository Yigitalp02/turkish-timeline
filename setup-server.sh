#!/usr/bin/env bash
# setup-server.sh — runs on the Ubuntu server via ssh -t
# Called by deploy.ps1 after the zip has been uploaded to /tmp/yazit-deploy.zip
set -e

SERVER_PATH="${1:-/opt/stack/yazit}"
SERVER_USER="${2:-bilgin}"
DATA_PATH="/home/bilgin/yazit"

echo "  -> Ensuring required tools are installed"
MISSING=()
command -v unzip &> /dev/null || MISSING+=("unzip")
command -v rsync &> /dev/null || MISSING+=("rsync")
if [ ${#MISSING[@]} -gt 0 ]; then
    sudo apt-get install -y "${MISSING[@]}"
fi

echo "  -> Creating project directory $SERVER_PATH"
sudo mkdir -p "$SERVER_PATH"
sudo chown "${SERVER_USER}:${SERVER_USER}" "$SERVER_PATH"

# Ensure the user is in the docker group (avoids needing sudo for docker commands)
if ! groups "$SERVER_USER" | grep -q docker; then
    echo "  -> Adding $SERVER_USER to docker group (re-login required after first deploy)"
    sudo usermod -aG docker "$SERVER_USER"
fi

echo "  -> Creating data directories $DATA_PATH"
mkdir -p "$DATA_PATH/postgres" "$DATA_PATH/media"

echo "  -> Extracting deployment archive"
rm -rf /tmp/yazit-source
mkdir -p /tmp/yazit-source
cd /tmp/yazit-source && unzip -q /tmp/yazit-deploy.zip

echo "  -> Syncing files to $SERVER_PATH"
# --exclude=.env ensures the server's .env is never overwritten or deleted by a deploy
sudo rsync -a --delete --exclude='.env' /tmp/yazit-source/ "$SERVER_PATH/"

echo "  -> Cleaning up"
rm -rf /tmp/yazit-source /tmp/yazit-deploy.zip

echo "Setup complete"
