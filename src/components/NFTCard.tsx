/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber, providers } from 'ethers';
import Image from 'next/image';
import React, { FC, useState } from 'react';
import { IoAddCircleOutline, IoRemoveCircleOutline } from 'react-icons/io5';
import Swal from 'sweetalert2';

import { MUMBAI_PROVIDER } from '@/common/constants';
import { contracts } from '@/common/contracts';
import { getContract } from '@/helpers/getContract';
import { INFT_ASSET, INFT_TOKEN } from '@/interfaces/nft.interface';

interface IAssetProps {
  nft_asset: INFT_ASSET;
  address: any;
  changed: boolean;
  setChanged: any;
  setIsLoadingMarketplace: React.Dispatch<React.SetStateAction<boolean>>;
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
  setIsLoadingMarketplace,
}) => {
  const [amount, setAmount] = useState<number>(0);

  const purchaseToken = async (selectedToken: number) => {
    try {
      setIsLoadingMarketplace(true);
      const contract = await getContract(
        MUMBAI_PROVIDER,
        contracts.DARKSALE.address,
        contracts.DARKSALE.abi
      );
      let provider = null,
        signer = null;
      //@ts-ignore
      provider = new providers.Web3Provider(window.ethereum);
      //@ts-ignore
      signer = provider.getSigner(address);

      console.log(selectedToken);
      console.log(BigNumber.from(amount.toString()));

      const transaction = await contract
        .connect(signer)
        .purchaseNftById(selectedToken, BigNumber.from(amount.toString()));

      const response = await transaction.wait();
      const transactionHash = response.transactionHash;
      if (transactionHash) {
        Swal.fire({
          icon: 'success',
          title: 'Transacción ejecutada correctamente.',
        });
      }

      setIsLoadingMarketplace(false);
    } catch (error: any) {
      setIsLoadingMarketplace(false);
      if (error.reason) {
        Swal.fire({
          icon: 'error',
          title: error.reason,
        });
      }
    }
  };

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
        {(nft_asset.price / 1000000).toFixed(2)} USDC
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
          purchaseToken(
            Number(
              nft_asset.name.substring(
                nft_asset.name.length - 3,
                nft_asset.name.length
              )
            )
          );
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
