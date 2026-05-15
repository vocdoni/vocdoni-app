import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { RemoteSigner } from '../remote-signer';

export type WalletOption = { wallet: Wallet | Signer | RemoteSigner };
export type ElectionIdOption = { electionId: string };
export type VoteIdOption = { voteId: string };

export type SendTokensOptions = Partial<WalletOption> & { to: string; amount: number };
export type IsInCensusOptions = Partial<WalletOption & ElectionIdOption>;
export type HasAlreadyVotedOptions = Partial<WalletOption & ElectionIdOption & VoteIdOption>;
export type VotesLeftCountOptions = Partial<WalletOption & ElectionIdOption & VoteIdOption>;
export type IsAbleToVoteOptions = Partial<WalletOption & ElectionIdOption & VoteIdOption>;
