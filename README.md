# VoteChain — ACOMSS 2026-2027 Elections

VoteChain is a local development project for the Adamson Computer Science Society election workflow.

It combines:

- A **Next.js web app** that students and admins use in the browser.
- A **Supabase Postgres database** that stores student identity and registration records.
- A **Solidity smart contract** that stores election setup, wallet approval, votes, and results.
- A **local Hardhat blockchain** so you can test everything with fake ETH and fake wallets.
- **MetaMask** so the browser can sign blockchain transactions.

This README is intentionally detailed. It is written for someone who may be new to Node.js, databases, blockchain tools, terminals, or MetaMask.

## Table of Contents

1. [What You Are Building](#what-you-are-building)
2. [Project Map](#project-map)
3. [Important Concepts](#important-concepts)
4. [Prerequisites](#prerequisites)
5. [Fresh Install Checklist](#fresh-install-checklist)
6. [Step 1: Open the Project](#step-1-open-the-project)
7. [Step 2: Install Dependencies](#step-2-install-dependencies)
8. [Step 3: Create a Supabase Project](#step-3-create-a-supabase-project)
9. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
10. [Step 5: Create Database Tables and Seed Demo Students](#step-5-create-database-tables-and-seed-demo-students)
11. [Step 6: Start the Local Blockchain](#step-6-start-the-local-blockchain)
12. [Step 7: Configure MetaMask](#step-7-configure-metamask)
13. [Step 8: Deploy the Smart Contract](#step-8-deploy-the-smart-contract)
14. [Step 9: Start the Web App](#step-9-start-the-web-app)
15. [Step 10: Run the Full Demo Flow](#step-10-run-the-full-demo-flow)
16. [Common Commands](#common-commands)
17. [Troubleshooting](#troubleshooting)
18. [How the Code Is Organized](#how-the-code-is-organized)
19. [Safe Git Habits](#safe-git-habits)
20. [Testing](#testing)

## What You Are Building

VoteChain has two main parts:

| Part | Folder | What It Does |
|---|---|---|
| Blockchain workspace | `blockchain/` | Contains the Solidity smart contract, Hardhat config, deploy script, and contract tests. |
| Web app workspace | `votechain/` | Contains the Next.js app, pages, API routes, Prisma database schema, Supabase helpers, and frontend components. |

The app flow looks like this:

1. Admin logs in through the web app.
2. Admin connects the admin MetaMask wallet.
3. Admin creates election positions and candidates on the smart contract.
4. Student registers with a known Student ID, Adamson email, and wallet address.
5. Admin approves the student.
6. Approval stores the student registration in Postgres and whitelists the student's wallet on the blockchain.
7. Student votes with the approved wallet.
8. Votes are counted by the smart contract.
9. Results are shown after voting is closed.

## Project Map

```text
blockchain-voting/
├── README.md
├── blockchain/
│   ├── contracts/
│   │   └── StudentVoting.sol        Smart contract for positions, candidates, voting, and results
│   ├── scripts/
│   │   └── deploy.ts                Deploys the smart contract to the local chain
│   ├── test/
│   │   └── StudentVoting.test.ts    Contract test suite
│   ├── hardhat.config.ts            Hardhat configuration
│   ├── package.json                 Blockchain npm scripts and dependencies
│   └── package-lock.json
└── votechain/
    ├── pages/                       Next.js pages and API routes
    ├── components/                  Reusable React UI components
    ├── lib/                         Contract, Prisma, auth, and local faucet helpers
    ├── prisma/
    │   ├── schema.prisma            Database schema
    │   ├── seed.ts                  Demo student seed script
    │   └── migrations/              Database migration files
    ├── public/                      Images, logos, icons
    ├── styles/                      Global CSS
    ├── .env.local.example           Template for local environment variables
    ├── package.json                 Web app npm scripts and dependencies
    └── package-lock.json
```

## Important Concepts

If these words are unfamiliar, this section is for you.

| Term | Plain-English Meaning |
|---|---|
| Repository, or repo | The project folder managed by Git. This repo is `blockchain-voting`. |
| Terminal | A text window where you type commands like `npm install`. |
| Node.js | The runtime used to run JavaScript and TypeScript tools outside the browser. |
| npm | The package manager that installs project dependencies. It comes with Node.js. |
| Next.js | The React framework used for the web app. |
| API route | Backend code inside the Next.js app, under `votechain/pages/api/`. |
| Supabase | Hosted Postgres database service used for student and registration records. |
| Postgres | The database engine used by Supabase. |
| Prisma | The tool this project uses to define database tables and run migrations. |
| Migration | A database change file that creates or updates tables. |
| Seed script | A script that inserts starter/demo data into the database. |
| Solidity | Programming language used for Ethereum smart contracts. |
| Smart contract | Blockchain code that stores positions, candidates, voting status, and votes. |
| Hardhat | Local blockchain development tool. It can run a fake blockchain on your computer. |
| MetaMask | Browser wallet extension used to connect accounts and sign transactions. |
| Wallet address | Public account identifier, usually starting with `0x`. |
| Private key | Secret key that controls a wallet. Never share real private keys. Hardhat keys are fake development keys. |
| Fake ETH | Test ETH from Hardhat. It has no real money value. |
| Chain ID | Network identifier. Hardhat's local chain ID is `31337`. |

## Prerequisites

Install these before starting.

### Required Tools

| Tool | Recommended Version | Why You Need It |
|---|---:|---|
| Git | Latest stable | To clone or manage the project. |
| Node.js | 18 or newer | To run the blockchain tools and Next.js app. |
| npm | Comes with Node.js | To install dependencies and run scripts. |
| MetaMask | Browser extension | To connect wallets and sign transactions. |
| Supabase account | Free plan is fine | To host the Postgres database. |
| Code editor | VS Code recommended | To edit files and inspect the project. |

### Check Your Installed Versions

Open a terminal and run:

```bash
node -v
npm -v
git --version
```

Good signs:

- `node -v` prints `v18.x.x`, `v20.x.x`, or newer.
- `npm -v` prints a version number.
- `git --version` prints a version number.

If `node` is missing or too old, install the current LTS version from the official Node.js website or through a version manager like `nvm`.

### Terminal Tabs You Will Need

During development, keep three terminals open:

| Terminal | Runs | Folder |
|---|---|---|
| Terminal 1 | Local blockchain | `blockchain/` |
| Terminal 2 | Contract deploy commands | `blockchain/` |
| Terminal 3 | Next.js web app | `votechain/` |

The local blockchain and web app must keep running while you use the browser.

## Fresh Install Checklist

Use this as the short version once you understand the details.

```bash
cd blockchain-voting

cd blockchain
npm install

cd ../votechain
npm install
cp .env.local.example .env.local
cp .env.local .env
```

Then edit `votechain/.env.local` and `votechain/.env` with your Supabase values.

```bash
npm run db:migrate
npm run db:seed
```

In a new terminal:

```bash
cd blockchain
npx hardhat node
```

In another terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed contract address and admin address into `votechain/.env.local` and `votechain/.env`.

In another terminal:

```bash
cd votechain
npm run dev
```

Open:

```text
http://localhost:3000
```

## Step 1: Open the Project

Open a terminal and move into the project folder.

```bash
cd /path/to/blockchain-voting
```

If you are already in the project root, this command should show the project path:

```bash
pwd
```

You should see something ending in:

```text
blockchain-voting
```

List the files:

```bash
ls
```

You should see:

```text
README.md
blockchain
votechain
```

## Step 2: Install Dependencies

Dependencies are third-party packages the project needs.

This repo has two separate `package.json` files, so install dependencies in both folders.

### Install Blockchain Dependencies

From the project root:

```bash
cd blockchain
npm install
```

This creates:

```text
blockchain/node_modules/
```

Wait until the command finishes. It may take a few minutes the first time.

### Install Web App Dependencies

From `blockchain/`, move to `votechain/`:

```bash
cd ../votechain
npm install
```

This creates:

```text
votechain/node_modules/
```

Good sign:

- Both commands finish without a red error stack.
- You can run `npm -v` and it still works.

If installation fails, read the last 10 to 20 lines of the error first. Most npm errors are caused by an unsupported Node version or a network problem.

## Step 3: Create a Supabase Project

The web app needs a Postgres database. Supabase provides that database.

1. Go to Supabase in your browser.
2. Create a new project.
3. Save your database password somewhere private.
4. Wait for Supabase to finish provisioning the project.
5. Open the project dashboard.

You need four values from Supabase:

| Value | Where It Goes |
|---|---|
| Database pooled connection string | `DATABASE_URL` |
| Database direct connection string | `DIRECT_URL` |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Publishable anon key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

### Finding the Database URLs

In Supabase, go to the database connection area. Supabase's labels can change over time, but you are looking for:

- A pooled connection string, usually using port `6543`.
- A direct connection string, usually using port `5432`.

For this project:

- `DATABASE_URL` should use the pooled connection.
- `DIRECT_URL` should use the direct connection.

Both should include:

```text
sslmode=require
```

If your password has special characters like `@`, `#`, `%`, `/`, or spaces, URL-encode it before putting it into the connection string.

Examples:

| Character | Encoded Form |
|---|---|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| space | `%20` |

## Step 4: Configure Environment Variables

Environment variables are local settings and secrets. They tell the app which database to use, what admin login to use, and which smart contract is deployed.

Move into the web app folder:

```bash
cd votechain
```

If you are currently inside `blockchain/`, use:

```bash
cd ../votechain
```

Create your local env files:

```bash
cp .env.local.example .env.local
cp .env.local .env
```

Why two files?

| File | Used By |
|---|---|
| `.env.local` | Next.js development server |
| `.env` | Prisma CLI commands |

Open both files in your editor and fill them in.

Use this shape:

```env
# Database
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase browser client
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"

# Admin login for /admin
ADMIN_USERNAME="acomss"
ADMIN_PASSWORD="acomss"
ADMIN_SESSION_SECRET="replace_with_a_long_random_string"

# Contract values. Fill these after deployment.
NEXT_PUBLIC_CONTRACT_ADDRESS="0x"
NEXT_PUBLIC_ADMIN_ADDRESS="0x"

# Local blockchain
NEXT_PUBLIC_CHAIN_ID="31337"
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"

# Local development faucet
LOCAL_FAUCET_AMOUNT_ETH="10"
```

### Important Env Notes

- Do not commit `.env` or `.env.local`.
- The placeholder contract address `0x` is temporary.
- After deploying the contract, you must replace `NEXT_PUBLIC_CONTRACT_ADDRESS`.
- After deploying the contract, you must replace `NEXT_PUBLIC_ADMIN_ADDRESS`.
- If you change `.env.local` while `npm run dev` is running, stop and restart the dev server.

## Step 5: Create Database Tables and Seed Demo Students

Prisma uses `votechain/prisma/schema.prisma` to create database tables.

From `votechain/`, run:

```bash
npm run db:migrate
```

This creates the database tables in Supabase.

Then run:

```bash
npm run db:seed
```

This inserts demo students.

After seeding, Supabase should show these tables:

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

Good signs:

- `npm run db:migrate` finishes successfully.
- `npm run db:seed` prints seeded student names.
- Supabase Table Editor shows the `students` table with two rows.

## Step 6: Start the Local Blockchain

Hardhat runs a fake Ethereum blockchain on your computer.

Open a new terminal. Leave your first terminal alone if you still need it.

From the project root:

```bash
cd blockchain
npx hardhat node
```

Keep this terminal running.

Good signs:

- The terminal prints several accounts.
- Each account has a wallet address and private key.
- The local RPC server is available at:

```text
http://127.0.0.1:8545
```

Important:

- Do not close this terminal while testing.
- Every time you restart `npx hardhat node`, the local blockchain resets.
- If the local blockchain resets, you must redeploy the smart contract and update your env files again.

## Step 7: Configure MetaMask

MetaMask lets the browser talk to the local blockchain.

### Add the Hardhat Local Network

In MetaMask:

1. Open the network selector.
2. Choose the option to add a custom network.
3. Enter:

| Field | Value |
|---|---|
| Network name | `Hardhat Local` |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency symbol | `ETH` |

Save the network.

### Import the Admin Wallet

In the terminal running `npx hardhat node`, find Account #0.

Hardhat prints something like:

```text
Account #0: 0x...
Private Key: 0x...
```

Import Account #0 into MetaMask using its private key.

This is your admin wallet.

Important:

- Hardhat private keys are public development keys.
- Never use Hardhat accounts for real money.
- Never paste a real wallet private key into random tools or chats.

### Import or Use a Student Wallet

For the student demo, use a different wallet than the admin wallet.

Easy option:

1. Import Hardhat Account #1 into MetaMask.
2. Use Account #1 for student registration and voting.

This keeps the admin and student roles separate.

## Step 8: Deploy the Smart Contract

The smart contract must be deployed to the local Hardhat blockchain.

Make sure Terminal 1 is still running:

```bash
npx hardhat node
```

Open another terminal.

From the project root:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

The deploy script prints:

```text
StudentVoting deployed to: 0x...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ADMIN_ADDRESS=0x...
```

Copy those two values into both files:

```text
votechain/.env.local
votechain/.env
```

Example:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
NEXT_PUBLIC_ADMIN_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
```

Good signs:

- The contract address starts with `0x`.
- The admin address matches the Hardhat Account #0 address.
- MetaMask is using the same admin account when you visit `/admin`.

## Step 9: Start the Web App

Open another terminal.

From the project root:

```bash
cd votechain
npm run dev
```

Keep this terminal running.

Open the app in your browser:

```text
http://localhost:3000
```

Useful pages:

| Page | URL | Purpose |
|---|---|---|
| Home | `http://localhost:3000` | Main landing screen. |
| Register | `http://localhost:3000/register` | Student registration. |
| Vote | `http://localhost:3000/vote` | Student voting page. |
| Results | `http://localhost:3000/results` | Election results. |
| Admin | `http://localhost:3000/admin` | Admin dashboard. |

Good signs:

- The terminal says the app is ready.
- The browser opens without a 500 error.
- MetaMask asks to connect when the app needs wallet access.

## Step 10: Run the Full Demo Flow

This section proves the whole project works end to end.

Before starting, make sure all three services are ready:

| Service | Command | Status |
|---|---|---|
| Supabase database | Hosted by Supabase | Project is active. |
| Local blockchain | `npx hardhat node` | Still running. |
| Web app | `npm run dev` | Still running. |

### A. Admin Login

1. Go to:

```text
http://localhost:3000/admin
```

2. Log in with the values from your env file.

Default local values:

| Field | Value |
|---|---|
| Username | `acomss` |
| Password | `acomss` |

3. Connect MetaMask.
4. Make sure MetaMask is using the admin wallet, which should be Hardhat Account #0.

If the app says the wrong wallet is connected, switch MetaMask to the admin account.

### B. Add Positions

In the admin dashboard, add election positions.

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

Each position is stored on the smart contract.

MetaMask may ask you to confirm transactions.

### C. Add Candidates

Still in the admin dashboard:

1. Choose a position.
2. Add a candidate name.
3. Confirm the transaction in MetaMask if prompted.

Add at least one candidate for at least one position before opening voting.

The contract will not open voting unless there is at least:

- One active position.
- One active candidate.

### D. Open Voting

In the admin dashboard, open the election.

This calls the smart contract's `openVoting()` function.

Good sign:

- The app shows that voting is open.
- The voting page can now load active positions and candidates.

### E. Register a Student

Switch MetaMask to a student wallet, such as Hardhat Account #1.

Go to:

```text
http://localhost:3000/register
```

Register using one seeded student:

| Student ID | Email |
|---|---|
| `202215505` | `willyn.grace.marcellana@adamson.edu.ph` |
| `202213764` | `constante.dizon.ii@adamson.edu.ph` |

The app stores the registration in Supabase with status:

```text
pending
```

### F. Approve the Student

Switch MetaMask back to the admin wallet.

Go to:

```text
http://localhost:3000/admin
```

Open the pending registrations area and approve the student.

Approval does two things:

1. Calls the smart contract to whitelist the student's wallet.
2. Updates the registration status in Supabase to `approved`.

The local faucet also funds approved local wallets with fake Hardhat ETH so the student wallet can pay gas during local testing.

### G. Cast a Vote

Switch MetaMask back to the approved student wallet.

Go to:

```text
http://localhost:3000/vote
```

Then:

1. Select one candidate per position.
2. Review the ballot.
3. Submit the vote.
4. Confirm the transaction in MetaMask.

Good signs:

- The vote transaction succeeds.
- The student cannot vote a second time.

### H. Close Voting and View Results

Switch MetaMask back to the admin wallet.

In `/admin`, close voting.

Then visit:

```text
http://localhost:3000/results
```

Results are read from the smart contract after voting is closed.

## Common Commands

### Project Root

```bash
cd blockchain-voting
```

### Blockchain Commands

Run these from `blockchain/`.

```bash
cd blockchain
```

| Command | Meaning |
|---|---|
| `npm install` | Install blockchain dependencies. |
| `npx hardhat node` | Start the local blockchain. Keep it running. |
| `npx hardhat run scripts/deploy.ts --network localhost` | Deploy the contract to the local blockchain. |
| `npm test` | Run smart contract tests. |

### Web App Commands

Run these from `votechain/`.

```bash
cd votechain
```

| Command | Meaning |
|---|---|
| `npm install` | Install web app dependencies. |
| `npm run dev` | Start the local Next.js app. |
| `npm run build` | Build the app for production. |
| `npm run start` | Start a production build after `npm run build`. |
| `npm run db:migrate` | Apply Prisma migrations to the database. |
| `npm run db:generate` | Generate Prisma client files. |
| `npm run db:seed` | Insert demo students. |

## Troubleshooting

### I Do Not Know Which Folder I Am In

Run:

```bash
pwd
```

If the output ends in `blockchain-voting`, you are at the project root.

If the output ends in `blockchain`, you are in the blockchain workspace.

If the output ends in `votechain`, you are in the web app workspace.

### `npm install` Fails

Check your Node version:

```bash
node -v
```

Use Node 18 or newer.

If your Node version is fine, try running the command again. Temporary network issues can interrupt npm installs.

### Supabase Tables Do Not Appear

From `votechain/`, run:

```bash
npm run db:migrate
npm run db:seed
```

Then refresh Supabase Table Editor.

Expected tables:

```text
_prisma_migrations
students
registrations
```

### `P1001: Can't reach database server`

This usually means Prisma cannot connect to Supabase.

Check:

- `DATABASE_URL` is correct.
- `DIRECT_URL` is correct.
- Your Supabase project is not paused.
- Your password is correct.
- The connection strings include `sslmode=require`.
- Your password is URL-encoded if it contains special characters.

For local development, use the Supabase pooler URL for `DATABASE_URL`.

### `password authentication failed`

The database password is wrong.

Fix both files:

```text
votechain/.env
votechain/.env.local
```

Then rerun:

```bash
npm run db:migrate
```

### The App Says the Contract Address Is Invalid

You probably still have:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x"
```

Deploy the contract:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed address into:

```text
votechain/.env.local
votechain/.env
```

Then restart:

```bash
npm run dev
```

### MetaMask Is on the Wrong Network

Switch MetaMask to:

```text
Network: Hardhat Local
RPC: http://127.0.0.1:8545
Chain ID: 31337
Currency: ETH
```

The app can also try to request the switch automatically, but it is useful to know how to do it manually.

### MetaMask Shows the Wrong Account

Use the correct wallet for the current task:

| Task | Wallet |
|---|---|
| Admin login, adding positions, approving students, opening/closing voting | Hardhat Account #0 |
| Student registration and voting | A non-admin account, such as Hardhat Account #1 |

### Admin Approval Says `Already whitelisted`

The wallet is already approved on-chain.

This can happen after retrying approval. The app should still sync the database registration to `approved` when appropriate.

### Voting Fails with `Not whitelisted`

The student wallet has not been approved on-chain.

Check:

- The student registered with the same wallet currently selected in MetaMask.
- Admin approved the pending registration.
- You did not restart `npx hardhat node` after approval.

If you restarted Hardhat, the blockchain state was reset. Redeploy the contract and repeat the approval flow.

### Voting Fails with `Already voted`

That wallet has already voted in the current contract deployment.

Use a different student wallet or restart the local blockchain, redeploy the contract, and repeat setup.

### Results Do Not Show

The contract only returns results after voting is closed.

As admin:

1. Go to `/admin`.
2. Close voting.
3. Go to `/results`.

### Next.js Shows a Missing Chunk or Fast Refresh Error

Stop the dev server with `Ctrl + C`.

Then from `votechain/`:

```bash
rm -rf .next
npm run dev
```

### Port `3000` Is Already in Use

Another app is using port `3000`.

Next.js may offer another port, such as:

```text
http://localhost:3001
```

Use the URL printed by the terminal.

### Port `8545` Is Already in Use

Another local blockchain or process is using Hardhat's port.

Find the terminal already running `npx hardhat node` and use that one, or stop the old process with `Ctrl + C`.

### I Restarted Hardhat and Everything Broke

This is expected.

Hardhat local chain data is temporary. Restarting it clears:

- Deployed contract.
- Positions.
- Candidates.
- Whitelisted wallets.
- Votes.
- Voting open/closed state.

Fix:

1. Keep `npx hardhat node` running.
2. Redeploy the contract.
3. Update contract env values.
4. Restart the Next.js app.
5. Recreate positions and candidates.
6. Reapprove students.

## How the Code Is Organized

### Smart Contract

Main file:

```text
blockchain/contracts/StudentVoting.sol
```

The contract manages:

- Admin address.
- Voting open/closed status.
- Whitelisted student wallets.
- Whether a wallet has already voted.
- Positions.
- Candidates.
- Vote counts.

Important contract functions:

| Function | Who Uses It | Purpose |
|---|---|---|
| `whitelist(address)` | Admin | Approves a student wallet to vote. |
| `revokeWhitelist(address)` | Admin | Removes approval. |
| `addPosition(string)` | Admin | Adds an election position. |
| `removePosition(uint256)` | Admin | Deactivates a position. |
| `addCandidate(string,uint256)` | Admin | Adds a candidate to a position. |
| `removeCandidate(uint256)` | Admin | Deactivates a candidate. |
| `openVoting()` | Admin | Opens the election. |
| `closeVoting()` | Admin | Closes the election. |
| `vote(uint256[],uint256[])` | Student | Casts votes. |
| `getPositions()` | Public | Reads active positions. |
| `getCandidates()` | Public | Reads active candidates. |
| `getResults()` | Public | Reads results after voting is closed. |

### Contract Deployment

Main file:

```text
blockchain/scripts/deploy.ts
```

This script:

1. Gets the deployer wallet.
2. Deploys `StudentVoting`.
3. Prints the contract address.
4. Prints the admin wallet address.

### Web Pages

Main folder:

```text
votechain/pages/
```

Useful files:

| File | Purpose |
|---|---|
| `pages/index.tsx` | Home page. |
| `pages/register.tsx` | Student registration page. |
| `pages/vote.tsx` | Voting page. |
| `pages/results.tsx` | Results page. |
| `pages/admin/index.tsx` | Admin dashboard. |

### API Routes

Main folder:

```text
votechain/pages/api/
```

These routes run on the server side of the Next.js app.

Useful groups:

| Folder/File | Purpose |
|---|---|
| `api/auth/` | Admin login/logout/status. |
| `api/students/register.ts` | Student registration. |
| `api/students/verify.ts` | Student verification. |
| `api/admin/` | Admin approval, rejection, and pending registration APIs. |
| `api/positions/index.ts` | Reads positions. |
| `api/results/index.ts` | Reads results. |
| `api/election/status.ts` | Reads election status. |

### Database

Main files:

```text
votechain/prisma/schema.prisma
votechain/prisma/seed.ts
```

Current tables:

| Table | Purpose |
|---|---|
| `students` | Known student identities allowed to register. |
| `registrations` | Student wallet registration and approval status. |

Registration statuses:

```text
pending
approved
rejected
```

### Contract Helper

Main file:

```text
votechain/lib/contract.ts
```

This file:

- Defines the contract ABI used by the frontend.
- Reads contract env values.
- Connects to MetaMask.
- Switches or adds the Hardhat network.
- Creates read-only and signer contract instances.
- Checks that the admin wallet is correct for admin actions.

### Local Faucet Helper

Main file:

```text
votechain/lib/localFaucet.ts
```

For local Hardhat development only, this helper gives approved student wallets fake ETH for gas.

It only runs when:

```env
NEXT_PUBLIC_CHAIN_ID="31337"
```

## Safe Git Habits

Before making changes, check the repo status:

```bash
git status
```

Safe to commit:

```text
README.md
blockchain/contracts/StudentVoting.sol
blockchain/scripts/deploy.ts
blockchain/test/StudentVoting.test.ts
votechain/pages/
votechain/components/
votechain/lib/
votechain/prisma/schema.prisma
votechain/prisma/seed.ts
votechain/.env.local.example
votechain/package.json
votechain/package-lock.json
```

Do not commit:

```text
blockchain/node_modules/
votechain/node_modules/
votechain/.next/
votechain/.env
votechain/.env.local
```

Why:

- `node_modules/` is huge and can be recreated with `npm install`.
- `.next/` is generated by Next.js.
- `.env` and `.env.local` contain local secrets and database credentials.

## Testing

### Run Smart Contract Tests

From `blockchain/`:

```bash
npm test
```

The contract tests cover:

- Admin-only whitelist management.
- Double-vote prevention.
- Voting access control.
- Candidate validation.
- Election open/close control.
- Vote counts.

### Build the Web App

From `votechain/`:

```bash
npm run build
```

This checks whether the Next.js app can compile for production.

## Quick Reset for Local Blockchain Testing

Use this when your local chain state is confusing.

1. Stop `npx hardhat node` with `Ctrl + C`.
2. Start it again:

```bash
npx hardhat node
```

3. Open a different terminal from the project root and redeploy the contract:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

4. Copy the new contract and admin addresses into:

```text
votechain/.env.local
votechain/.env
```

5. Restart the web app:

```bash
cd votechain
npm run dev
```

6. Recreate positions, candidates, approvals, and votes.

---

VoteChain — Adamson Computer Science Society — 2026-2027
