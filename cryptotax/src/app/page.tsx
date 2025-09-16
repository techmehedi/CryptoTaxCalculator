// src/app/page.tsx
'use client';

import { trpc } from '@/utils/trpc';
import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CHAINS = [
	{ value: 'ETHEREUM', label: 'Ethereum' },
	{ value: 'SOLANA', label: 'Solana' },
	{ value: 'POLYGON', label: 'Polygon' },
] as const;

function Coin() {
	const ref = useRef<any>(null);
	useFrame((_s, delta) => {
		if (ref.current) ref.current.rotation.y += delta * 0.8;
	});
	return (
		<mesh ref={ref} castShadow receiveShadow>
			<cylinderGeometry args={[1, 1, 0.15, 64]} />
			<meshStandardMaterial color="#7c3aed" metalness={0.9} roughness={0.2} />
		</mesh>
	);
}

export default function HomePage() {
	const walletsQuery = trpc.wallet.list.useQuery();
	const addWallet = trpc.wallet.add.useMutation({
		onSuccess: () => {
			walletsQuery.refetch();
			toast.success('Wallet added');
		},
		onError: (e) => toast.error(e.message),
	});
	const removeWallet = trpc.wallet.remove.useMutation({
		onSuccess: () => {
			walletsQuery.refetch();
			toast.success('Wallet removed');
		},
		onError: (e) => toast.error(e.message),
	});
	const ingestWallet = trpc.ingest.run.useMutation({
		onSuccess: (res) => toast.success(`Ingested ${res.count} raw records`),
		onError: (e) => toast.error(e.message),
	});
	const txQuery = trpc.tx.list.useQuery({ year: 2025 });

	const [chain, setChain] = useState<typeof CHAINS[number]['value']>('ETHEREUM');
	const [address, setAddress] = useState('');
	const [label, setLabel] = useState('');

	return (
		<div className="min-h-screen">
			<Toaster />
			<div className="px-6 pt-6">
				<h1 className="text-2xl font-semibold tracking-tight">Taxes</h1>
				<p className="text-sm text-muted-foreground">January 1, 2025 to December 31, 2025</p>
			</div>
			<div className="mx-auto max-w-[1400px] p-6 grid lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
						<Card>
							<CardHeader>
								<CardTitle>Freeze transactions for peace of mind</CardTitle>
							</CardHeader>
							<CardContent className="flex items-center justify-between gap-4 flex-wrap">
								<p className="text-sm text-muted-foreground max-w-2xl">Freezing will prevent changes to this year's transactions and tax reports. Downloading a tax report will automatically freeze your transactions.</p>
								<Button>Get started</Button>
							</CardContent>
						</Card>
					</motion.div>

					<div className="grid sm:grid-cols-2 gap-6">
						<Card>
							<CardHeader><CardTitle>Total capital gains</CardTitle></CardHeader>
							<CardContent className="text-3xl font-semibold">$0.00</CardContent>
						</Card>
						<Card>
							<CardHeader><CardTitle>Total income</CardTitle></CardHeader>
							<CardContent className="text-3xl font-semibold">$0.00</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Transactions</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Chain</TableHead>
											<TableHead>Txid</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{txQuery.data?.map((t) => (
											<TableRow key={t.id}>
												<TableCell className="whitespace-nowrap">{new Date(t.blockTime).toLocaleString()}</TableCell>
												<TableCell>{t.type}</TableCell>
												<TableCell>{t.chain}</TableCell>
												<TableCell className="truncate max-w-[240px] text-xs text-muted-foreground">{t.txid}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Wallets</CardTitle>
						</CardHeader>
						<CardContent>
							<form
								className="grid sm:grid-cols-5 gap-3"
								onSubmit={(e) => {
									e.preventDefault();
									if (!address) return;
									addWallet.mutate({ chain, address, label: label || undefined });
									setAddress('');
									setLabel('');
								}}
							>
								<div className="sm:col-span-1">
									<Label>Chain</Label>
									<Select value={chain} onValueChange={(v) => setChain(v as any)}>
										<SelectTrigger>
											<SelectValue placeholder="Select chain" />
										</SelectTrigger>
										<SelectContent>
											{CHAINS.map((c) => (
												<SelectItem key={c.value} value={c.value}>
													{c.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="sm:col-span-3">
									<Label>Address</Label>
									<Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Wallet address or ENS/SNS" />
								</div>
								<div className="sm:col-span-1">
									<Label>Label</Label>
									<Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Optional" />
								</div>
								<div className="sm:col-span-5 flex justify-end gap-2">
									<Button type="submit" variant="default">Add</Button>
								</div>
							</form>

							<div className="mt-4 divide-y rounded-md border">
								{walletsQuery.data?.length ? (
									walletsQuery.data.map((w) => (
										<div key={w.id} className="p-3 flex items-center justify-between">
											<div>
												<div className="text-sm font-medium">{w.label || w.address}</div>
												<div className="text-xs text-muted-foreground">{w.chain} · {w.address}</div>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="secondary" size="sm" onClick={() => ingestWallet.mutate({ walletId: w.id })} disabled={ingestWallet.isPending}>Ingest</Button>
												<Button variant="destructive" size="sm" onClick={() => removeWallet.mutate({ id: w.id })}>Remove</Button>
											</div>
										</div>
								))
								) : (
									<div className="p-3 text-sm text-muted-foreground">No wallets added yet.</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="space-y-6">
					<Card>
						<CardHeader><CardTitle>Hero</CardTitle></CardHeader>
						<CardContent>
							<div className="h-48 rounded-md overflow-hidden">
								<Canvas camera={{ position: [2.2, 1.6, 2.2], fov: 50 }} shadows>
									<ambientLight intensity={0.6} />
									<directionalLight position={[3, 5, 2]} intensity={1} castShadow />
									<Coin />
									<OrbitControls enablePan={false} enableZoom={false} />
								</Canvas>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader><CardTitle>Tax reports</CardTitle></CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between bg-muted/40 rounded p-3">
								<div>
									<div className="text-sm font-medium">Form 8949</div>
									<div className="text-xs text-muted-foreground">Sales of capital assets</div>
								</div>
								<Button size="sm">Generate</Button>
							</div>
							<div className="flex items-center justify-between bg-muted/40 rounded p-3">
								<div>
									<div className="text-sm font-medium">Form 1040 (Schedule D)</div>
									<div className="text-xs text-muted-foreground">Capital gains</div>
								</div>
								<Button size="sm">Generate</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
