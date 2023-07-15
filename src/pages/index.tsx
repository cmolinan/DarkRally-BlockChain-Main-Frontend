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
import clsx from 'clsx';
import { ethers, providers } from 'ethers';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { IoCarSport, IoWarningOutline } from 'react-icons/io5';
import { IoRefreshCircle } from 'react-icons/io5';
import Swal from 'sweetalert2';
import { useAccount, useConnect, useContractWrite, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { NFTAssetCard, NFTTokenCard } from '@/components/NFTCard';
import { AdministrationPanel } from '@/components/panels/AdministrationPanel';
import { Spinner } from '@/components/Spinner';

import { CATEGORIES, MUMBAI_PROVIDER } from '@/common/constants';
import { contracts } from '@/common/contracts';
import { getContract } from '@/helpers/getContract';
import { INFT_ASSET, INFT_TOKEN } from '@/interfaces/nft.interface';
import { OpenZeppelinService } from '@/services/OpenZeppelinService';

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
      className={clsx((index === 0 || index === 1) && 'w-full')}
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
  const [currentCategory, setCurrentCategory] = useState('ALL');
  const [currentShopCategory, setCurrentShopCategory] = useState('ALL');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [isSuccessTicket, setIsSuccessTicket] = useState(false);
  const [businessRole, setBusinessRole] = useState(false);
  const [amount, setAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [changed, setChanged] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [token_keys, setTokenKeys] = useState<number[]>([]);
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
      getBusinessRole();
      getPaused();
      getTokenList();
    }
    if (token_keys.length !== 0) {
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
  }, [address, changed, token_keys.length, currentTab]);

  const readProfileToken = async () => {
    setIsLoadingProfile(true);
    const contract = await getContract(
      MUMBAI_PROVIDER,
      contracts.DARKTOKEN.address,
      contracts.DARKTOKEN.abi
    );

    const assets = await contract.getAssetsOfAccount(address, token_keys);
    setTokens(
      assets.map((e: any, i: number) => {
        return { id: token_keys[i], cant: Number(e), asset: NFT_ASSETS[i] };
      })
    );
    setIsLoadingProfile(false);
  };

  const readAssets = async () => {
    setAssets([]);
    token_keys.forEach((nftId) => readNfts(nftId));
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
        setAssets((prevState) =>
          [...prevState, data].filter(
            (v, i, a) => a.findIndex((v2) => v2.name === v.name) === i
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoadingMarketplace(false);
  };
  const getPaused = async () => {
    const saleContract = await getContract(
      MUMBAI_PROVIDER,
      contracts.DARKSALE.address,
      contracts.DARKSALE.abi
    );
    const contract = await getContract(
      MUMBAI_PROVIDER,
      contracts.DARKTOKEN.address,
      contracts.DARKTOKEN.abi
    );

    const pausedSale = await saleContract.paused();
    const pausedToken = await contract.paused();
    setPaused(pausedSale || pausedToken);
  };
  const getBusinessRole = async () => {
    const contract = await getContract(
      MUMBAI_PROVIDER,
      contracts.DARKTOKEN.address,
      contracts.DARKTOKEN.abi
    );

    const hasRole = await contract.hasRole(
      '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a',
      address
    );
    setBusinessRole(hasRole);
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
          title: 'Transaction successfully executed.',
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

  const currentCurrency = async () => {
    const usdcContract = await getContract(
      MUMBAI_PROVIDER,
      contracts.USDCCOIN.address,
      contracts.USDCCOIN.abi
    );

    const balance = await usdcContract.balanceOf(address);

    setCurrentBalance(Number(balance));
  };

  const getTokenList = async () => {
    setIsLoadingProfile(true);
    const nftContract = await getContract(
      MUMBAI_PROVIDER,
      contracts.DARKTOKEN.address,
      contracts.DARKTOKEN.abi
    );

    const tokenList = await nftContract.getTokensList();

    setTokenKeys(tokenList.map((e: any) => Number(e)));
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
    setIsLoadingMarketplace(true);
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
      setIsLoadingMarketplace(false);
      setAmount('');
    } catch (error: any) {
      setIsLoadingMarketplace(false);
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
              DarkRallyNFT
            </a>
            <a
              href={
                'https://mumbai.polygonscan.com/address/' +
                contracts.DARKSALE.address
              }
              target='_blank'
              className='border-b text-gray-800'
            >
              DarkRallySale
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
              <Tab label='Player profile' {...a11yProps(0)} />
              <Tab label='Shop' {...a11yProps(1)} />
              <Tab label='Register for the tournament' {...a11yProps(2)} />
              <Tab label='Play with NFT Vehicle' {...a11yProps(3)} />
              {businessRole && <Tab label='Administration' {...a11yProps(4)} />}
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
                <>
                  <div className='mb-10 mt-10 flex w-full justify-around'>
                    {CATEGORIES.map((e, i) => {
                      return (
                        <div
                          onClick={() => setCurrentCategory(e.value)}
                          className={clsx(
                            'cursor-pointer rounded-md border px-4 py-2',
                            currentCategory === e.value &&
                              'bg-gray-800 text-white'
                          )}
                          key={i}
                        >
                          {e.label}
                        </div>
                      );
                    })}
                  </div>
                  <div className='flex flex-wrap gap-20 p-20'>
                    <div className='absolute right-20 top-72 flex space-x-5'>
                      <span>Refresh list</span>
                      <IoRefreshCircle
                        className='cursor-pointer active:scale-95'
                        onClick={readProfileToken}
                        size={20}
                      />
                    </div>
                    {tokens
                      .filter((e) => {
                        if (currentCategory === 'ALL') {
                          return e;
                        }

                        return assets
                          .find((i) => i.name.includes(e.id.toString()))
                          ?.name.includes(currentCategory);
                      })
                      .map((e: INFT_TOKEN, i) => {
                        if (e.cant === 0) {
                          return;
                        }
                        return (
                          <NFTTokenCard nft_token={e} assets={assets} key={i} />
                        );
                      })}
                    {tokens.filter((e) => {
                      if (currentCategory === 'ALL') {
                        return e;
                      }

                      return assets
                        .find((i) => i.name.includes(e.id.toString()))
                        ?.name.includes(currentCategory);
                    }).length === 0 && (
                      <div className='flex  w-full flex-col items-center justify-center pt-40'>
                        <IoWarningOutline size={20} />
                        <p>Looks that you don't have any item</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={1}>
              {isLoadingMarketplace || isLoadingProfile ? (
                <Spinner color='stroke-gray-800' />
              ) : (
                <>
                  {' '}
                  <div className='flex items-center justify-around'>
                    <div className='mt-20 flex items-center justify-center space-x-5'>
                      <h2>Your current balance: </h2>
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
                  <div className='mt-16 flex w-full justify-around'>
                    {CATEGORIES.filter((e) => e.label !== 'TROPHY').map(
                      (e, i) => {
                        return (
                          <div
                            onClick={() => setCurrentShopCategory(e.value)}
                            className={clsx(
                              'cursor-pointer rounded-md border px-4 py-2',
                              currentShopCategory === e.value &&
                                'bg-gray-800 text-white'
                            )}
                            key={i}
                          >
                            {e.label}
                          </div>
                        );
                      }
                    )}
                  </div>
                  <div className='flex flex-wrap gap-20 p-20'>
                    {assets
                      .filter((e) => {
                        return !e.name.includes('TROPHY');
                      })
                      .filter((e) => {
                        if (currentShopCategory === 'ALL') {
                          return e;
                        }
                        return e.name.includes(currentShopCategory);
                      })
                      .sort((a, b) => {
                        return (
                          Number(
                            a.name.substring(a.name.length - 3, a.name.length)
                          ) -
                          Number(
                            b.name.substring(b.name.length - 3, b.name.length)
                          )
                        );
                      })

                      .map((e: INFT_ASSET, i) => {
                        if (e.price === 0) {
                          return;
                        }

                        return (
                          <NFTAssetCard
                            setIsLoadingMarketplace={setIsLoadingMarketplace}
                            changed={changed}
                            setChanged={setChanged}
                            address={address}
                            nft_asset={e}
                            paused={paused}
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
                <p>Select ticket: </p>
                <FormControl fullWidth className='mt-4'>
                  <InputLabel id='demo-simple-select-label'>Ticket</InputLabel>
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={selectedTicket}
                    label='Ticket'
                    onChange={handleChangeTicket}
                  >
                    {assets.map((e, i) => {
                      const isTrophy =
                        e.description.includes('champs') &&
                        !e.description.includes('trophy') &&
                        !e.description.includes('vehicles');

                      if (!isTrophy) {
                        return;
                      }

                      return (
                        <MenuItem
                          selected
                          value={e.name.substring(
                            e.name.length - 3,
                            e.name.length
                          )}
                          key={i}
                        >
                          {e.description}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                {isSuccessTicket && (
                  <span className='text-green-500'>
                    Ticket successfully checked
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
                  <p>Check Ticket</p>
                </button>
              </div>
              <div className='flex h-full w-full items-center justify-between space-x-5'>
                {burnToken.status === 'loading' ? (
                  <Spinner color='stroke-gray-800' />
                ) : (
                  <>
                    <div>
                      <p>Current balance: {currentTicketAllowance}</p>
                      {currentTicketAllowance === '0' && (
                        <p className='text-red-600'>
                          You do not have enough tickets to register.
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
                          <p>Register for the tournament</p>
                        </button>
                      )}
                  </>
                )}
              </div>
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={3}>
              {isLoadingMarketplace ? (
                <Spinner color='stroke-gray-800' />
              ) : tokens.filter(
                  (token) =>
                    token.cant &&
                    assets
                      .find((e) => e.name.includes(token.id.toString()))
                      ?.description.includes('vehicles')
                ).length ? (
                <div className='flex w-full flex-col space-y-5 p-20'>
                  <p>Select your vehicle: </p>
                  <FormControl fullWidth className='mt-4'>
                    <InputLabel id='demo-simple-select-label'>
                      Vehicle
                    </InputLabel>

                    <Select
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      value={selectedVehicle}
                      label='Vehicle'
                      onChange={handleChangeVehicle}
                    >
                      {tokens
                        .filter(
                          (token) =>
                            token.cant &&
                            assets
                              .find((e) => e.name.includes(token.id.toString()))
                              ?.description.includes('vehicles')
                        )
                        .map((token: INFT_TOKEN, i) => {
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
                  {tokens.filter(
                    (token) =>
                      token.cant &&
                      assets
                        .find((e) => e.name.includes(token.id.toString()))
                        ?.description.includes('vehicles')
                  ).length !== 0 && (
                    <>
                      <button
                        onClick={() => handleStartGame()}
                        className=' rounded-md bg-gray-800 p-2 px-4   text-white'
                      >
                        Start playing
                      </button>
                      {startGame === 'started' ? (
                        <div>
                          <span>Playing ...</span>
                        </div>
                      ) : (
                        startGame === 'ended' && (
                          <>
                            <p>Score: {points.toFixed(4)}</p>
                            {points > 600 ? (
                              <button
                                onClick={async () => {
                                  setIsLoadingMarketplace(true);
                                  OpenZeppelinService()
                                    .mintTrophy('401', address)
                                    .then((e) => {
                                      Swal.fire({
                                        icon: 'success',
                                        title: 'Reclamed award successfully!',
                                      });
                                      setIsLoadingMarketplace(false);
                                      setStartGame('reclamed');
                                    });
                                }}
                                className=' rounded-md bg-gray-800 p-2 px-4   text-white'
                              >
                                Claim award 🎉
                              </button>
                            ) : (
                              <p className='text-red-600'>
                                You did not reach the trophy.
                              </p>
                            )}
                          </>
                        )
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className='flex  w-full flex-col items-center justify-center pt-48'>
                  <IoCarSport size={20} />
                  <p>To get started, first buy a car!</p>
                </div>
              )}
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={4}>
              <AdministrationPanel
                token_keys={token_keys}
                assets={assets}
                address={address}
                getTokenList={getTokenList}
                readAssets={readAssets}
                paused={paused}
                getPaused={getPaused}
              />
            </CustomTabPanel>
          </div>
        </>
      ) : (
        <div className='flex  w-full flex-col items-center justify-center pt-48'>
          <IoCarSport size={20} />
          <p>To get started, first log in with your address!</p>
        </div>
      )}
    </div>
  );
}
