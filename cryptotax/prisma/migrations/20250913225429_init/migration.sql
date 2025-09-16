-- CreateEnum
CREATE TYPE "public"."Chain" AS ENUM ('ETHEREUM', 'SOLANA', 'POLYGON');

-- CreateEnum
CREATE TYPE "public"."TxType" AS ENUM ('SWAP', 'SEND', 'RECEIVE', 'BRIDGE_OUT', 'BRIDGE_IN', 'LP_ADD', 'LP_REMOVE', 'STAKE_REWARD', 'AIRDROP', 'FEE', 'APPROVAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."IncomeKind" AS ENUM ('STAKE_REWARD', 'AIRDROP', 'INTEREST', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CostBasisMethod" AS ENUM ('FIFO', 'SPECIFIC_ID');

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "chain" "public"."Chain" NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "basisMethod" "public"."CostBasisMethod" NOT NULL DEFAULT 'FIFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TxRaw" (
    "txid" TEXT NOT NULL,
    "chain" "public"."Chain" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "programOrContract" TEXT,
    "rawJson" JSONB NOT NULL,

    CONSTRAINT "TxRaw_pkey" PRIMARY KEY ("txid")
);

-- CreateTable
CREATE TABLE "public"."Tx" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "chain" "public"."Chain" NOT NULL,
    "type" "public"."TxType" NOT NULL,
    "txid" TEXT NOT NULL,
    "blockTime" TIMESTAMP(3) NOT NULL,
    "baseAsset" TEXT,
    "baseQty" DECIMAL(38,18),
    "quoteAsset" TEXT,
    "quoteQty" DECIMAL(38,18),
    "feeAsset" TEXT,
    "feeQty" DECIMAL(38,18),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tx_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lot" (
    "id" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "quantityRemaining" DECIMAL(38,18) NOT NULL,
    "acquiredTs" TIMESTAMP(3) NOT NULL,
    "basisUsd" DECIMAL(38,2) NOT NULL,
    "walletId" TEXT,
    "sourceTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Disposal" (
    "id" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "quantitySold" DECIMAL(38,18) NOT NULL,
    "proceedsUsd" DECIMAL(38,2) NOT NULL,
    "basisUsd" DECIMAL(38,2) NOT NULL,
    "gainUsd" DECIMAL(38,2) NOT NULL,
    "method" "public"."CostBasisMethod" NOT NULL,
    "soldTs" TIMESTAMP(3) NOT NULL,
    "txid" TEXT NOT NULL,
    "walletId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Income" (
    "id" TEXT NOT NULL,
    "kind" "public"."IncomeKind" NOT NULL,
    "asset" TEXT NOT NULL,
    "quantity" DECIMAL(38,18) NOT NULL,
    "fmvUsd" DECIMAL(38,2) NOT NULL,
    "receivedTs" TIMESTAMP(3) NOT NULL,
    "txid" TEXT NOT NULL,
    "walletId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Price" (
    "id" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "priceUsd" DECIMAL(38,8) NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_chain_address_key" ON "public"."Wallet"("chain", "address");

-- CreateIndex
CREATE INDEX "TxRaw_chain_timestamp_idx" ON "public"."TxRaw"("chain", "timestamp");

-- CreateIndex
CREATE INDEX "Tx_walletId_blockTime_idx" ON "public"."Tx"("walletId", "blockTime");

-- CreateIndex
CREATE INDEX "Tx_txid_idx" ON "public"."Tx"("txid");

-- CreateIndex
CREATE INDEX "Tx_chain_blockTime_idx" ON "public"."Tx"("chain", "blockTime");

-- CreateIndex
CREATE INDEX "Lot_asset_walletId_idx" ON "public"."Lot"("asset", "walletId");

-- CreateIndex
CREATE INDEX "Lot_acquiredTs_idx" ON "public"."Lot"("acquiredTs");

-- CreateIndex
CREATE INDEX "Disposal_soldTs_idx" ON "public"."Disposal"("soldTs");

-- CreateIndex
CREATE INDEX "Disposal_asset_walletId_idx" ON "public"."Disposal"("asset", "walletId");

-- CreateIndex
CREATE INDEX "Income_receivedTs_idx" ON "public"."Income"("receivedTs");

-- CreateIndex
CREATE INDEX "Price_asset_ts_idx" ON "public"."Price"("asset", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "Price_asset_ts_source_key" ON "public"."Price"("asset", "ts", "source");

-- AddForeignKey
ALTER TABLE "public"."Tx" ADD CONSTRAINT "Tx_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lot" ADD CONSTRAINT "Lot_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lot" ADD CONSTRAINT "Lot_sourceTxId_fkey" FOREIGN KEY ("sourceTxId") REFERENCES "public"."Tx"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Disposal" ADD CONSTRAINT "Disposal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Income" ADD CONSTRAINT "Income_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
