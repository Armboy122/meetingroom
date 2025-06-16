# 🚀 การ Deploy Meeting Room Booking System

## สำหรับ Production Server

### 1. เตรียมไฟล์ในเซิร์ฟเวอร์

อัปโหลดไฟล์เหล่านี้ไปยังเซิร์ฟเวอร์:
- `Dockerfile`
- `docker-compose.prod.yml`
- `entrypoint.sh`
- `package.json`
- `package-lock.json`
- โฟลเดอร์ `src/`
- โฟลเดอร์ `prisma/`
- `next.config.js`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` (copy จาก `env.example`):
```bash
cp env.example .env
nano .env
```

แก้ไขค่าเหล่านี้:
- `DB_PASSWORD`: รหัสผ่านฐานข้อมูลที่ปลอดภัย
- `NEXTAUTH_SECRET`: สุ่ม secret key ยาวๆ
- `NEXTAUTH_URL`: URL ของเว็บไซต์จริง
- `APP_PORT`: port ที่ต้องการใช้

### 3. รันในเซิร์ฟเวอร์

```bash
# สร้างและรัน containers
docker-compose -f docker-compose.prod.yml up -d --build

# ตรวจสอบสถานะ
docker-compose -f docker-compose.prod.yml ps

# ดู logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### 4. การอัปเดต

```bash
# Pull โค้ดใหม่
git pull

# Rebuild และ restart
docker-compose -f docker-compose.prod.yml up -d --build

# ทำความสะอาด images เก่า
docker image prune -f
```

### 5. Backup Database

```bash
# Backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U admin meeting_rooms > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U admin meeting_rooms < backup.sql
```

## Features ของ Production Setup

✅ **Auto Database Initialization**: ตรวจสอบและสร้างฐานข้อมูลอัตโนมัติ
✅ **Smart Seeding**: รัน seed เฉพาะครั้งแรกเท่านั้น
✅ **Health Checks**: ตรวจสอบสถานะเซอร์วิส
✅ **Auto Restart**: restart อัตโนมัติเมื่อมีปัญหา
✅ **Environment Variables**: ใช้ env vars สำหรับการตั้งค่า
✅ **Network Isolation**: แยก network สำหรับความปลอดภัย
✅ **Optimized Image**: ลดขนาด Docker image

## หมายเหตุ

- ครั้งแรกที่รันจะใช้เวลานานเล็กน้อยเพื่อ build image และ seed database
- หลังจากนั้นจะเริ่มได้เร็วขึ้น
- Database จะถูกเก็บใน Docker volume ดังนั้นข้อมูลจะไม่หายแม้ restart container 