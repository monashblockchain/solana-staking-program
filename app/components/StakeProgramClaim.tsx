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

import {PROGRAM_ID, STAKE_VAULT, STAKE_VAULT_AUTHORITY, STAKE_REWARD_TOKEN, getUserVaultAccount} from "@/lib/addresses";

// Solana Connection
const connection = new Connection(RPC_LINK);

// Returns a card with button to call the claim function
export default function StakeProgramClaim() {
    const { publicKey, connected } = useWallet();
    const wallet = useAnchorWallet();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [stakedAmount, setStakedAmount] = useState<number | null>(null);
    const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
    const [timeElapsed, setTimeElapsed] = useState<number | null>(null);

    // Fetch staked amount and last claim time when component mounts
    useEffect(() => {
        if (connected && wallet && publicKey) {
            fetchUserAccountData();
        }
    }, [connected, publicKey]);

    // Update time elapsed every second
    useEffect(() => {
        if (lastClaimTime === null) return;
        
        const interval = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            setTimeElapsed(currentTime - lastClaimTime);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [lastClaimTime]);

    const fetchUserAccountData = async () => {
        if (!wallet || !publicKey) return;

        try {
            const userVaultAccount = getUserVaultAccount(publicKey);
            const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
            const program = new anchor.Program(IDL as Stake, provider);
            
            try {
                // @ts-ignore - userAccount exists in the IDL
                const userVaultAccountData = await program.account.userAccount.fetch(userVaultAccount);
                setStakedAmount(userVaultAccountData.stakeAmount / LAMPORTS_PER_SOL);
                setLastClaimTime(userVaultAccountData.lastClaimTime);
                
                // Calculate time elapsed since last claim
                const currentTime = Math.floor(Date.now() / 1000);
                setTimeElapsed(currentTime - userVaultAccountData.lastClaimTime);
            } catch (error) {
                console.log("User hasn't staked yet");
                setStakedAmount(0);
                setLastClaimTime(null);
                setTimeElapsed(null);
            }
        } catch (error) {
            console.error("Error fetching user account data:", error);
        }
    };

    const handleClaim = async () => {
        if (!wallet || !publicKey) {
            toast.error("Wallet not connected");
            return;
        }

        if (stakedAmount === 0) {
            toast.error("You need to stake SOL first");
            return;
        }

        try {
            setIsLoading(true);
            
            // Create provider and program
            const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
            const program = new anchor.Program(IDL as Stake, provider);
            
            // Get user vault account
            const userVaultAccount = getUserVaultAccount(publicKey);
            
            // Get user's token account for rewards
            const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = await import('@solana/spl-token');
            const userStakeRewardTokenAccount = await getAssociatedTokenAddress(
                STAKE_REWARD_TOKEN,
                publicKey
            );
            
            // Execute claim transaction
            const tx = await program.methods
                .claim()
                .accounts({
                    user: publicKey,
                    stakeVault: STAKE_VAULT,
                    stakeVaultAuthority: STAKE_VAULT_AUTHORITY,
                    stakeRewardToken: STAKE_REWARD_TOKEN,
                    userAccount: userVaultAccount,
                    userStakeRewardTokenAccount: userStakeRewardTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();
            
            toast.success("Claim Successful", {
                description: (
                <a
                    href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline flex items-center"
                >
                    View on Explorer <ArrowRight className="ml-1 h-3 w-3" />
                </a>
                ),
            });
            console.log("Claim transaction signature:", tx);
            
            // Refresh user account data
            await fetchUserAccountData();
        } catch (error) {
            console.error("Error claiming:", error);
            toast.error("Failed to claim: " + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate estimated rewards
    const calculateEstimatedRewards = () => {
        if (stakedAmount === null || timeElapsed === null) return 0;
        
        // REWARD = time_elapsed * REWARD_RATE * (stake_amount in SOL)
        // REWARD_RATE = 0.001 per second (from smart contract)
        const REWARD_RATE = 1000;
        return timeElapsed * REWARD_RATE * stakedAmount / 10**6;
    };

    return (
        <Card className="flex flex-col justify-between px-6 py-5 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] text-white rounded-xl border border-[#3a1f7a]/30 shadow-lg flex-1">
            <div className="mb-5">
                <div className="flex items-center justify-center mb-4">
                    <div className="p-2 rounded-full bg-blue-500/10 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                            <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                    </div>
                    <p className="text-md font-semibold text-gray-200">Claim Rewards</p>
                </div>
                
                {stakedAmount !== null && stakedAmount > 0 ? (
                    <div className="bg-[#0f0f1a] border border-[#3a1f7a]/20 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-gray-400">Staked:</p>
                            <p className="text-xs font-medium text-gray-300">{stakedAmount.toFixed(4)} SOL</p>
                        </div>
                        
                        {timeElapsed !== null && (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs text-gray-400">Time elapsed:</p>
                                    <p className="text-xs font-medium text-gray-300">{timeElapsed} seconds</p>
                                </div>
                                
                                <div className="flex justify-between items-center pt-2 border-t border-[#3a1f7a]/20">
                                    <p className="text-xs text-gray-400">Estimated rewards:</p>
                                    <p className="text-sm font-medium text-primary">{calculateEstimatedRewards().toFixed(2)} tokens</p>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="bg-[#0f0f1a] border border-[#3a1f7a]/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400">You need to stake SOL first</p>
                    </div>
                )}
            </div>
            
            <Button 
                onClick={handleClaim} 
                disabled={isLoading || !connected || stakedAmount === null || stakedAmount === 0}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-none w-full py-2 transition-all duration-200"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </div>
                ) : "Claim Rewards"}
            </Button>
        </Card>
    );
}
