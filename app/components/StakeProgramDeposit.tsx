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

// Returns a card with input deposit amount and button to call the deposit function
export default function StakeProgramDeposit() {
    const { publicKey, connected } = useWallet();
    const wallet = useAnchorWallet();
    const [amount, setAmount] = useState<string>('0.1');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDeposit = async () => {
        if (!wallet || !publicKey) {
            toast.error("Wallet not connected");
            return;
        }

        try {
            setIsLoading(true);
            
            // Convert amount to lamports
            const lamports = new anchor.BN(parseFloat(amount) * LAMPORTS_PER_SOL);
            
            // Create provider and program
            const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
            const program = new anchor.Program(IDL as Stake, provider);
            
            // Get user vault account
            const userVaultAccount = getUserVaultAccount(publicKey);
            
            // Execute deposit transaction
            const tx = await program.methods
                .deposit(lamports)
                .accounts({
                    user: publicKey,
                    stakeVault: STAKE_VAULT,
                    stakeVaultAuthority: STAKE_VAULT_AUTHORITY,
                    userAccount: userVaultAccount,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();
            
            toast.success("Deposit Successful", {
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
            console.log("Deposit transaction signature:", tx);
            
            // Refresh balances after deposit
            // This will be handled by the parent component's useEffect
        } catch (error) {
            console.error("Error depositing:", error);
            toast.error("Failed to deposit: " + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col justify-between px-6 py-5 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] text-white rounded-xl border border-[#3a1f7a]/30 shadow-lg flex-1">
            <div className="mb-5">
                <div className="flex items-center justify-center mb-4">
                    <div className="p-2 rounded-full bg-green-500/10 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                            <path d="M12 5v14"></path>
                            <path d="M5 12h14"></path>
                        </svg>
                    </div>
                    <p className="text-md font-semibold text-gray-200">Deposit SOL</p>
                </div>
                <div className="flex items-center bg-[#0f0f1a] border border-[#3a1f7a]/20 rounded-lg p-1 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-200">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 bg-transparent border-none focus:outline-none text-white"
                        min="0.001"
                        step="0.001"
                    />
                    <span className="px-3 py-1 bg-[#1a1a2e] rounded-md text-gray-300 font-medium">SOL</span>
                </div>
            </div>
            <Button 
                onClick={handleDeposit} 
                disabled={isLoading || !connected || parseFloat(amount) <= 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none w-full py-2 transition-all duration-200"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </div>
                ) : "Deposit SOL"}
            </Button>
        </Card>
    );
}
