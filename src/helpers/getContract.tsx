/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';

export const getContract = async (
  _provider: string,
  _contractAddress: string,
  _contractABI: any
) => {
  const provider = new ethers.providers.JsonRpcProvider(_provider);

  const contract = new ethers.Contract(
    _contractAddress,
    _contractABI,
    provider
  );

  return contract;
};
