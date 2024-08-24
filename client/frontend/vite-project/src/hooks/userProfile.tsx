import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { formatAddress } from 'ens-tools';
import { FC } from 'react';

export const YourApp: FC = () => {
    const { address } = useAccount();
    const { data: name } = useEnsName({ address });
    const { data: avatar } = useEnsAvatar({ name });

    return (
        <div className="flex items-center gap-2">
            <img
                src={avatar || 'https://docs.ens.domains/fallback.svg'}
                className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col gap-0 leading-3 pr-10">
                {name && <span className="font-bold">{name}</span>}
                <span>{formatAddress(address)}</span>
            </div>
        </div>
    );
};