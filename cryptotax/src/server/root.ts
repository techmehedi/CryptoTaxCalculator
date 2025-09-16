// src/server/root.ts
import { router } from './trpc';
import { walletRouter } from './routers/wallet';
import { ingestRouter } from './routers/ingest';
import { txRouter } from './routers/tx';

export const appRouter = router({
	wallet: walletRouter,
	ingest: ingestRouter,
	tx: txRouter,
});

export type AppRouter = typeof appRouter;
