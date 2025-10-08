-- CreateExtension: Activer l'extension pour gen_random_uuid si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migration: Ajout des colonnes manquantes aux tables existantes
-- AddColumn: photo to User
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "photo" TEXT;

-- AddColumn: category to Subject  
ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'general';

-- AddColumn: capacity and current_enrollment to Class
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "capacity" INTEGER;
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "current_enrollment" INTEGER DEFAULT 0;

-- CreateTable: EvaluationPeriod
CREATE TABLE IF NOT EXISTS "evaluation_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable: GradeTypeConfig
CREATE TABLE IF NOT EXISTS "grade_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "coefficient" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserRoleConfig
CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AttendanceTypeConfig
CREATE TABLE IF NOT EXISTS "attendance_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PaymentTypeConfig
CREATE TABLE IF NOT EXISTS "payment_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "evaluation_periods_school_id_idx" ON "evaluation_periods"("school_id");
CREATE INDEX IF NOT EXISTS "evaluation_periods_academic_year_id_idx" ON "evaluation_periods"("academic_year_id");
CREATE INDEX IF NOT EXISTS "evaluation_periods_is_current_idx" ON "evaluation_periods"("is_current");

CREATE INDEX IF NOT EXISTS "grade_types_school_id_idx" ON "grade_types"("school_id");
CREATE INDEX IF NOT EXISTS "grade_types_is_active_idx" ON "grade_types"("is_active");

CREATE INDEX IF NOT EXISTS "user_roles_school_id_idx" ON "user_roles"("school_id");
CREATE INDEX IF NOT EXISTS "user_roles_is_active_idx" ON "user_roles"("is_active");

CREATE INDEX IF NOT EXISTS "attendance_types_school_id_idx" ON "attendance_types"("school_id");
CREATE INDEX IF NOT EXISTS "attendance_types_is_active_idx" ON "attendance_types"("is_active");

CREATE INDEX IF NOT EXISTS "payment_types_school_id_idx" ON "payment_types"("school_id");
CREATE INDEX IF NOT EXISTS "payment_types_is_active_idx" ON "payment_types"("is_active");

-- CreateUniqueConstraint
DO $$ BEGIN
    ALTER TABLE "evaluation_periods" ADD CONSTRAINT "evaluation_periods_school_id_academic_year_id_name_key" UNIQUE ("school_id", "academic_year_id", "name");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "grade_types" ADD CONSTRAINT "grade_types_school_id_code_key" UNIQUE ("school_id", "code");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_code_key" UNIQUE ("school_id", "code");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "attendance_types" ADD CONSTRAINT "attendance_types_school_id_code_key" UNIQUE ("school_id", "code");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_types" ADD CONSTRAINT "payment_types_school_id_code_key" UNIQUE ("school_id", "code");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "evaluation_periods" ADD CONSTRAINT "evaluation_periods_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "evaluation_periods" ADD CONSTRAINT "evaluation_periods_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "grade_types" ADD CONSTRAINT "grade_types_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "attendance_types" ADD CONSTRAINT "attendance_types_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_types" ADD CONSTRAINT "payment_types_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;