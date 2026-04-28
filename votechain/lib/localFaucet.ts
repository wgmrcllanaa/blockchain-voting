import { ethers } from "ethers";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "31337";
const FAUCET_AMOUNT_ETH = process.env.LOCAL_FAUCET_AMOUNT_ETH || "10";

export async function fundLocalWallet(walletAddress: string) {
  if (CHAIN_ID !== "31337") {
    return { funded: false, reason: "Local faucet only runs on Hardhat chain 31337" };
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const amountWei = ethers.parseEther(FAUCET_AMOUNT_ETH);

  await provider.send("hardhat_setBalance", [
    walletAddress,
    `0x${amountWei.toString(16)}`,
  ]);

  return { funded: true, amountEth: FAUCET_AMOUNT_ETH };
}
