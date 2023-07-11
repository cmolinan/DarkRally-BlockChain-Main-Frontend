/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { providers } from 'ethers';
import React, { FC, useState } from 'react';
import Swal from 'sweetalert2';
import { useContractWrite } from 'wagmi';

import { Spinner } from '@/components/Spinner';

import { MUMBAI_PROVIDER, TOKEN_KEYS } from '@/common/constants';
import { contracts } from '@/common/contracts';
import { getContract } from '@/helpers/getContract';

interface IProps {
  address: string;
}

export const AdministrationPanel: FC<IProps> = ({ address }) => {
  const [registerNftForm, setRegisterNftForm] = useState({
    tokenId: '101',
    price: '',
  });
  const [isLoadingCreateNewNFT, setIsLoadingCreateNewNFT] = useState(false);
  const [isLoadingSetNewPrice, setIsLoadingSetNewPrice] = useState(false);

  const [registerNewTypeNftForm, setRegisterNewTypeNftForm] = useState<any>({
    tokenId: '',
    nameOfNFT: '',
    category: '',
    metadataHashIpfs: '',
    maxSupply: 0,
    initialPrice: 0,
    askDateForMint: false,
    validUntil: 0,
    entriesCounter: 0,
  });
  const [errors, setErrors] = useState<any>({
    tokenId: false,
    price: false,
    nameOfNFT: false,
  });
  // const registerNftPrice = useContractWrite({
  //   address: contracts.DARKSALE.address as `0x${string}`,
  //   abi: contracts.DARKSALE.abi,
  //   functionName: 'setNftPrice',
  //   args: [[Number(registerNftForm.tokenId)], [registerNftForm.price]],
  //   onSuccess: (e) => {
  //     if (e.hash) {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Transaction successfully executed.',
  //       });
  //     }
  //   },
  //   onError: (err: any) => {
  //     if (err.details) {
  //       Swal.fire({
  //         icon: 'error',
  //         title: err.details,
  //       });
  //     }
  //   },
  // });
  const pauseContract = useContractWrite({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    functionName: 'pause',
    onSuccess: (e) => {
      if (e.hash) {
        Swal.fire({
          icon: 'success',
          title: 'Transaction successfully executed.',
        });
      }
    },
    onError: (err: any) => {
      if (err.details) {
        Swal.fire({
          icon: 'error',
          title: err.details,
        });
      }
    },
  });
  const unpauseContract = useContractWrite({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    functionName: 'unpause',
    onSuccess: (e) => {
      if (e.hash) {
        Swal.fire({
          icon: 'success',
          title: 'Transaction successfully executed.',
        });
      }
    },
    onError: (err: any) => {
      if (err.details) {
        Swal.fire({
          icon: 'error',
          title: err.details,
        });
      }
    },
  });

  const registerNewTypeNFT = async () => {
    try {
      setIsLoadingCreateNewNFT(true);
      const contract = await getContract(
        MUMBAI_PROVIDER,
        contracts.DARKTOKEN.address,
        contracts.DARKTOKEN.abi
      );
      let provider = null,
        signer = null;
      //@ts-ignore
      provider = new providers.Web3Provider(window.ethereum);
      //@ts-ignore
      signer = provider.getSigner(address);

      const transaction = await contract
        .connect(signer)
        .registerNewTypeOfNft(
          registerNewTypeNftForm.tokenId,
          registerNewTypeNftForm.nameOfNFT,
          registerNewTypeNftForm.category,
          registerNewTypeNftForm.metadataHashIpfs,
          registerNewTypeNftForm.maxSupply,
          registerNewTypeNftForm.initialPrice,
          registerNewTypeNftForm.askDateForMint,
          registerNewTypeNftForm.validUntil,
          registerNewTypeNftForm.entriesCounter
        );

      const response = await transaction.wait();
      const transactionHash = response.transactionHash;

      if (transactionHash) {
        Swal.fire({
          icon: 'success',
          title: 'Transaction successfully executed.',
        });
      }
      setIsLoadingCreateNewNFT(false);
    } catch (error: any) {
      setIsLoadingCreateNewNFT(false);
      if (error.reason) {
        Swal.fire({
          icon: 'error',
          title: error.reason,
        });
      }
    }
  };

  const registerNFTPrice = async () => {
    try {
      setIsLoadingSetNewPrice(true);
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

      const transaction = await contract
        .connect(signer)
        .setNftPrice(
          [Number(registerNftForm.tokenId)],
          [registerNftForm.price]
        );
      console.log(transaction);

      const response = await transaction.wait();
      const transactionHash = response.transactionHash;
      if (transactionHash) {
        Swal.fire({
          icon: 'success',
          title:
            'Transaction successfully executed. <a>https://mumbai.polygonscan.com/address/' +
            contracts.DARKTOKEN.address +
            '</a>',
        });
      }

      setIsLoadingSetNewPrice(false);
    } catch (error: any) {
      console.log(error);

      setIsLoadingSetNewPrice(false);
      if (error.reason) {
        Swal.fire({
          icon: 'error',
          title: error.reason,
        });
      }
    }
  };

  const handleChangeTokenId = (event: SelectChangeEvent) => {
    setRegisterNftForm({
      ...registerNftForm,
      tokenId: event.target.value as string,
    });
  };

  return (
    <>
      {isLoadingCreateNewNFT ||
      isLoadingSetNewPrice ||
      pauseContract.isLoading ||
      unpauseContract.isLoading ? (
        <Spinner color='stroke-gray-800' />
      ) : (
        <Box component='form' noValidate className='mt-5' autoComplete='off'>
          <div className='flex flex-col space-y-5'>
            <h6>Register NFT's price: </h6>
            <div className='flex flex-row items-center space-x-5'>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-label'>Token Id</InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  value={registerNftForm.tokenId}
                  label='Token Id'
                  onChange={handleChangeTokenId}
                >
                  {TOKEN_KEYS.map((token: number, i) => {
                    return (
                      <MenuItem key={i} selected value={token.toString()}>
                        {token}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <TextField
                required
                id='outlined-required'
                label='Price'
                fullWidth
                type='number'
                InputProps={{
                  className:
                    'focus:ring-brand-yellow focus:border-brand-yellow focus:shadow-outline border-none',
                  sx: {
                    borderWidth: 0,
                  },
                }}
                onChange={(e) => {
                  setRegisterNftForm({
                    ...registerNftForm,
                    price: e.target.value,
                  });
                }}
                error={errors.price}
              />
              <button
                onClick={() => {
                  if (registerNftForm.price.trim() === '') {
                    setErrors({ ...errors, price: true });
                    return;
                  }
                  registerNFTPrice();
                }}
                type='button'
                className='rounded-md bg-gray-800 p-2 px-4   text-white'
              >
                Save
              </button>
            </div>
          </div>
          <div className='mt-10 flex flex-col space-y-5'>
            <h6>Registrar nuevo tipo de NFT: </h6>
            <div className='flex flex-row items-center space-x-5'>
              <div className='flex w-full flex-col space-y-5'>
                <FormControl fullWidth>
                  <TextField
                    required
                    id='outlined-required'
                    label='Token Id'
                    fullWidth
                    className=''
                    InputProps={{
                      className:
                        'outline-none focus:outline-none active:outline-none',
                    }}
                    onChange={(e) => {
                      setRegisterNewTypeNftForm({
                        ...registerNewTypeNftForm,
                        tokenId: Number(e.target.value),
                      });
                    }}
                  />
                </FormControl>
                <TextField
                  required
                  id='outlined-required'
                  label='Name of NFT'
                  fullWidth
                  className=''
                  InputProps={{
                    className:
                      'outline-none focus:outline-none active:outline-none',
                  }}
                  onChange={(e) => {
                    setRegisterNewTypeNftForm({
                      ...registerNewTypeNftForm,
                      nameOfNFT: e.target.value,
                    });
                  }}
                />
                <TextField
                  required
                  id='outlined-required'
                  label='Category'
                  fullWidth
                  className=''
                  InputProps={{
                    className:
                      'outline-none focus:outline-none active:outline-none',
                  }}
                  onChange={(e) => {
                    setRegisterNewTypeNftForm({
                      ...registerNewTypeNftForm,
                      category: e.target.value,
                    });
                  }}
                />
                <TextField
                  required
                  id='outlined-required'
                  label='IPFS Metadata'
                  fullWidth
                  className=''
                  InputProps={{
                    className:
                      'outline-none focus:outline-none active:outline-none',
                  }}
                  onChange={(e) => {
                    setRegisterNewTypeNftForm({
                      ...registerNewTypeNftForm,
                      metadataHashIpfs: e.target.value,
                    });
                  }}
                />
                <TextField
                  required
                  id='outlined-required'
                  label='Maximum stock'
                  fullWidth
                  className=''
                  type='number'
                  InputProps={{
                    className:
                      'outline-none focus:outline-none active:outline-none',
                  }}
                  onChange={(e) => {
                    setRegisterNewTypeNftForm({
                      ...registerNewTypeNftForm,
                      maxSupply: Number(e.target.value),
                    });
                  }}
                  error={errors.maxSpply}
                />
                <TextField
                  required
                  id='outlined-required'
                  label='Price'
                  fullWidth
                  type='number'
                  className=''
                  InputProps={{
                    className:
                      'outline-none focus:outline-none active:outline-none',
                  }}
                  onChange={(e) => {
                    setRegisterNewTypeNftForm({
                      ...registerNewTypeNftForm,
                      initialPrice: Number(e.target.value),
                    });
                  }}
                />
                <TextField
                  required
                  id='outlined-required'
                  label='Number of uses'
                  fullWidth
                  type='number'
                  className=''
                  InputProps={{
                    className:
                      'outline-none focus:outline-none active:outline-none',
                  }}
                  onChange={(e) => {
                    setRegisterNewTypeNftForm({
                      ...registerNewTypeNftForm,
                      entriesCounter: Number(e.target.value),
                    });
                  }}
                />

                <button
                  onClick={() => {
                    if (
                      registerNewTypeNftForm.tokenId.toString().trim() === ''
                    ) {
                      setErrors({ ...errors, tokenId: true });
                      return;
                    }
                    if (registerNewTypeNftForm.nameOfNFT.trim() === '') {
                      setErrors({ ...errors, nameOfNFT: true });
                      return;
                    }
                    if (registerNewTypeNftForm.category.trim() === '') {
                      setErrors({ ...errors, category: true });
                      return;
                    }
                    if (registerNewTypeNftForm.metadataHashIpfs.trim() === '') {
                      setErrors({ ...errors, metadataHashIpfs: true });
                      return;
                    }

                    registerNewTypeNFT();
                  }}
                  type='button'
                  className='rounded-md bg-gray-800 p-2 px-4   text-white'
                >
                  Save
                </button>
                {(errors.tokenId ||
                  errors.nameOfNFT ||
                  errors.category ||
                  errors.metadataHashIpfs) && (
                  <p className='text-red-600'>Invalid form.</p>
                )}
              </div>
            </div>
          </div>
          <div className='mt-10 flex flex-col space-y-5'>
            <h6>Pause contract: </h6>
            <div className='flex flex-row items-center space-x-5'>
              <button
                onClick={() => {
                  pauseContract.write();
                }}
                type='button'
                className='rounded-md bg-gray-800 p-2 px-4   text-white'
              >
                Pause
              </button>
            </div>
          </div>
          <div className='my-10 flex flex-col space-y-5'>
            <h6>Un-Pause contract: </h6>
            <div className='flex flex-row items-center space-x-5'>
              <button
                onClick={() => {
                  unpauseContract.write();
                }}
                type='button'
                className='rounded-md bg-gray-800 p-2 px-4   text-white'
              >
                Un-Pause
              </button>
            </div>
          </div>
        </Box>
      )}
    </>
  );
};
