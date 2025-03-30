use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};

declare_id!("EGn97R6FkiA9HGRQzrrpL2w7XWY11cmUvHbtYPC6XcCR");

// Constants for token rewards
const REWARD_RATE: u64 = 1000; // 0.001 token per second per SOL staked

#[program]
pub mod stake {
    use super::*;

    // Initialize the program and create a vault
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let stake_vault = &mut ctx.accounts.stake_vault;
        stake_vault.creator = ctx.accounts.user.key();
        stake_vault.stake_vault = stake_vault.key();
        Ok(())
    }

    // Deposit an amount of Solana into the programc
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        msg!("Depositing Solana to Stake");
        let user_account = &mut ctx.accounts.user_account;

        // Initialize a new user account if it doesn't exist
        if user_account.owner == Pubkey::default() {
            user_account.owner = ctx.accounts.user.key();
            user_account.stake_amount = 0;
            user_account.stake_vault = ctx.accounts.stake_vault.key();
            user_account.last_claim_time = Clock::get()?.unix_timestamp;
            msg!("New user account created");
        }
        
        // Transfer SOL from user to the program
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.stake_vault_authority.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;
        msg!("Deposited amount: {}", amount);

        // Update user's stake amount
        user_account.stake_amount += amount;
        Ok(())
    }

    // Withdraw an amount of Solana from the program
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        msg!("Withdrawing Staked Solana");
        let user_account = &mut ctx.accounts.user_account;
        
        // Check if user has enough staked amount
        require!(user_account.stake_amount >= amount, ErrorCode::InsufficientFunds);
    
        // Generate a signer to authorize the SOL transfer from the vault
        let stake_vault_authority_bump = ctx.bumps.stake_vault_authority;
        let seeds = &[
            b"stake_vault_authority".as_ref(), 
            &[stake_vault_authority_bump]
        ];
        let signer = &[&seeds[..]];

        // Transfer SOL from the vault to the user
        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.stake_vault_authority.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
            signer,
        );
        system_program::transfer(cpi_context, amount)?;
        msg!("Withdrawed amount: {}", amount);

        // Update user's stake amount
        user_account.stake_amount -= amount;
        Ok(())
    }

    // Function to claim tokens based on staking duration
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        msg!("Claim Stake Reward");
        let user_account = &mut ctx.accounts.user_account;
        
        // Fetch time and calculate user's staking duration (e.g. 10 days)
        let current_time = Clock::get()?.unix_timestamp;
        let time_elapsed = current_time - user_account.last_claim_time;
        msg!("Current time: {}", current_time);
        msg!("Last claim time: {}", user_account.last_claim_time);

        // Convert time_elapsed to u64 (safe because we checked it's positive)
        let time_elapsed_u64 = time_elapsed as u64;
        msg!("Time elapsed since last claim: {}", time_elapsed_u64);
        
        // Calculate reward amount based on time elapsed and stake amount
        // REWARD = time_elapsed * REWARD_RATE * (stake_amount in SOL)
        let reward_amount = time_elapsed_u64
            .checked_mul(REWARD_RATE).unwrap()
            .checked_mul(user_account.stake_amount).unwrap()
            .checked_div(1_000_000_000).unwrap();

        // Generate signer to authorize the minting of the tokens
        let stake_vault_authority_bump = ctx.bumps.stake_vault_authority;
        let seeds = &[
            b"stake_vault_authority".as_ref(), 
            &[stake_vault_authority_bump]
        ];
        let signer = &[&seeds[..]];

        // Mint token to the user's token account
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            MintTo {
                mint: ctx.accounts.stake_reward_token.to_account_info(),
                to: ctx.accounts.user_stake_reward_token_account.to_account_info(),
                authority: ctx.accounts.stake_vault_authority.to_account_info(),
            }, 
            signer
        );
        token::mint_to(cpi_ctx, reward_amount)?;
        msg!("Reward amount: {}", reward_amount);

        // Update last claim time
        user_account.last_claim_time = current_time;
        Ok(())
    }
}


#[account]
pub struct StakeVault{
    pub creator: Pubkey,
    pub stake_vault: Pubkey,
}
impl StakeVault {
    pub const LEN: usize = 8 + 32 + 32; // discriminator + pubkey + pubkey
}

// Account to store user staking information
#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub stake_vault: Pubkey,
    pub stake_amount: u64,
    pub last_claim_time: i64,
}
impl UserAccount {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8; // discriminator + pubkey + pubkey + u64 + i64
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        seeds = [b"stake_reward_token"],
        bump,
        mint::decimals = 6,
        mint::authority = stake_vault_authority,
    )]
    pub stake_reward_token: Account<'info, Mint>,

    /// CHECK: Read only authority
    #[account(
        seeds = [b"stake_vault_authority"],
        bump,
    )]
    pub stake_vault_authority: AccountInfo<'info>,
    
    #[account(
        init,
        payer = user,
        space = StakeVault::LEN,
        seeds = [b"stake_vault"],
        bump,
    )]
    pub stake_vault: Account<'info, StakeVault>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// Context for depositing SOL
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"stake_vault"],
        bump,
    )]
    pub stake_vault: Account<'info, StakeVault>,

    /// CHECK: Read only authority
    #[account(
        mut,
        seeds = [b"stake_vault_authority"],
        bump,
    )]
    pub stake_vault_authority: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = UserAccount::LEN,
        seeds = [b"user_account", stake_vault.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, UserAccount>,

    pub system_program: Program<'info, System>,
}

// Context for withdrawing SOL
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"stake_vault"],
        bump,
    )]
    pub stake_vault: Account<'info, StakeVault>,

    /// CHECK: Read only authority
    #[account(
        mut,
        seeds = [b"stake_vault_authority"],
        bump,
    )]
    pub stake_vault_authority: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"user_account", stake_vault.key().as_ref(), user.key().as_ref()],
        bump,
        constraint = user_account.owner == user.key() @ ErrorCode::InvalidOwner,
        constraint = user_account.stake_vault == stake_vault.key() @ ErrorCode::InvalidVault,
    )]
    pub user_account: Account<'info, UserAccount>,
    
    pub system_program: Program<'info, System>,
}

// Context for claiming tokens
#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"stake_vault"],
        bump,
    )]
    pub stake_vault: Account<'info, StakeVault>,

    /// CHECK: Read only authority
    #[account(
        mut,
        seeds = [b"stake_vault_authority"],
        bump,
    )]
    pub stake_vault_authority: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"stake_reward_token"],
        bump,
    )]
    pub stake_reward_token: Account<'info, Mint>,
    
    #[account(
        mut,
        seeds = [b"user_account", stake_vault.key().as_ref(), user.key().as_ref()],
        bump,
        constraint = user_account.owner == user.key() @ ErrorCode::InvalidOwner,
        constraint = user_account.stake_vault == stake_vault.key() @ ErrorCode::InvalidVault,
        constraint = user_account.stake_amount > 0 @ ErrorCode::InsufficientFunds,
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = stake_reward_token,
        associated_token::authority = user,
    )]
    pub user_stake_reward_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for withdrawal")]
    InsufficientFunds,
    #[msg("Invalid owner")]
    InvalidOwner,
    #[msg("Invalid vault")]
    InvalidVault,
    #[msg("Minimum stake duration not met")]
    MinimumStakeDurationNotMet,
}
