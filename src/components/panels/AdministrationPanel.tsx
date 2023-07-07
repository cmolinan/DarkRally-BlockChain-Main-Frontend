import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import React, { FC, useState } from 'react';
import Swal from 'sweetalert2';
import { useContractWrite } from 'wagmi';

import { TOKEN_KEYS } from '@/common/constants';
import { contracts } from '@/common/contracts';

interface IProps {
  address: string;
}

export const AdministrationPanel: FC<IProps> = ({ address }) => {
  const [registerNftForm, setRegisterNftForm] = useState({
    tokenId: '101',
    price: '',
  });
  const [registerNewTypeNftForm, setRegisterNewTypeNftForm] = useState({
    tokenId: 101,
    nameOfNFT: '101',
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
  });
  const registerNftPrice = useContractWrite({
    address: contracts.DARKSALE.address as `0x${string}`,
    abi: contracts.DARKSALE.abi,
    functionName: 'setNftPrice',
    args: [[Number(registerNftForm.tokenId)], [registerNftForm.price]],
  });
  const pauseContract = useContractWrite({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    functionName: 'pause',
  });
  const unpauseContract = useContractWrite({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    functionName: 'unpause',
  });

  const registerNewTypeNFT = useContractWrite({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    functionName: 'registerNewTypeOfNft',
    args: [
      registerNewTypeNftForm.tokenId,
      registerNewTypeNftForm.nameOfNFT,
      registerNewTypeNftForm.category,
      registerNewTypeNftForm.metadataHashIpfs,
      registerNewTypeNftForm.maxSupply,
      registerNewTypeNftForm.initialPrice,
      registerNewTypeNftForm.askDateForMint,
      registerNewTypeNftForm.validUntil,
      registerNewTypeNftForm.entriesCounter,
    ],
    onError: (e) => {
      Swal.fire({
        icon: 'error',
        title: e,
      });
    },
  });

  const handleChangeTokenId = (event: SelectChangeEvent) => {
    setRegisterNftForm({
      ...registerNftForm,
      tokenId: event.target.value as string,
    });
  };

  return (
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
            className=''
            type='number'
            InputProps={{
              className:
                'py-2 outline-none focus:outline-none active:outline-none',
            }}
            onChange={(e) => {
              setRegisterNftForm({ ...registerNftForm, price: e.target.value });
            }}
            error={errors.tokenId}
          />
          <button
            onClick={() => {
              if (registerNftForm.price.trim() === '') {
                setErrors({ ...errors, tokenId: true });
                return;
              }
              registerNftPrice.write();
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
          <div className='flex flex-col space-y-5'>
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
                error={errors.tokenId}
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
              error={errors.nameOfNFT}
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
              error={errors.category}
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
              error={errors.metadataHashIpfs}
            />
          </div>
          <div className='flex flex-col space-y-5'>
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
              error={errors.maxSupply}
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
              error={errors.initialPrice}
            />
            <TextField
              required
              id='outlined-required'
              label='Cantidad'
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
              error={errors.entriesCounter}
            />
          </div>
          <button
            onClick={() => {
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

              registerNewTypeNFT.write();
              console.log(registerNewTypeNFT.data);
            }}
            type='button'
            className='rounded-md bg-gray-800 p-2 px-4   text-white'
          >
            Guardar
          </button>
        </div>
      </div>
    </Box>
  );
};
