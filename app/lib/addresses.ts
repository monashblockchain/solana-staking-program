// @ts-ignore
import IDL from "@/lib/idl.json";
import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(IDL.address);

export const [STAKE_VAULT] = PublicKey.findProgramAddressSync(
  [Buffer.from("stake_vault")],
  PROGRAM_ID
);

export const [STAKE_VAULT_AUTHORITY] = PublicKey.findProgramAddressSync(
  [Buffer.from("stake_vault_authority")],
  PROGRAM_ID
);

export const [STAKE_REWARD_TOKEN] = PublicKey.findProgramAddressSync(
  [Buffer.from("stake_reward_token")],
  PROGRAM_ID
);

export const getUserVaultAccount = (user: PublicKey) => {   
    const [userVaultAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_account"), STAKE_VAULT.toBuffer(), user.toBuffer()],
        PROGRAM_ID
    );
    return userVaultAccount;
}






