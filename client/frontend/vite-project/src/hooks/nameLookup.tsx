import { useAccount, useEnsAddress, useEnsAvatar, useEnsName } from 'wagmi';
import { normalize } from 'viem/ens';
import { formatAddress } from '@ens-tools/format';

export const NameLookup = () => {
    const name = normalize("luc.eth");
    const { data: avatar } = useEnsAvatar({ name })
    const { data: ethereum } = useEnsAddress({ name, coinType: 60 });

    return (
        <div>
            {ethereum && formatAddress(ethereum)}<br />
            {avatar && <img src={avatar} />}
        </div>
    );
};