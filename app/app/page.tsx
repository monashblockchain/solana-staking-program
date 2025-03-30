"use client";

import dynamic from 'next/dynamic';
import StakeProgram from '@/components/StakeProgram';
import { Toaster } from "@/components/ui/sonner";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#0a0a14]">
      <div 
        className="w-[800px] bg-card/80 backdrop-blur-sm text-white p-10 rounded-2xl shadow-xl text-center border border-[#3a1f7a]/20"
        style={{ animation: "glow 4s infinite ease-in-out" }}
      >
        <h1 
          className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8a2be2] via-[#4169e1] to-[#9370db] pb-1"
          style={{ backgroundSize: "200% 200%", animation: "gradientShift 6s infinite linear" }}
        >
          Solana Staking Platform
        </h1>
        <p className="mt-4 text-gray-300 text-lg">
          Stake your SOL and earn rewards on Solana Devnet
        </p>
        <div className="mt-8 mb-6 flex justify-center">
          <div className="px-4 py-2 bg-secondary/50 backdrop-blur-sm rounded-xl border border-[#3a1f7a]/30">
            <WalletMultiButtonDynamic style={{ backgroundColor: "transparent", border: "none" }} />
          </div>
        </div>
        <div>
          <StakeProgram />
        </div>
      </div>
      <Toaster position="top-right" />
    </main>
  );
}
