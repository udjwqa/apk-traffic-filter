#!/bin/bash
set -e

echo "=== Panel Deploy Script ==="
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js не найден. Установи:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "Нужен Node.js 20+, сейчас стоит $(node -v)"
    exit 1
fi

echo "[1/6] Node.js $(node -v) — ок"

# Проверка .env
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        SECRET=$(openssl rand -hex 32)
        sed -i "s|сгенерируй-через-openssl-rand-hex-32|$SECRET|g" .env
        echo "[2/6] .env создан из шаблона, AUTH_SECRET сгенерирован"
    else
        echo ".env.example не найден!"
        exit 1
    fi
else
    echo "[2/6] .env уже существует — пропускаю"
fi

# Зависимости
echo "[3/6] Устанавливаю зависимости..."
npm install --production=false 2>&1 | tail -1

# Prisma
echo "[4/6] Подготавливаю базу данных..."
npx prisma generate 2>&1 | tail -1
npx prisma db push 2>&1 | tail -1
npx tsx prisma/seed.ts 2>&1

# Билд
echo "[5/6] Собираю проект..."
npm run build 2>&1 | tail -3

echo "[6/6] Готово!"
echo ""
echo "Запуск:"
echo "  npm start                         — обычный запуск"
echo "  pm2 start npm --name panel -- start  — через PM2"
echo ""
echo "Логин: admin@panel.local / admin123"
echo "Порт: http://localhost:3000"
