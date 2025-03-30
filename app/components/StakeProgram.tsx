// @ts-ignore
import IDL from "@/lib/idl.json";
import {Stake} from "@/lib/stake";
import * as anchor from "@coral-xyz/anchor";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import {PublicKey, Connection, Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import { RPC_LINK } from "@/lib/connection";

import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import StakeProgramClaim from "./StakeProgramClaim";
import StakeProgramDeposit from "./StakeProgramDeposit";
import StakeProgramWithdraw from "./StakeProgramWithdraw";

import {PROGRAM_ID, STAKE_VAULT, STAKE_VAULT_AUTHORITY, STAKE_REWARD_TOKEN, getUserVaultAccount} from "@/lib/addresses";

// Solana Connection
const connection = new Connection(RPC_LINK);

export default function StakeProgram(){
    const {publicKey, connected, signTransaction} = useWallet();
    const wallet = useAnchorWallet();

    const [totalStaked, setTotalStaked] = useState<number | null>(null);
    const [solanaBalance, setSolanaBalance] = useState<number | null>(null);
    const [stakedAmount, setStakedAmount] = useState<number | null>(null);
    const [rewardTokenBalance, setRewardTokenBalance] = useState<number | null>(null);

    
    // Refresh balances periodically and after component mounts
    useEffect(() => {
        if (connected) {
            const fetchBalances = async () => {
                await fetchSolanaBalance();
                await fetchStakedBalance();
                await fetchRewardTokenBalance();
                await fetchTotalStaked();
            };
            
            fetchBalances();
            
            // Set up interval to refresh balances every 60 seconds
            const interval = setInterval(fetchBalances, 60000);
            
            return () => clearInterval(interval);
        }
    }, [connected, publicKey]);

    // Fetch Protocol's Total Staked SOL
    const fetchTotalStaked = async ()=>{
        try {
            const stakeVaultAuthority = await connection.getAccountInfo(STAKE_VAULT_AUTHORITY);
            if (stakeVaultAuthority) {
                const totalStaked = stakeVaultAuthority.lamports / LAMPORTS_PER_SOL;
                setTotalStaked(totalStaked);
            } else {
                console.error("Stake Vault account not found");
                toast.error("Failed to fetch total staked SOL");
            }
        } catch (error) {
            console.error("Error fetching total staked SOL:", error);
            toast.error("Failed to fetch total staked SOL");
        }
    }
    
    // Fetch User's Solana Balance
    const fetchSolanaBalance = async () => {
        if (publicKey) {
            try {
                const balance = await connection.getBalance(publicKey);
                setSolanaBalance(balance / LAMPORTS_PER_SOL);
            } catch (error) {
                console.error("Error fetching Solana balance:", error);
                toast.error("Failed to fetch Solana balance");
            }
        }
    }

    // Fetch User's Staked Amount in the Smart Contract
    const fetchStakedBalance = async () => {
        if (wallet && publicKey) {
            const userVaultAccount = getUserVaultAccount(publicKey);
            
            try {
                const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions())
                const program = new anchor.Program(IDL as Stake, provider);
                
                try {
                    // @ts-ignore - userAccount exists in the IDL
                    const userVaultAccountData = await program.account.userAccount.fetch(userVaultAccount);
                    setStakedAmount(userVaultAccountData.stakeAmount / LAMPORTS_PER_SOL);
                    console.log("User Vault Account:", userVaultAccountData);
                } catch (error) {
                    console.log("User hasn't staked yet");
                    setStakedAmount(0);
                }
            } catch (error) {
                console.error("Error fetching user vault account:", error);
                toast.error("Failed to fetch staked balance");
            }
        }
    }
    
    // Fetch User's Reward Token Balance
    const fetchRewardTokenBalance = async () => {
        if (wallet && publicKey) {
            try {
                // Get the associated token account for the reward token
                const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = await import('@solana/spl-token');
                const userStakeRewardTokenAccount = await getAssociatedTokenAddress(
                    STAKE_REWARD_TOKEN,
                    publicKey
                );
                
                try {
                    const tokenAccountInfo = await connection.getTokenAccountBalance(userStakeRewardTokenAccount);
                    setRewardTokenBalance(tokenAccountInfo.value.uiAmount);
                } catch (error) {
                    console.log("User doesn't have reward tokens yet");
                    setRewardTokenBalance(0);
                }
            } catch (error) {
                console.error("Error fetching reward token balance:", error);
                toast.error("Failed to fetch reward token balance");
            }
        }
    }


    return (
        <div className="text-center mt-8">
            <div className="flex flex-col items-center justify-center mb-8">
                {/* Show Program Address */}
                <div className="mb-8 p-4 bg-secondary/30 backdrop-blur-sm rounded-xl border border-[#3a1f7a]/30 w-full max-w-xl">
                    <p className="text-lg font-semibold text-gray-200">Program Address</p>
                    <p className="text-sm font-mono text-gray-400 mt-2 bg-[#1a1a2e] p-2 rounded-lg overflow-x-auto">{PROGRAM_ID.toString()}</p>
                    <div className="mt-4">
                        <a
                            href={`https://explorer.solana.com/address/${PROGRAM_ID.toString()}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all duration-200 inline-flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            View on Explorer
                        </a>
                    </div>
                </div>
                
                {/* Show Program Data */}
                {connected ? (
                    <>
                    <div className="w-full gap-6 mb-8 flex justify-center items-stretch">
                        <Card className="flex flex-col justify-start px-6 py-5 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] text-white rounded-xl border border-[#3a1f7a]/30 shadow-lg flex-1 min-w-[200px] w-full">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-2 rounded-full bg-blue-500/10 mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M16 12h-6.5a2 2 0 1 0 0 4H12"></path>
                                        <path d="M10 8h6.5a2 2 0 1 1 0 4H14"></path>
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-200">Total Protocol Staked:</p>
                            </div>
                            <p className="text-2xl font-bold text-center">{totalStaked !== null ? `${totalStaked.toFixed(4)} SOL` : "Loading..."}</p>
                        </Card>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-8 w-full">
                        <Card className="flex flex-col justify-start px-6 py-5 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] text-white rounded-xl border border-[#3a1f7a]/30 shadow-lg flex-1 min-w-[200px]">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-2 rounded-full bg-blue-500/10 mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M16 12h-6.5a2 2 0 1 0 0 4H12"></path>
                                        <path d="M10 8h6.5a2 2 0 1 1 0 4H14"></path>
                                    </svg>
                                </div>
                                <p className="text-md font-semibold text-gray-200">Solana Balance</p>
                            </div>
                            <p className="text-2xl font-bold text-center">{solanaBalance !== null ? `${solanaBalance.toFixed(4)} SOL` : "Loading..."}</p>
                        </Card>
                        
                        <Card className="flex flex-col justify-start px-6 py-5 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] text-white rounded-xl border border-[#3a1f7a]/30 shadow-lg flex-1 min-w-[200px]">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-2 rounded-full bg-purple-500/10 mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                        <path d="M12 2v20"></path>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                </div>
                                <p className="text-md font-semibold text-gray-200">Staked Amount</p>
                            </div>
                            <p className="text-2xl font-bold text-center">{stakedAmount !== null ? `${stakedAmount.toFixed(4)} SOL` : "Loading..."}</p>
                        </Card>
                        
                        <Card className="flex flex-col justify-start px-6 py-5 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] text-white rounded-xl border border-[#3a1f7a]/30 shadow-lg flex-1 min-w-[200px]">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-2 rounded-full bg-pink-500/10 mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                                        <circle cx="8" cy="8" r="6"></circle>
                                        <circle cx="16" cy="16" r="6"></circle>
                                    </svg>
                                </div>
                                <p className="text-md font-semibold text-gray-200">Reward Tokens</p>
                            </div>
                            <p className="text-2xl font-bold text-center">{rewardTokenBalance !== null ? `${rewardTokenBalance.toFixed(4)}` : "Loading..."}</p>
                        </Card>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 w-full">
                        <StakeProgramDeposit />
                        <StakeProgramWithdraw />
                        <StakeProgramClaim />
                    </div> 
                    </> 
                ) : (
                    <div className="p-8 bg-secondary/20 backdrop-blur-sm rounded-xl border border-[#3a1f7a]/30 w-full max-w-md">
                        <div className="flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4">
                                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                                <circle cx="12" cy="16" r="1"></circle>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <p className="text-xl font-semibold text-gray-300 mb-2">Wallet Not Connected</p>
                            <p className="text-gray-400 text-center mb-4">Connect your wallet to view your staking information and perform actions</p>
                        </div>
                    </div>
                )}   
            </div>
        </div>
    )
}
