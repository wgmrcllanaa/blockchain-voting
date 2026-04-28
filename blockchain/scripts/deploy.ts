import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying StudentVoting contract...");
  console.log("Deployer (admin) address:", deployer.address);

  const StudentVoting = await ethers.getContractFactory("StudentVoting");
  const contract = await StudentVoting.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ StudentVoting deployed to:", address);
  console.log("");
  console.log("Add this to your frontend/.env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_ADMIN_ADDRESS=${deployer.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
