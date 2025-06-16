# 🚀 การ Deploy Meeting Room Booking System

## สำหรับ Production Server

### 1. เตรียมไฟล์ในเซิร์ฟเวอร์

อัปโหลดไฟล์เหล่านี้ไปยังเซิร์ฟเวอร์:
- `Dockerfile`
- `docker-compose.yml`
- `entrypoint.sh`
- `package.json`
- `package-lock.json`
- โฟลเดอร์ `src/`
- โฟลเดอร์ `prisma/`
- `next.config.js`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`

### 2. ตั้งค่า Environment Variables (ถ้าต้องการปรับแต่ง)

สร้างไฟล์ `.env` (copy จาก `env.example`):
```bash
cp env.example .env
nano .env
```

**หรือไม่ต้องสร้าง .env ก็ได้** ระบบจะใช้ค่า default:
- DB_PASSWORD: `armoff122`
- NEXTAUTH_SECRET: `armboy122`
- NEXTAUTH_URL: `https://meeting-room.akin.love`
- APP_PORT: `3000`
- DB_PORT: `5432`

### 3. รันในเซิร์ฟเวอร์

```bash
# สร้างและรัน containers
docker-compose up -d --build

# ตรวจสอบสถานะ
docker-compose ps

# ดู logs
docker-compose logs -f app
```

### 4. การอัปเดต

```bash
# Pull โค้ดใหม่
git pull

# Rebuild และ restart
docker-compose up -d --build

# ทำความสะอาด images เก่า
docker image prune -f
```

### 5. Backup Database

```bash
# Backup
docker-compose exec postgres pg_dump -U admin meeting_rooms > backup.sql

# Restore
docker-compose exec -T postgres psql -U admin meeting_rooms < backup.sql
```

## Features ของ Production Setup

✅ **Auto Database Initialization**: ตรวจสอบและสร้างฐานข้อมูลอัตโนมัติ
✅ **Smart Seeding**: รัน seed เฉพาะครั้งแรกเท่านั้น
✅ **Health Checks**: ตรวจสอบสถานะเซอร์วิส
✅ **Auto Restart**: restart อัตโนมัติเมื่อมีปัญหา
✅ **Environment Variables**: ใช้ env vars สำหรับการตั้งค่า
✅ **Network Isolation**: แยก network สำหรับความปลอดภัย
✅ **Optimized Image**: ลดขนาด Docker image

## การใช้งานแบบง่าย

### ครั้งแรก:
```bash
docker-compose up -d --build
```

### อัปเดตโปรเจค:
```bash
git pull && docker-compose up -d --build
```

## หมายเหตุ

- ครั้งแรกที่รันจะใช้เวลานานเล็กน้อยเพื่อ build image และ seed database
- หลังจากนั้นจะเริ่มได้เร็วขึ้น
- Database จะถูกเก็บใน Docker volume ดังนั้นข้อมูลจะไม่หายแม้ restart container
- ไม่จำเป็นต้องสร้างไฟล์ .env หากใช้ค่า default 