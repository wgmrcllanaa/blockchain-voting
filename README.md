# VoteChain — ACOMSS 2026–2027 Elections

VoteChain is a hybrid blockchain voting system for the Adamson Computer Science Society. Student identity and registration data live off-chain in Supabase Postgres, while wallet approvals, candidates, voting, and results are handled by a Solidity smart contract on a local Hardhat chain.

## Project Structure

```text
blockchain-voting/
├── blockchain/       Solidity contract, Hardhat scripts, tests
└── votechain/        Next.js app, API routes, Prisma, Supabase helpers
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 Pages Router, React, TypeScript |
| Backend | Next.js API Routes |
| Database | Supabase Postgres |
| ORM | Prisma |
| Smart Contract | Solidity 0.8.24, Hardhat |
| Wallet | MetaMask, ethers.js v6 |
| Styling | Tailwind CSS |

## Prerequisites

- Node.js 18+
- Git
- MetaMask browser extension
- Supabase project
- A terminal with three tabs/windows available

## 1. Install Dependencies

From the project root:

```bash
cd blockchain
npm install

cd ../votechain
npm install
```

## 2. Configure Environment Variables

Create your local env file:

```bash
cd votechain
cp .env.local.example .env.local
```

Also create `.env` for Prisma CLI commands:

```bash
cp .env.local .env
```

Fill in these values:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require"

NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"

ADMIN_USERNAME="acomss"
ADMIN_PASSWORD="acomss"
ADMIN_SESSION_SECRET="replace_with_a_long_random_string"

NEXT_PUBLIC_CONTRACT_ADDRESS="0x"
NEXT_PUBLIC_ADMIN_ADDRESS="0x"
NEXT_PUBLIC_CHAIN_ID="31337"
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
LOCAL_FAUCET_AMOUNT_ETH="10"
```

Get the Supabase database URLs from **Supabase Dashboard → Connect**. For local development, use the pooler URLs and keep `sslmode=require`.

Never commit `.env` or `.env.local`. They are ignored by Git.

## 3. Set Up Supabase Tables

Run the Prisma migration and seed script:

```bash
cd votechain
npm run db:migrate
npm run db:seed
```

After this, Supabase **Table Editor** should show:

```text
_prisma_migrations
students
registrations
```

Seeded demo students:

| Student ID | Name | Email |
|---|---|---|
| `202215505` | Willyn Grace Marcellana | `willyn.grace.marcellana@adamson.edu.ph` |
| `202213764` | Constante Dizon II | `constante.dizon.ii@adamson.edu.ph` |

## 4. Start the Local Blockchain

Open a new terminal:

```bash
cd blockchain
npx hardhat node
```

Keep this terminal running. Hardhat will print test accounts and private keys.

In MetaMask:

1. Add the Hardhat network:
   - Network name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency symbol: `ETH`
2. Import Hardhat Account #0 using its private key.
3. Use Account #0 as the admin wallet.

## 5. Deploy the Smart Contract

Open another terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed contract address and admin address into `votechain/.env.local` and `votechain/.env`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_ADMIN_ADDRESS="0x..."
```

Restart the Next.js app whenever these values change.

## 6. Run the App

Open another terminal:

```bash
cd votechain
npm run dev
```

Visit:

```text
http://localhost:3000
```

If Next.js shows a missing chunk or Fast Refresh error, stop the server, delete `.next`, and restart:

```bash
rm -rf .next
npm run dev
```

## 7. Full Demo Flow

### Admin Setup

1. Go to `http://localhost:3000/admin`.
2. Log in with:
   - Username: `acomss`
   - Password: `acomss`
3. Connect MetaMask using Hardhat Account #0.
4. Add election positions in the **Positions** tab.
5. Add candidates in the **Candidates** tab.
6. Open voting from the **Election** tab when setup is complete.

Suggested positions:

```text
AUSG Representative
President
VP Internal
VP External
Secretary
Treasurer
Auditor
P.R.O
```

### Student Registration

1. Go to `http://localhost:3000/register`.
2. Enter one seeded Student ID and Adamson email.
3. Connect MetaMask using a non-admin Hardhat account, such as Account #1.
4. Submit the registration.
5. Confirm the new row appears in Supabase `registrations`.

### Admin Approval

1. Return to `/admin`.
2. Open the **Pending** tab.
3. Approve the registration.
4. MetaMask signs the whitelist transaction.
5. The database registration changes to `approved`.

### Student Voting

1. Go to `http://localhost:3000/vote`.
2. Connect the approved student wallet.
3. Select one candidate per position.
4. Review and submit the ballot.
5. MetaMask sends the vote transaction.

### Results

1. Admin closes voting from `/admin`.
2. Visit `http://localhost:3000/results`.
3. Results are read from the smart contract.

## Useful Commands

### Frontend

```bash
cd votechain
npm run dev
npm run build
npm run db:migrate
npm run db:generate
npm run db:seed
```

### Blockchain

```bash
cd blockchain
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
npm test
```

## Troubleshooting

### Supabase Tables Do Not Appear

Run:

```bash
cd votechain
npm run db:migrate
npm run db:seed
```

Then check Supabase **Table Editor**.

### `P1001: Can't reach database server`

Use the Supabase pooler URL instead of the direct `db.<project-ref>.supabase.co` URL. Keep `sslmode=require`.

### `password authentication failed`

Reset or copy the database password from Supabase, then update both:

```text
votechain/.env
votechain/.env.local
```

### `Already whitelisted`

The wallet is already approved on-chain. The admin approval flow checks this and should still sync the database status to `approved`.

### MetaMask Is on the Wrong Network

Switch to:

```text
Hardhat Local
Chain ID: 31337
RPC: http://127.0.0.1:8545
```

## Git Notes

Safe to commit:

```text
README.md
.gitignore
votechain/.env.local.example
votechain/package.json
votechain/package-lock.json
votechain/prisma/schema.prisma
votechain/middleware.ts
votechain/utils/supabase/*
```

Do not commit:

```text
votechain/.env
votechain/.env.local
votechain/.next/
votechain/node_modules/
votechain/.agents/
votechain/.claude/
votechain/.windsurf/
```

## Tests

Run smart contract tests:

```bash
cd blockchain
npm test
```

The tests cover admin-only whitelist management, double-vote prevention, voting access control, candidate validation, election open/close control, and vote counts.

---

VoteChain — Adamson Computer Science Society — 2026–2027
