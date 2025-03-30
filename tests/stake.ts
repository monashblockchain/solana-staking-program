import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { expect } from "chai";

interface StakeVault{
  creator: PublicKey;
  stakeVault: PublicKey;
}

describe("stake", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // @ts-ignore - Ignore type errors for simplicity
  const program = anchor.workspace.Stake;
  const user = provider.wallet;
  
  // PDAs
  const [stakeVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake_vault")],
    program.programId
  );
  console.log("Stake Vault Address:", stakeVault.toBase58());
  
  const [stakeRewardToken] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake_reward_token")],
    program.programId
  );
  console.log("Reward Token Address:", stakeRewardToken.toBase58());

  const [userAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_account"), stakeVault.toBuffer(), user.publicKey.toBuffer()],
    program.programId
  );
  console.log("User Vault Account Address:", userAccount.toBase58());
  
  // Initialize the program
  before(async () => {
    try {
      const tx = await program.methods
        .initialize()
        .accounts({})
        .rpc();

      console.log("Initialize transaction signature:", tx);
      
      // Fetch Stake Vault Data
      await new Promise(resolve => setTimeout(resolve, 2000));
      const stakeVaultAccount: StakeVault = await program.account.stakeVault.fetch(stakeVault);
      
      // Check the Stake Vault Account
      expect(stakeVaultAccount.creator.toString()).to.equal(user.publicKey.toString());
      expect(stakeVaultAccount.stakeVault.toString()).to.equal(stakeVault.toString());
    } catch (error) {
      // Error might happen if account has been initialized
      console.log("Stake Vault already initialized. Skipping initialization.");
    }
  });

  // Test deposit function
  it("Deposits SOL into the program", async () => {
    // Amount to deposit (0.1 SOL)
    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);

    // Get the initial Solana Balance before withdrawal
    const initialBalance = await program.provider.connection.getBalance(user.publicKey);
    
    // Execute deposit transaction
    const tx = await program.methods
      .deposit(amount)
      .accounts({})
      .rpc();
    console.log("Deposit transaction signature:", tx);

    // Check the Solana Balance Changes
    await new Promise(resolve => setTimeout(resolve, 2000));
    const postBalance = await program.provider.connection.getBalance(user.publicKey);
    console.log("Initial User Balance:", initialBalance / LAMPORTS_PER_SOL);
    console.log("Post User Balance   :", postBalance / LAMPORTS_PER_SOL);
    console.log("Balance Change      :", (postBalance - initialBalance) / LAMPORTS_PER_SOL);
    expect(postBalance).to.be.lessThan(initialBalance - amount.toNumber());
  });

  // Test claim function
  it("Claims tokens after staking period", async () => {
    // Get user's token account for rewards
    const userStakeRewardTokenAccount = await getAssociatedTokenAddress(stakeRewardToken, user.publicKey);
    
    // Get initial Token Balance before claim
    let initialRewardTokenBalance;
    try {
      initialRewardTokenBalance = await program.provider.connection.getTokenAccountBalance(userStakeRewardTokenAccount);
    } catch (error) {
      // If the account does not exist yet, set as 0
      initialRewardTokenBalance = { value: { uiAmount: 0 } };
      console.log("User's reward token account does not exist yet. Initial balance set to 0.");
    }

    // Wait for 10 seconds then Execute claim transaction
    await new Promise(resolve => setTimeout(resolve, 10000));
    const tx = await program.methods
      .claim()
      .accounts({})
      .rpc();
    console.log("Claim transaction signature:", tx);

    // Check the Token Balance Changes
    await new Promise(resolve => setTimeout(resolve, 2000));
    const postRewardTokenBalance = await program.provider.connection.getTokenAccountBalance(userStakeRewardTokenAccount);
    console.log("Initial Token Balance:", initialRewardTokenBalance.value.uiAmount);
    console.log("Post Token Balance:", postRewardTokenBalance.value.uiAmount);
    expect(postRewardTokenBalance.value.uiAmount).to.be.greaterThan(initialRewardTokenBalance.value.uiAmount);
  });

  // Test withdraw function
  it("Withdraws SOL from the program", async () => {  
    // Amount to withdraw (0.05 SOL)
    const amount = new anchor.BN(0.05 * LAMPORTS_PER_SOL);
    
    // Get the initial Solana Balance before withdrawal
    const initialBalance = await program.provider.connection.getBalance(user.publicKey);

    // Execute withdraw transaction
    const tx = await program.methods
      .withdraw(amount)
      .accounts({})
      .rpc();
    console.log("Withdraw transaction signature:", tx);

    // Check the Solana Balance Changes
    await new Promise(resolve => setTimeout(resolve, 2000));
    const postBalance = await program.provider.connection.getBalance(user.publicKey);
    console.log("Initial User Balance:", initialBalance / LAMPORTS_PER_SOL);
    console.log("Post User Balance   :", postBalance / LAMPORTS_PER_SOL);
    console.log("Balance Change      :", (postBalance - initialBalance) / LAMPORTS_PER_SOL);
    expect(postBalance).to.be.greaterThan(initialBalance);
  });
});
