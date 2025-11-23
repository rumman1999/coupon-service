# 🏷️ Coupons Service — Scalable Node.js + TypeScript Architecture

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-blue?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

A **production-ready Coupon Management & Discount Engine**, built using Node.js, TypeScript, Prisma, and Express, designed to support multiple coupon types, maintain clean separation of concerns, and allow easy future extensions.

This project was developed as part of the **Monk Commerce 2025 Backend Developer Task**.

---

## 🧩 Core Architecture

### 1️⃣ Strategy Pattern for Coupon Types
Each coupon type has:
- Dedicated **DTO**
- Independent **Strategy class**
- Shared **BaseStrategy interface**
- **StrategyFactory** resolves the appropriate strategy

Example structure:

src/modules/coupons/strategies/
├─ base.strategy.ts
├─ cartWise.strategy.ts
├─ productWise.strategy.ts
├─ bxgy.strategy.ts
└─ strategyFactory.ts

yaml
Copy code

> ✅ Open for extension, closed for modification (OCP) — ideal for a growing e-commerce coupon system.

---

### 2️⃣ Repository Pattern
All database interactions are abstracted via repository classes:

coupon.repository.interface.ts
coupon.repository.ts

yaml
Copy code

Benefits:
- Swap database (Prisma → MongoDB / MySQL / Redis) without touching service logic
- Unit test with mocked repositories

---

### 3️⃣ DTO + Validation Layer
- All inputs validated via **Zod schemas**:
  - `createCoupon.dto.ts`
  - `applyCoupon.dto.ts`
  - `applicableCoupons.dto.ts`
- `ValidationMiddleware` ensures:
  - ✅ Strict typing
  - ✅ Sanitized payloads
  - ❌ Malformed data never reaches business logic

---

### 4️⃣ Consistent Error Handling
Global error handler returns structured responses:

```json
{ 
  "success": false,
  "message": "Coupon not found",
  "statusCode": 404
}
📁 Project Structure
pgsql
Copy code
project-root/
├─ src/
│  ├─ app.ts                 → Express App Bootstrap
│  ├─ server.ts              → HTTP Server
│  ├─ config/                → Env/Config Setup
│  ├─ infrastructure/
│  │  ├─ redis/redisClient.ts
│  │  └─ db/prismaClient.ts
│  ├─ common/
│  │  ├─ errors/ApiError.ts
│  │  └─ middlewares/
│  │     ├─ errorMiddleware.ts
│  │     └─ validationMiddleware.ts
│  ├─ modules/
│  │  └─ coupons/
│  │     ├─ controllers/
│  │     ├─ dto/
│  │     ├─ models/
│  │     ├─ repository/
│  │     ├─ service/
│  │     ├─ strategies/
│  │     └─ routes.ts
├─ prisma/schema.prisma
├─ package.json
└─ README.md
⚡ Features
✅ Implemented / Partially Implemented
Cart-wise, product-wise, and BxGy coupon strategies

Modular, extensible architecture

DTO + Zod validation

Repository pattern for DB abstraction

Basic single-coupon application

🟡 Partially Implemented
Mixed discounts (percentage + flat)

Coupon usage counters (global / per-user)

Priority-based evaluation for multiple coupons (currently single coupon applied)

🔴 Planned / Future Enhancements
Auto-applicable best coupon selection

Customer-segment / user-based rules (first order, VIP tiers)

Category-wise coupons

Vendor-restricted coupons

Stackable vs non-stackable coupon rules

🚀 Setup & Running
Install Dependencies

bash
Copy code
npm install
Generate Prisma Client & Migrate DB

bash
Copy code
npx prisma generate
npx prisma migrate dev --name init
Start Development Server

bash
Copy code
npm run dev
🛠️ Tech Stack
Node.js + TypeScript

Express.js

Prisma ORM

Redis caching

Zod for validation

Strategy Pattern for coupon logic

📖 Contributing
Contributions are welcome!
Please fork the repo, create a feature branch, and submit a PR.