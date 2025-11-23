#Coupons Service — Scalable Node.js + TypeScript Architecture

A production-ready Coupon Management & Discount Engine, built using Node.js, TypeScript, Prisma, Express, and Strategy Pattern, designed to support multiple coupon types, maintain clean separation of concerns, and allow easy future extensions.

This project is built as part of the Monk Commerce 2025 Backend Developer Task, with strong focus on:

Extensibility: Add new coupon types without touching existing logic

Scalability: Modular architecture with clear boundaries

Clean Code: DTOs, repositories, services, strategies, controllers

Robustness: Typed schema validation (Zod), error handling, middlewares

Performance: In-memory + Redis caching layer (pluggable)

project-root/
├─ src/
│  ├─ app.ts                → Express App Bootstrap
│  ├─ server.ts             → HTTP Server
│  ├─ config/               → Env/Config Setup
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
│  │     ├─ strategies/      ← Strategy Pattern for coupon logic
│  │     └─ routes.ts
├─ prisma/schema.prisma
├─ package.json
└─ README.md

This layout follows modular, domain-driven design ensuring clean scalability as the system grows.


🧩 Core Architecture Decisions
1️⃣ Strategy Pattern for Coupon Types

Each coupon type has:

A dedicated DTO

Independent Strategy class

Shared BaseStrategy interface

A StrategyFactory to resolve appropriate strategy

This ensures new coupon types can be added without touching existing logic.

Example:

strategies/
├─ base.strategy.ts
├─ cartWise.strategy.ts
├─ productWise.strategy.ts
├─ bxgy.strategy.ts
└─ strategyFactory.ts


➡️ Open for extension, closed for modification (OCP) — ideal for a growing e-commerce coupon system.

2️⃣ Repository Pattern

All DB interaction is abstracted under:

coupon.repository.interface.ts
coupon.repository.ts


This lets you:

Replace Prisma with MongoDB / MySQL / Redis / in-memory without touching service logic.

Write unit tests by mocking repository.

3️⃣ DTO + Validation Layer

Every input is validated via Zod schemas:

createCoupon.dto.ts
applyCoupon.dto.ts
applicableCoupons.dto.ts
ValidationMiddleware ensures:

✅ Strict typing
✅ Sanitized incoming data
❌ No malformed payloads reach business logic

4️⃣ Consistent Error Handling

A global error handler ensures structured error responses:

{ 
  "success": false,
  "message": "Coupon not found",
  "statusCode": 404
}

#Setup & Running
Install Dependencies
npm install

Generate Prisma Client & DB Migration
npx prisma generate
npx prisma migrate dev --name init

Start Development Server
npm run dev


=====================================================
🟡 PARTIALLY IMPLEMENTED CASES

The structure supports them, but full logic may be missing.

1. Percentage + Flat Mixed Discounts

Example:

Buy 2 Get 50% off on next item
Your BxGy structure could support this if extended.

2. Coupon Usage Count

Max global uses

Max per-user uses
(Currently not implemented but trivial with Redis counter)

3. Combining Multiple Coupons

Best discount selection

Priority-based evaluation
(Currently, only one coupon is applied at a time)
===========================================================
🔴 UNIMPLEMENTED (BUT DESIGNED FOR FUTURE)


#These are important and common in real e-commerce systems.
1. Auto-applicable Coupons

System automatically picks the best possible coupon.

2. Customer Segment / User-based Rules

Examples:

First order only

New customers

VIP tiers

User-specific coupon code

Can be easily added inside BaseStrategy isApplicable().

3. Category-wise Coupons

Discount applies only to certain product categories.
Requires product catalog service integration.

4. Vendor-restricted Coupons

Example:
“Only valid on Nike products”

Would require an additional field in the schema.

5. Stackable vs Non-stackable Coupons

Right now:
❌ No stacking rules implemented
Future:
✓ Controlled by a stackable: boolean field
