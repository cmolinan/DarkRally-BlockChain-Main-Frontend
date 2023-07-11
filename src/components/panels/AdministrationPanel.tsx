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
import { BigNumber, providers } from 'ethers';
import React, { FC, useState } from 'react';
import Swal from 'sweetalert2';
import { useContractWrite } from 'wagmi';

import { Spinner } from '@/components/Spinner';

import { CATEGORIES, MUMBAI_PROVIDER } from '@/common/constants';
import { contracts } from '@/common/contracts';
import { getContract } from '@/helpers/getContract';
import { INFT_ASSET } from '@/interfaces/nft.interface';

interface IProps {
  address: string;
  assets: INFT_ASSET[];
  token_keys: number[];
}

export const AdministrationPanel: FC<IProps> = ({
  address,
  assets,
  token_keys,
}) => {
  const [registerNftForm, setRegisterNftForm] = useState({
    tokenId: '101',
    price: '',
  });
  const [updateMetadataForm, setUpdateMetadataForm] = useState({
    _tokenId: '101',
    _metadataHashIpfs: '',
  });
  const [updateMaxSupplyForm, setUpdateMaxSupplyForm] = useState({
    _tokenId: '101',
    _maxSupply: '',
  });
  const [tokenIdToDelete, setTokenIdToDelete] = useState('101');
  const [isLoadingCreateNewNFT, setIsLoadingCreateNewNFT] = useState(false);
  const [isLoadingSetNewPrice, setIsLoadingSetNewPrice] = useState(false);
  const [isLoadingUpdateMetadata, setIsLoadingUpdateMetadata] = useState(false);
  const [isLoadingMaxSupply, setIsLoadingMaxSupply] = useState(false);

  const [registerNewTypeNftForm, setRegisterNewTypeNftForm] = useState<any>({
    tokenId: '',
    nameOfNFT: '',
    category: '',
    metadataHashIpfs: '',
    maxSupply: 0,
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
      setErrors([]);

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
  const updateMetadataNft = async () => {
    try {
      setIsLoadingUpdateMetadata(true);
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
        .changeMetadataHashOfNft(
          updateMetadataForm._tokenId,
          updateMetadataForm._metadataHashIpfs
        );

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
      setErrors([]);

      setIsLoadingUpdateMetadata(false);
    } catch (error: any) {
      console.log(error);

      setIsLoadingUpdateMetadata(false);
      if (error.reason) {
        Swal.fire({
          icon: 'error',
          title: error.reason,
        });
      }
    }
  };
  const updateMaxSupplyNft = async () => {
    try {
      setIsLoadingMaxSupply(true);
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
        .changeMaxSupplyOfNft(
          updateMaxSupplyForm._tokenId,
          BigNumber.from(Number(updateMaxSupplyForm._maxSupply))
        );

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
      setErrors([]);

      setIsLoadingMaxSupply(false);
    } catch (error: any) {
      console.log(error);

      setIsLoadingMaxSupply(false);
      if (error.reason) {
        Swal.fire({
          icon: 'error',
          title: error.reason,
        });
      }
    }
  };
  const deleteRegisterOfNFT = async () => {
    Swal.fire({
      title: 'Are you sure you want to delete this NFT?',
      icon: 'warning',
      showCancelButton: true,
    }).then(async (e) => {
      if (e.isConfirmed) {
        try {
          setIsLoadingMaxSupply(true);
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

          console.log(BigNumber.from(Number(tokenIdToDelete)));

          const transaction = await contract
            .connect(signer)
            .deleteRegisterOfTypeOfNft(BigNumber.from(Number(tokenIdToDelete)));

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
          setErrors([]);

          setIsLoadingMaxSupply(false);
        } catch (error: any) {
          console.log(error);

          setIsLoadingMaxSupply(false);
          if (error.reason) {
            Swal.fire({
              icon: 'error',
              title: error.reason,
            });
          }
        }
      }
    });
  };

  const handleChangeTokenId = (event: SelectChangeEvent) => {
    setRegisterNftForm({
      ...registerNftForm,
      tokenId: event.target.value as string,
    });
  };
  const handleChangeMetadataTokenId = (event: SelectChangeEvent) => {
    setUpdateMetadataForm({
      ...updateMetadataForm,
      _tokenId: event.target.value as string,
    });
  };
  const handleChangeSupplyTokenId = (event: SelectChangeEvent) => {
    setUpdateMaxSupplyForm({
      ...updateMaxSupplyForm,
      _tokenId: event.target.value as string,
    });
  };
  const handleChangeCategory = (event: SelectChangeEvent) => {
    setRegisterNewTypeNftForm({
      ...registerNewTypeNftForm,
      category: event.target.value,
    });
  };

  return (
    <>
      {isLoadingCreateNewNFT ||
      isLoadingSetNewPrice ||
      pauseContract.isLoading ||
      isLoadingUpdateMetadata ||
      isLoadingMaxSupply ||
      unpauseContract.isLoading ? (
        <Spinner color='stroke-gray-800' />
      ) : (
        <Box component='form' noValidate className='mt-5' autoComplete='off'>
          <div className='mt-10 flex flex-col space-y-5'>
            <h6>Register new type of NFT:: </h6>
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
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-label'>
                    Category
                  </InputLabel>
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={registerNewTypeNftForm.category}
                    label='Category'
                    onChange={handleChangeCategory}
                  >
                    {CATEGORIES.filter((e) => e.label !== 'ALL').map((e, i) => {
                      return (
                        <MenuItem key={i} selected value={e.label}>
                          {e.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
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
          <div className='mt-14 flex flex-col space-y-5'>
            <div className='flex flex-col space-y-5'>
              <h6>Update NFT price: </h6>
              <div className='flex flex-row items-center space-x-5'>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-label'>
                    Token Id
                  </InputLabel>
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={registerNftForm.tokenId}
                    label='Token Id'
                    onChange={handleChangeTokenId}
                  >
                    {token_keys.map((token: number, i) => {
                      return (
                        <MenuItem key={i} selected value={token.toString()}>
                          {assets.find((e) => e.name.includes(token.toString()))
                            ?.name || token}
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
            <div className='flex flex-col space-y-5'>
              <h6>Update Metadata Hash: </h6>
              <div className='flex flex-row items-center space-x-5'>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-label'>
                    Token Id
                  </InputLabel>
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={updateMetadataForm._tokenId}
                    label='Token Id'
                    onChange={handleChangeMetadataTokenId}
                  >
                    {token_keys.map((token: number, i) => {
                      return (
                        <MenuItem key={i} selected value={token.toString()}>
                          {assets.find((e) => e.name.includes(token.toString()))
                            ?.name || token}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <TextField
                  required
                  id='outlined-required'
                  label='IPFS Metadata'
                  fullWidth
                  InputProps={{
                    className:
                      'focus:ring-brand-yellow focus:border-brand-yellow focus:shadow-outline border-none',
                    sx: {
                      borderWidth: 0,
                    },
                  }}
                  onChange={(e) => {
                    setUpdateMetadataForm({
                      ...updateMetadataForm,
                      _metadataHashIpfs: e.target.value,
                    });
                  }}
                  error={errors.metadataHashIpfs}
                />
                <button
                  onClick={() => {
                    if (updateMetadataForm._metadataHashIpfs.trim() === '') {
                      setErrors({ ...errors, metadataHashIpfs: true });
                      return;
                    }
                    updateMetadataNft();
                  }}
                  type='button'
                  className='rounded-md bg-gray-800 p-2 px-4   text-white'
                >
                  Save
                </button>
              </div>
            </div>
            <div className='flex flex-col space-y-5'>
              <h6>Update Max Supply: </h6>
              <div className='flex flex-row items-center space-x-5'>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-label'>
                    Token Id
                  </InputLabel>
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={updateMaxSupplyForm._tokenId}
                    label='Token Id'
                    onChange={handleChangeSupplyTokenId}
                  >
                    {token_keys.map((token: number, i) => {
                      return (
                        <MenuItem key={i} selected value={token.toString()}>
                          {assets.find((e) => e.name.includes(token.toString()))
                            ?.name || token}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <TextField
                  required
                  id='outlined-required'
                  label='Max Supply'
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
                    setUpdateMaxSupplyForm({
                      ...updateMaxSupplyForm,
                      _maxSupply: e.target.value,
                    });
                  }}
                  error={errors.updateMaxSupply}
                />
                <button
                  onClick={() => {
                    if (updateMaxSupplyForm._maxSupply.trim() === '') {
                      setErrors({ ...errors, updateMaxSupply: true });
                      return;
                    }
                    updateMaxSupplyNft();
                  }}
                  type='button'
                  className='rounded-md bg-gray-800 p-2 px-4   text-white'
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className='mt-10 flex flex-col space-y-5'>
            <h6>Delete NFT: </h6>
            <div className='flex flex-row items-center space-x-5'>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-label'>Token Id</InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  value={tokenIdToDelete}
                  label='Token Id'
                  onChange={(e) => setTokenIdToDelete(e.target.value as string)}
                >
                  {token_keys.map((token: number, i) => {
                    return (
                      <MenuItem key={i} selected value={token.toString()}>
                        {assets.find((e) => e.name.includes(token.toString()))
                          ?.name || token}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <button
                onClick={() => {
                  deleteRegisterOfNFT();
                }}
                type='button'
                className='rounded-md bg-gray-800 p-2 px-4   text-white'
              >
                Delete
              </button>
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
