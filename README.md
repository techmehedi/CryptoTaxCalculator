# Crypto Tax Calculator

A full-stack web app that aggregates your wallet transactions across Ethereum, Solana, and Polygon and generates tax-ready reports.  
The platform normalizes swaps, transfers, staking rewards, and fees, then applies IRS-compliant cost basis rules to produce Form 8949, Schedule D, and tax loss harvesting insights.

---

## 🚀 Features
- Connect multiple wallets (Ethereum, Solana, Polygon)  
- Pull on-chain history via [Helius](https://helius.xyz) (Solana) and [Covalent](https://www.covalenthq.com/) (EVM chains)  
- Fetch historical USD pricing with [CoinGecko API](https://www.coingecko.com/)  
- Normalize transactions: swaps, transfers, staking rewards, airdrops, fees  
- Apply cost basis methods: **FIFO** and **Specific Identification**  
- Track realized and unrealized gains/losses  
- Export tax forms: **Form 8949**, **Schedule D**, and CSV summaries  
- Tax loss harvesting dashboard to identify harvestable losses  

---

## 🛠️ Tech Stack
- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)  
- **Backend / Jobs**: [tRPC](https://trpc.io/), [Inngest](https://www.inngest.com/) (background jobs)  
- **Database**: [Postgres](https://www.postgresql.org/) (via [Prisma](https://www.prisma.io/))  
- **APIs**: Helius (Solana), Covalent (EVM), CoinGecko (pricing)  
- **Auth & Billing**: [Clerk](https://clerk.dev/) (planned)  
- **Deployment**: [Vercel](https://vercel.com/) or [Neon](https://neon.tech/) for Postgres  

---
