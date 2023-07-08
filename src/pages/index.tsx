/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { ethers, providers } from 'ethers';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { IoCarSport } from 'react-icons/io5';
import { IoRefreshCircle } from 'react-icons/io5';
import Swal from 'sweetalert2';
import { useAccount, useConnect, useContractWrite, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { NFTAssetCard, NFTTokenCard } from '@/components/NFTCard';
import { AdministrationPanel } from '@/components/panels/AdministrationPanel';
import { Spinner } from '@/components/Spinner';

import { MUMBAI_PROVIDER, TOKEN_KEYS } from '@/common/constants';
import { contracts } from '@/common/contracts';
import { getContract } from '@/helpers/getContract';
import { INFT_ASSET, INFT_TOKEN } from '@/interfaces/nft.interface';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

const NFT_ASSETS = [
  'https://x.darkrally.com/img/images/featured_game_thumb01.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb02.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb03.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb04.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb05.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb06.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb07.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb08.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb09.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb10.jpg',
  'https://x.darkrally.com/img/images/featured_game_thumb11.jpg',
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [isLoadingRegisterTournament, setIsLoadingRegisterTournament] =
    useState(false);
  const [isSuccessTicket, setIsSuccessTicket] = useState(false);
  const [amount, setAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [changed, setChanged] = useState<boolean>(false);
  const [assets, setAssets] = useState<INFT_ASSET[]>([]);
  const [tokens, setTokens] = useState<INFT_TOKEN[]>([]);
  const [startGame, setStartGame] = useState<
    'none' | 'started' | 'ended' | 'reclamed'
  >('none');
  const [points, setPoints] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<string>('101');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('501');
  const [currentTicketAllowance, setCurrentTicketAllowance] =
    useState<string>('--');
  const { address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (address) {
      readProfileToken();
      readAssets();
    }

    return () => {
      if (address) {
        setAssets([]);
        setTokens([]);
        currentCurrency();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, changed]);

  const readProfileToken = async () => {
    setIsLoadingProfile(true);
    const contract = await getContract(
      MUMBAI_PROVIDER,
      contracts.DARKTOKEN.address,
      contracts.DARKTOKEN.abi
    );

    const assets = await contract.getAssetsOfAccount(address, TOKEN_KEYS);

    setTokens(
      assets.map((e: any, i: number) => {
        return { id: TOKEN_KEYS[i], cant: Number(e), asset: NFT_ASSETS[i] };
      })
    );
    setIsLoadingProfile(false);
  };

  const readAssets = async () => {
    TOKEN_KEYS.forEach((nftId) => readNfts(nftId));
  };

  const readNfts = async (nftId: any) => {
    setIsLoadingMarketplace(true);
    const contract = await getContract(
      MUMBAI_PROVIDER,
      contracts.DARKTOKEN.address,
      contracts.DARKTOKEN.abi
    );

    const saleContract = await getContract(
      MUMBAI_PROVIDER,
      contracts.DARKSALE.address,
      contracts.DARKSALE.abi
    );

    const nft = await contract.nftInfo(nftId);
    const priceOfNft = await saleContract.priceOfNft(nftId);

    try {
      const { data } = await axios.get<INFT_ASSET>(
        'https://ipfs.io/ipfs/' + nft.metadataHashIpfs
      );
      data.price = Number(priceOfNft);

      if (data) {
        setAssets((prevState) => [...prevState, data]);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoadingMarketplace(false);
  };

  const burnToken = useContractWrite({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    functionName: 'burn',
    args: [address, Number(selectedTicket), 1],
    onSuccess: (res) => {
      if (res.hash) {
        Swal.fire({
          icon: 'success',
          title: 'Transacción ejecutada correctamente.',
        });
      }
      setChanged(!changed);
      setCurrentTicketAllowance('--');
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

  const mintTrophy = useContractWrite({
    address: contracts.DARKTOKEN.address as `0x${string}`,
    abi: contracts.DARKTOKEN.abi,
    functionName: 'mint',
    args: [address, 401, 1],
    onSuccess: (res) => {
      if (res.hash) {
        Swal.fire({
          icon: 'success',
          title: 'Transacción ejecutada correctamente.',
        });
      }
      setChanged(!changed);
      setStartGame('reclamed');
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

  const currentCurrency = async () => {
    const usdcContract = await getContract(
      MUMBAI_PROVIDER,
      contracts.USDCCOIN.address,
      contracts.USDCCOIN.abi
    );

    const balance = await usdcContract.balanceOf(address);

    setCurrentBalance(Number(balance));
  };

  const readBalance = async () => {
    setIsSuccessTicket(false);
    setIsLoadingTicket(true);
    const provider = new ethers.providers.JsonRpcProvider(MUMBAI_PROVIDER);
    const contractAddress = contracts.DARKTOKEN.address;
    const contractABI = contracts.DARKTOKEN.abi;

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const balance = await contract.balanceOf(address, Number(selectedTicket));
    setCurrentTicketAllowance(Number(balance).toString());
    setIsLoadingTicket(false);
    setIsSuccessTicket(true);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleChangeTicket = (event: SelectChangeEvent) => {
    setSelectedTicket(event.target.value as string);
  };
  const handleChangeVehicle = (event: SelectChangeEvent) => {
    setSelectedVehicle(event.target.value as string);
  };

  const handleStartGame = () => {
    setStartGame('started');
    setTimeout(() => {
      setPoints(Math.random() * 800);
      setStartGame('ended');
    }, 3000);
  };

  const approveQuantity = async () => {
    try {
      const contract = await getContract(
        MUMBAI_PROVIDER,
        contracts.USDCCOIN.address,
        contracts.USDCCOIN.abi
      );
      let provider = null,
        signer = null;
      //@ts-ignore
      provider = new providers.Web3Provider(window.ethereum);
      //@ts-ignore
      signer = provider.getSigner(address);

      const transaction = await contract
        .connect(signer)
        .approve(contracts.DARKSALE.address, amount);
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
    } catch (error: any) {
      console.log(error);

      if (error.reason) {
        Swal.fire({
          icon: 'error',
          title: error.reason,
        });
      }
    }
  };

  return (
    <div className='h-full'>
      <div className='h-15 flex w-full flex-col justify-between border-b px-10 py-5 pb-0'>
        <div className='flex justify-between'>
          <div>
            <p className='text-xl font-semibold'>🏎️ Dark Rally</p>
            <p>No Fear, No Game</p>
          </div>
          <div className='flex items-center space-x-5   '>
            <a
              href={
                'https://mumbai.polygonscan.com/address/' +
                contracts.DARKTOKEN.address
              }
              target='_blank'
              className='border-b text-gray-800'
            >
              DarkToken
            </a>
            <a
              href={
                'https://mumbai.polygonscan.com/address/' +
                contracts.DARKSALE.address
              }
              target='_blank'
              className='border-b text-gray-800'
            >
              DarkSale
            </a>
          </div>
          {!address ? (
            <div className='flex space-x-10'>
              <button
                className='p-.5 flex items-center space-x-3 rounded-md border border-slate-800 px-3 active:scale-95'
                onClick={() => connect()}
              >
                <Image
                  alt='Metamask icon'
                  width={24}
                  height={24}
                  src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1024px-MetaMask_Fox.svg.png?20220831120339'
                />
                <span>Connect to Wallet</span>
              </button>
            </div>
          ) : (
            <div className='flex items-center space-x-5'>
              <p>
                Connected to <span className='font-semibold'>{address}</span>
              </p>
              <button
                className='flex items-center space-x-3 rounded-md border border-slate-800 p-1 px-3 active:scale-95'
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
        <div className='mt-5'>
          <div className='flex justify-center'>
            <Tabs
              value={currentTab}
              onChange={handleChange}
              aria-label='basic tabs example'
            >
              <Tab label='Perfil del jugador' {...a11yProps(0)} />
              <Tab label='Marketplace' {...a11yProps(1)} />
              <Tab label='Registrarse al torneo' {...a11yProps(2)} />
              <Tab label='Jugar con Auto NFT' {...a11yProps(3)} />
              <Tab label='Administración' {...a11yProps(4)} />
            </Tabs>
          </div>
        </div>
      </div>

      {address ? (
        <>
          <div className='flex w-full flex-col items-center justify-center '>
            <CustomTabPanel value={currentTab} index={0}>
              {isLoadingProfile ? (
                <Spinner color='stroke-gray-800' />
              ) : (
                <div className='flex flex-wrap gap-20 p-20'>
                  <div className='absolute right-20 top-48 flex space-x-5'>
                    <span>Refresh list</span>
                    <IoRefreshCircle
                      className='cursor-pointer active:scale-95'
                      onClick={currentCurrency}
                      size={20}
                    />
                  </div>
                  {tokens.map((e: INFT_TOKEN, i) => {
                    if (e.cant === 0) {
                      return;
                    }
                    return (
                      <NFTTokenCard nft_token={e} assets={assets} key={i} />
                    );
                  })}
                </div>
              )}
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={1}>
              {isLoadingMarketplace ? (
                <Spinner color='stroke-gray-800' />
              ) : (
                <>
                  <div className='flex items-center justify-around'>
                    <div className='mt-20 flex items-center justify-center space-x-5'>
                      <h2>Tu balance actual: </h2>
                      <span className='mt-1 text-lg'>
                        {(currentBalance / 1000000).toFixed(2)} USDC
                      </span>
                      <IoRefreshCircle
                        className='cursor-pointer active:scale-95'
                        onClick={currentCurrency}
                        size={20}
                      />
                    </div>
                    <div className='mt-20 flex items-end justify-end space-x-5'>
                      <TextField
                        required
                        id='outlined-required'
                        label='Approve (USDC)'
                        fullWidth
                        type='number'
                        className=''
                        InputProps={{
                          className:
                            'outline-none focus:outline-none active:outline-none',
                        }}
                        onChange={(e) => {
                          setAmount(
                            (Number(e.target.value) * 1000000).toString()
                          );
                        }}
                      />
                      <button
                        onClick={() => {
                          console.log(amount);

                          if (amount.trim() === '') {
                            return;
                          }
                          approveQuantity();
                        }}
                        type='button'
                        className='rounded-md bg-gray-800  p-4   text-white'
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-20 p-20'>
                    {assets
                      .filter((e) => e.price !== 0)
                      .map((e: INFT_ASSET, i) => {
                        return (
                          <NFTAssetCard
                            setIsLoadingMarketplace={setIsLoadingMarketplace}
                            changed={changed}
                            setChanged={setChanged}
                            address={address}
                            nft_asset={e}
                            key={i}
                          />
                        );
                      })}
                  </div>
                </>
              )}
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={2}>
              <div className='flex w-full flex-col space-y-5 p-20'>
                <p>Seleccionar ticket: </p>
                <FormControl fullWidth className='mt-4'>
                  <InputLabel id='demo-simple-select-label'>Ticket</InputLabel>
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={selectedTicket}
                    label='Ticket'
                    onChange={handleChangeTicket}
                  >
                    <MenuItem selected value='101'>
                      DRchamps-serie23-A
                    </MenuItem>
                    <MenuItem value='102'>DRchamps-serie24-A</MenuItem>
                  </Select>
                </FormControl>
                {isSuccessTicket && (
                  <span className='text-green-500'>
                    Ticket comprobado exitosamente
                  </span>
                )}
                <button
                  onClick={() => readBalance()}
                  className='flex items-center justify-center space-x-2 rounded-md border border-gray-800 p-2 text-gray-800'
                >
                  {isLoadingTicket && (
                    <Image
                      width={20}
                      alt='loading'
                      height={20}
                      src='https://raw.githubusercontent.com/n3r4zzurr0/svg-spinners/abfa05c49acf005b8b1e0ef8eb25a67a7057eb20/svg-css/180-ring-with-bg.svg'
                    />
                  )}
                  <p>Comprobar Ticket</p>
                </button>
              </div>
              <div className='flex h-full w-full items-center justify-between'>
                {burnToken.status === 'loading' ? (
                  <Spinner color='stroke-gray-800' />
                ) : (
                  <>
                    <div>
                      <p>Saldo actual: {currentTicketAllowance}</p>
                      {currentTicketAllowance === '0' && (
                        <p className='text-red-600'>
                          No tiene suficientes tickets para inscribirse.
                        </p>
                      )}
                    </div>

                    {currentTicketAllowance !== '0' &&
                      currentTicketAllowance !== '--' && (
                        <button
                          onClick={() => {
                            burnToken.write();
                          }}
                          className='flex items-center justify-center space-x-2 rounded-md bg-gray-800 p-2 px-4   text-white'
                        >
                          <p>Registrarse al torneo</p>
                        </button>
                      )}
                  </>
                )}
              </div>
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={3}>
              {mintTrophy.status === 'loading' ? (
                <Spinner color='stroke-gray-800' />
              ) : (
                <div className='flex w-full flex-col space-y-5 p-20'>
                  <p>Selecciona tu vehículo: </p>
                  <FormControl fullWidth className='mt-4'>
                    <InputLabel id='demo-simple-select-label'>
                      Vehículo
                    </InputLabel>
                    <Select
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      value={selectedVehicle}
                      label='Vehículo'
                      onChange={handleChangeVehicle}
                    >
                      {tokens.map((token: INFT_TOKEN, i) => {
                        if (token.cant === 0) {
                          return;
                        }

                        if (
                          assets
                            .find((e) => e.name.includes(token.id.toString()))
                            ?.description.includes('vehicles')
                        )
                          return (
                            <MenuItem
                              key={i}
                              selected
                              value={assets
                                .find((e) =>
                                  e.name.includes(token.id.toString())
                                )
                                ?.name.substring(
                                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
                                  assets.find((e) =>
                                    e.name.includes(token.id.toString())
                                  )?.name.length! - 3,
                                  assets.find((e) =>
                                    e.name.includes(token.id.toString())
                                  )?.name.length
                                )}
                            >
                              {
                                assets.find((e) =>
                                  e.name.includes(token.id.toString())
                                )?.name
                              }
                            </MenuItem>
                          );
                      })}
                    </Select>
                  </FormControl>
                  <button
                    onClick={() => handleStartGame()}
                    className=' rounded-md bg-gray-800 p-2 px-4   text-white'
                  >
                    Empezar a jugar
                  </button>
                  {startGame === 'started' ? (
                    <div>
                      <span>Jugando ...</span>
                    </div>
                  ) : (
                    startGame === 'ended' && (
                      <>
                        <p>Puntaje: {points.toFixed(4)}</p>
                        {points > 600 ? (
                          <button
                            onClick={() => mintTrophy.write()}
                            className=' rounded-md bg-gray-800 p-2 px-4   text-white'
                          >
                            Reclamar premio 🎉
                          </button>
                        ) : (
                          <p className='text-red-600'>
                            No alcanzaste el trofeo.
                          </p>
                        )}
                      </>
                    )
                  )}
                </div>
              )}
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={4}>
              <AdministrationPanel address={address} />
            </CustomTabPanel>
          </div>
        </>
      ) : (
        <div className='flex  w-full flex-col items-center justify-center pt-48'>
          <IoCarSport size={20} />
          <p>¡Para empezar, primero ingresa con tu address!</p>
        </div>
      )}
    </div>
  );
}
