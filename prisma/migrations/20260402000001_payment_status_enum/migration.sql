-- Create PaymentStatus enum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- Convert Payment.status column from TEXT to the new enum
ALTER TABLE "Payment"
  ALTER COLUMN "status" TYPE "PaymentStatus"
  USING "status"::"PaymentStatus";

-- Add Review unique constraint (needed for upsert)
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_userId_productId_key" UNIQUE ("userId", "productId");
