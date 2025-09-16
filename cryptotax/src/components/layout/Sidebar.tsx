// src/components/layout/Sidebar.tsx
'use client';

import { cn } from '@/lib/utils';
import { Wallet, LayoutDashboard, Activity, FolderGit2, Receipt, TrendingDown, BarChart3, CircleDollarSign } from 'lucide-react';
import Link from 'next/link';

const items = [
	{ label: 'Portfolio', icon: LayoutDashboard },
	{ label: 'Account health', icon: Activity },
	{ label: 'Wallets', icon: Wallet },
	{ label: 'Transactions', icon: FolderGit2 },
	{ label: 'Taxes', icon: Receipt, active: true },
	{ label: 'Tax loss harvesting', icon: TrendingDown },
	{ label: 'Performance', icon: BarChart3 },
	{ label: 'Prices', icon: CircleDollarSign },
];

export function Sidebar() {
	return (
		<aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 border-r bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
			<div className="h-14 flex items-center px-5 border-b">
				<Link href="#" className="text-lg font-semibold tracking-tight">
					CryptoTax
				</Link>
			</div>
			<nav className="flex-1 overflow-y-auto py-3">
				<ul className="px-2 space-y-1">
					{items.map((item) => (
						<li key={item.label}>
							<a
								href="#"
								className={cn(
									'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
									item.active
										? 'bg-primary/10 text-primary hover:bg-primary/15'
										: 'hover:bg-muted text-muted-foreground'
								)}
							>
								<item.icon className="size-4" />
								<span>{item.label}</span>
							</a>
						</li>
					))}
				</ul>
			</nav>
			<div className="p-4 text-xs text-muted-foreground">2025</div>
		</aside>
	);
}


