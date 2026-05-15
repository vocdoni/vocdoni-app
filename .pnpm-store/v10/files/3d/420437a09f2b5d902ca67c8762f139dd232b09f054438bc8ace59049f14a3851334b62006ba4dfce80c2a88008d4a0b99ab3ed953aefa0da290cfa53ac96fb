import React from 'react';
import type { GetEnsNameReturnType } from 'viem';
import type { GetEnsAvatarReturnType } from 'viem/actions';
import type { useAccount } from 'wagmi';
import type { useProfile } from '../../hooks/useProfile';
interface ProfileDetailsProps {
    address: ReturnType<typeof useAccount>['address'];
    ensAvatar: GetEnsAvatarReturnType | undefined;
    ensName: GetEnsNameReturnType | undefined;
    balance: ReturnType<typeof useProfile>['balance'];
    onClose: () => void;
    onDisconnect: () => void;
}
export declare function ProfileDetails({ address, ensAvatar, ensName, balance, onClose, onDisconnect, }: ProfileDetailsProps): React.JSX.Element | null;
export {};
