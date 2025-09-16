// src/utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@/server/root';
import { httpBatchLink, loggerLink } from '@trpc/client';

export const trpc = createTRPCReact<AppRouter>({});

export function getTrpcClient() {
	return trpc.createClient({
		links: [
			loggerLink({ enabled: () => process.env.NODE_ENV === 'development' }),
			httpBatchLink({ url: '/api/trpc', transformer: superjson }),
		],
	});
}

