/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Image from 'next/image';
import React, { FC, useState } from 'react';
import { IoAddCircleOutline, IoRemoveCircleOutline } from 'react-icons/io5';
import { useContractWrite } from 'wagmi';

import { contracts } from '@/common/contracts';
import { INFT_ASSET, INFT_TOKEN } from '@/interfaces/nft.interface';

interface IAssetProps {
  nft_asset: INFT_ASSET;
  address: any;
  changed: boolean;
  setChanged: any;
}
interface ITokenProps {
  nft_token: INFT_TOKEN;
  assets: INFT_ASSET[];
}

export const NFTAssetCard: FC<IAssetProps> = ({
  nft_asset,
  address,
  changed,
  setChanged,
}) => {
  const [selectedToken, setSelectedToken] = useState<number>();
  const [amount, setAmount] = useState<number>(0);

  const write = useContractWrite({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    functionName: 'mint',
    args: [address, selectedToken, amount],
    onSuccess: () => {
      setChanged(!changed);
    },
  });

  return (
    <div className='flex w-48 flex-col items-center space-y-2 rounded-md border border-gray-300 p-3'>
      <Image
        className='rounded-md'
        alt='nft-asset'
        src={nft_asset.image}
        width={200}
        height={400}
      />
      <p className='text-center text-lg font-semibold'>
        {nft_asset.description}
      </p>
      <p className='text-center text-sm font-medium'>{nft_asset.name}</p>
      <p className='text-center font-normal'>
        {nft_asset.attributes.find((e) => e.trait_type === 'PRICE')
          ? 'Precio: ' +
            nft_asset.attributes.find((e) => e.trait_type === 'PRICE')?.value +
            ' USDT'
          : nft_asset.attributes.find((e) => e.trait_type === 'COLOR')
          ? 'Color: ' +
            nft_asset.attributes.find((e) => e.trait_type === 'COLOR')?.value
          : nft_asset.attributes.find((e) => e.trait_type === 'EXPIRE')
          ? 'Fecha: ' +
            nft_asset.attributes.find((e) => e.trait_type === 'EXPIRE')?.value
          : nft_asset.attributes.find((e) => e.trait_type === 'NAME')
          ? 'Campeón: ' +
            nft_asset.attributes.find((e) => e.trait_type === 'NAME')?.value
          : ''}
      </p>

      <div className='flex items-center space-x-2'>
        <IoRemoveCircleOutline
          className='cursor-pointer'
          onClick={() => {
            if (amount - 1 === -1) {
              return;
            }
            setAmount((prev) => prev - 1);
          }}
          size={20}
        />
        <button className='rounded-md border border-gray-800 p-2 text-gray-800'>
          Cantidad {amount}
        </button>
        <IoAddCircleOutline
          className='cursor-pointer'
          onClick={() => {
            setAmount((prev) => prev + 1);
          }}
          size={20}
        />
      </div>
      <button
        onClick={() => {
          setSelectedToken(
            Number(
              nft_asset.name.substring(
                nft_asset.name.length - 3,
                nft_asset.name.length
              )
            )
          );
          write.write();
        }}
        className='rounded-md bg-gray-800 p-2 text-white'
      >
        Comprar
      </button>
    </div>
  );
};

export const NFTTokenCard: FC<ITokenProps> = ({ nft_token, assets }) => {
  return (
    <div className='flex w-48 flex-col items-center space-y-2 rounded-md border border-gray-300 p-2'>
      <Image
        className='rounded-md'
        alt='nft-asset'
        src={
          assets.find((e) => e.name.includes(nft_token.id.toString()))?.image!
        }
        width={200}
        height={200}
      />
      <p className='text-center text-lg font-semibold'>
        {
          assets.find((e) => e.name.includes(nft_token.id.toString()))
            ?.description
        }
      </p>
      <p className='text-center text-sm font-medium'>
        {assets.find((e) => e.name.includes(nft_token.id.toString()))?.name}
      </p>
      <p className='text-xs font-medium'>{nft_token.cant} ud.</p>
    </div>
  );
};
