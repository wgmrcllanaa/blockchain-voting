# VoteChain — ACOMSS 2026–2027 Elections

Secure blockchain voting system for the Adamson Computer Science Society.

---

## Project Structure

```
blockchain-voting/
├── blockchain/       ← Solidity contract + Hardhat
└── votechain/        ← Next.js app (frontend + backend + Prisma)
```

---

## Prerequisites

- Node.js v18+
- PostgreSQL (running locally)
- MetaMask browser extension
- Git

---

## Setup Guide

### Step 1 — Clone and install dependencies

```bash
# Install blockchain dependencies
cd blockchain-voting/blockchain
npm install

# Install frontend dependencies
cd ../votechain
npm install
```

---

### Step 2 — Set up the database

1. Create a PostgreSQL database named `votechain`:

```sql
CREATE DATABASE votechain;
```

2. Copy the env file and fill in your values:

```bash
cd votechain
cp .env.local.example .env.local
```

Edit `.env.local` and update `DATABASE_URL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`.

3. Run Prisma migrations and seed the database:

```bash
npm run db:migrate
npm run db:generate
npm run db:seed
```

This seeds the following students:
- Willyn Grace Marcellana (202215505)
- Constante Dizon II (202213764)

---

### Step 3 — Start the local Hardhat blockchain

Open a new terminal:

```bash
cd blockchain-voting/blockchain
npx hardhat node
```

Keep this running. It will show 20 test accounts with private keys.

**Add Account #0 to MetaMask (Admin wallet):**
- Copy the private key of Account #0
- In MetaMask → Import Account → paste the private key
- This account is the contract deployer and admin

**Add the Hardhat network to MetaMask:**
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency: `ETH`

---

### Step 4 — Deploy the smart contract

Open a new terminal:

```bash
cd blockchain-voting/blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the output contract address and admin address, then update `votechain/.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  ← paste here
NEXT_PUBLIC_ADMIN_ADDRESS=0x...     ← paste here
```

---

### Step 5 — Start the Next.js app

```bash
cd blockchain-voting/votechain
npm run dev
```

Open http://localhost:3000

---

## Usage Flow

### Admin Setup (do this first)
1. Go to http://localhost:3000/admin
2. Log in with your `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. Click **Connect Admin Wallet** → connect Account #0 in MetaMask
4. Go to **Positions** tab → add positions (e.g. President, Secretary, etc.)
5. Go to **Candidates** tab → add candidates for each position

### Student Registration
1. Go to http://localhost:3000/register
2. Enter Student ID + Adamson email
3. Connect MetaMask (use a different Hardhat account, e.g. Account #1)
4. Submit registration

### Admin Approval
1. Go back to /admin → **Pending** tab
2. Approve the student → this signs a whitelist transaction via MetaMask

### Student Voting
1. Go to http://localhost:3000/vote
2. Connect MetaMask (the approved wallet)
3. Select one candidate per position
4. Review ballot → Submit (one transaction)

### View Results
1. Admin goes to /admin → **Election** tab → Close Voting
2. Anyone can now view http://localhost:3000/results

---

## Smart Contract Tests

```bash
cd blockchain-voting/blockchain
npx hardhat test
```

Tests cover:
- Admin-only whitelist management
- Non-whitelisted wallets cannot vote
- Double voting prevention
- Candidate/position validation
- Election open/close control
- Correct vote counts in results

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address |
| `NEXT_PUBLIC_ADMIN_ADDRESS` | Admin wallet address (Account #0) |
| `NEXT_PUBLIC_CHAIN_ID` | `31337` for Hardhat localhost |
| `NEXT_PUBLIC_RPC_URL` | `http://127.0.0.1:8545` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.24 + Hardhat |
| Frontend | Next.js 14 (Pages Router) + TypeScript |
| Styling | Tailwind CSS (Adamson University colors) |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Wallet | MetaMask + ethers.js v6 |
| Network | Local Hardhat node |

---

*VoteChain — Adamson Computer Science Society — 2026–2027*
