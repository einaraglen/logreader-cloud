CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- CreateTable
CREATE TABLE "Extraction" (
    "id" SERIAL NOT NULL,
    "result_id" INTEGER NOT NULL,

    CONSTRAINT "Extraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "extraction_id" INTEGER NOT NULL,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Value" (
    "signal_id" INTEGER NOT NULL,
    "x" TIMESTAMP(3) NOT NULL,
    "y" DOUBLE PRECISION NOT NULL
);

-- CreateIndex
CREATE INDEX "Value_x_idx" ON "Value"("x");

-- CreateIndex
CREATE UNIQUE INDEX "Value_signal_id_x_key" ON "Value"("signal_id", "x");

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_extraction_id_fkey" FOREIGN KEY ("extraction_id") REFERENCES "Extraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Value" ADD CONSTRAINT "Value_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

SELECT create_hypertable('"Value"', 'x');