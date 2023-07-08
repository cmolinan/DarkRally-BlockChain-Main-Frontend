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
import {
  useContractEvent,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';

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
  //         title: 'Transacción ejecutada correctamente.',
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
          title: 'Transacción ejecutada correctamente.',
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
          title: 'Transacción ejecutada correctamente.',
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
          title: 'Transacción ejecutada correctamente.',
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

  useContractEvent({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    eventName: 'RegisterNewTypeOfNFT',
    listener(log) {
      console.log(log);
    },
  });
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
            'Transacción ejecutada correctamente. <a>https://mumbai.polygonscan.com/address/' +
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

  const { data, isError, isLoading } = useWaitForTransaction({
    hash: '0x674182516ef8cfd487b0818a3b78e3ed9dae2837a76b04b1d6b7f10ea760220e',
    onError(error) {
      console.log('Error', error);
    },
    chainId: 1,
  });

  console.log(data);

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
            <h6>Registrar precio de NFT's: </h6>
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
                    'py-2 focus:ring-brand-yellow focus:border-brand-yellow focus:shadow-outline border-none',
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
                Guardar
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
                        'py-2 outline-none focus:outline-none active:outline-none',
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
                  label='Nombre del NFT'
                  fullWidth
                  className=''
                  InputProps={{
                    className:
                      'py-2 outline-none focus:outline-none active:outline-none',
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
                  label='Categoria'
                  fullWidth
                  className=''
                  InputProps={{
                    className:
                      'py-2 outline-none focus:outline-none active:outline-none',
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
                  label='Metadata IPFS'
                  fullWidth
                  className=''
                  InputProps={{
                    className:
                      'py-2 outline-none focus:outline-none active:outline-none',
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
                  label='Stock máximo'
                  fullWidth
                  className=''
                  type='number'
                  InputProps={{
                    className:
                      'py-2 outline-none focus:outline-none active:outline-none',
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
                  label='Precio'
                  fullWidth
                  type='number'
                  className=''
                  InputProps={{
                    className:
                      'py-2 outline-none focus:outline-none active:outline-none',
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
                  label='Cantidad de usos'
                  fullWidth
                  type='number'
                  className=''
                  InputProps={{
                    className:
                      'py-2 outline-none focus:outline-none active:outline-none',
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
                  Guardar
                </button>
                {(errors.tokenId ||
                  errors.nameOfNFT ||
                  errors.category ||
                  errors.metadataHashIpfs) && (
                  <p className='text-red-600'>Formulario inválido.</p>
                )}
              </div>
            </div>
          </div>
          <div className='mt-10 flex flex-col space-y-5'>
            <h6>Pausar contrato: </h6>
            <div className='flex flex-row items-center space-x-5'>
              <button
                onClick={() => {
                  pauseContract.write();
                }}
                type='button'
                className='rounded-md bg-gray-800 p-2 px-4   text-white'
              >
                Pausar
              </button>
            </div>
          </div>
          <div className='my-10 flex flex-col space-y-5'>
            <h6>Des-Pausar contrato: </h6>
            <div className='flex flex-row items-center space-x-5'>
              <button
                onClick={() => {
                  unpauseContract.write();
                }}
                type='button'
                className='rounded-md bg-gray-800 p-2 px-4   text-white'
              >
                Des-pausar
              </button>
            </div>
          </div>
        </Box>
      )}
    </>
  );
};
