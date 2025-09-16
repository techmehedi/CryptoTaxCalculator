// src/server/routers/ingest.ts
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { prisma } from '@/utils/prisma';

async function fetchSolana(address: string) {
	const key = process.env.HELIUS;
	if (!key) throw new Error('Missing HELIUS key');
	// Basic address tx signatures via Helius RPC
	const url = `https://mainnet.helius-rpc.com/?api-key=${key}`;
	const body = { jsonrpc: '2.0', id: 'txs', method: 'getSignaturesForAddress', params: [address, { limit: 25 }] };
	const sigs = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()).catch(() => null);
	const signatures: string[] = sigs?.result?.map((s: any) => s.signature) ?? [];
	// Enhanced transactions
	const enhancedUrl = `https://api.helius.xyz/v0/transactions/?api-key=${key}`;
	const chunks: any[] = [];
	for (let i = 0; i < signatures.length; i += 10) {
		const batch = signatures.slice(i, i + 10);
		const res = await fetch(enhancedUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(batch) }).then(r => r.json()).catch(() => []);
		chunks.push(...res);
	}
	return chunks.map((t: any) => ({
		txid: t.signature,
		timestamp: (t?.timestamp ? t.timestamp * 1000 : Date.now()),
		from: t?.feePayer,
		to: undefined,
		program: t?.type,
		_actions: t?.events,
	}));
}

async function fetchEvm(chain: 'ETHEREUM' | 'POLYGON', address: string) {
	const key = process.env.COVALENT;
	if (!key) throw new Error('Missing COVALENT key');
	const chainIds: Record<string, string> = { ETHEREUM: 'eth-mainnet', POLYGON: 'matic-mainnet' };
	const url = `https://api.covalenthq.com/v1/${chainIds[chain]}/address/${address}/transactions_v3/?page-size=25`;
	const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } }).then(r => r.json()).catch(() => null);
	const items = res?.data?.items ?? [];
	return items.map((t: any) => ({
		txid: t.tx_hash,
		timestamp: Date.parse(t.block_signed_at),
		from: t.from_address,
		to: t.to_address,
		contract: t.to_address,
		_actions: t.log_events,
	}));
}

export const ingestRouter = router({
	run: publicProcedure
		.input(z.object({ walletId: z.string() }))
		.mutation(async ({ input }) => {
			const wallet = await prisma.wallet.findUnique({ where: { id: input.walletId } });
			if (!wallet) throw new Error('Wallet not found');

			let raw: any[] = [];
			if (wallet.chain === 'SOLANA') raw = await fetchSolana(wallet.address);
			if (wallet.chain === 'ETHEREUM' || wallet.chain === 'POLYGON') raw = await fetchEvm(wallet.chain, wallet.address);

			let stored = 0;
			for (const item of raw) {
				await prisma.txRaw.upsert({
					where: { txraw_chain_txid: { txid: item.txid, chain: wallet.chain } },
					update: { rawJson: item },
					create: {
						txid: item.txid,
						chain: wallet.chain,
						timestamp: new Date(item.timestamp || Date.now()),
						fromAddress: item.from,
						toAddress: item.to,
						programOrContract: item.program || item.contract,
						rawJson: item,
					},
				});
				// naive classification: treat as OTHER; later we'll parse swaps/transfers
				await prisma.tx.upsert({
					where: { tx_wallet_txid: { txid: item.txid, walletId: wallet.id } },
					update: {},
					create: {
						walletId: wallet.id,
						chain: wallet.chain,
						type: 'OTHER',
						txid: item.txid,
						blockTime: new Date(item.timestamp || Date.now()),
						description: 'Imported',
					},
				});
				stored++;
			}

			if (stored === 0) {
				await prisma.tx.create({
					data: {
						walletId: wallet.id,
						chain: wallet.chain,
						type: 'OTHER',
						txid: `demo-${wallet.id}-${Date.now()}`,
						blockTime: new Date(),
						description: 'No data returned; placeholder created',
					},
				});
			}

			return { ok: true, count: stored };
		}),
});
