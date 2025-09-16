/*
  Warnings:

  - A unique constraint covering the columns `[txid,walletId]` on the table `Tx` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[txid,chain]` on the table `TxRaw` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tx_txid_walletId_key" ON "public"."Tx"("txid", "walletId");

-- CreateIndex
CREATE UNIQUE INDEX "TxRaw_txid_chain_key" ON "public"."TxRaw"("txid", "chain");
