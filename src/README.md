# Coupons Service (Express + TypeScript + PostgreSQL + Redis)

This project is a scaffold for the Monk Commerce coupon task. It implements a class-based Express app with a strategy pattern for coupons and Redis caching.

## Local dev (Docker)
1. Copy `.env.example` to `.env` and adjust if needed.
2. Start infra:
   ```bash
   docker-compose up -d
