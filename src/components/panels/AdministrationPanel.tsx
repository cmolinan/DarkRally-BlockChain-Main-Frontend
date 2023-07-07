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
  const [errors, setErrors] = useState<any>({
    tokenId: false,
  });
  const registerNftPrice = useContractWrite({
    address: contracts.DARKSALE.address as `0x${string}`,
    abi: contracts.DARKSALE.abi,
    functionName: 'setNftPrice',
    args: [[Number(registerNftForm.tokenId)], [registerNftForm.price]],
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
    </Box>
  );
};
