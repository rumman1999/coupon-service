-- CreateTable
CREATE TABLE "CouponUsageCounter" (
    "couponId" TEXT NOT NULL,
    "remainingUses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CouponUsageCounter_pkey" PRIMARY KEY ("couponId")
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT,
    "requestId" TEXT,
    "discount" DOUBLE PRECISION NOT NULL,
    "cart" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");

-- CreateIndex
CREATE INDEX "CouponUsage_userId_idx" ON "CouponUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_userId_couponId_requestId_key" ON "CouponUsage"("userId", "couponId", "requestId");

-- AddForeignKey
ALTER TABLE "CouponUsageCounter" ADD CONSTRAINT "CouponUsageCounter_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
