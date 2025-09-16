// src/server/routers/tx.ts
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { prisma } from '@/utils/prisma';

export const txRouter = router({
	list: publicProcedure
		.input(z.object({ walletId: z.string().optional(), year: z.number().optional() }).optional())
		.query(async ({ input }) => {
			const where: any = {};
			if (input?.walletId) where.walletId = input.walletId;
			if (input?.year) {
				const start = new Date(input.year, 0, 1);
				const end = new Date(input.year + 1, 0, 1);
				where.blockTime = { gte: start, lt: end };
			}
			return prisma.tx.findMany({ where, orderBy: { blockTime: 'desc' }, take: 200 });
		}),
});


