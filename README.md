# Dark Rally 
This frontend is part of the vehicle racing game project "Dark Rally" which uses Blockchain technology for its economic aspects, for which Smart Contracts (SC) Ethereum compatibles were developed, which were deployed in a testnet chain. This is the link to this main repository: https://github.com/cmolinan/DarkRally-BlockChain-integration-project

This frontend was developed to demonstrate the functionalities of the mentioned SCs after connecting to a blockchain wallet (Metamask), such as:

1) A view of the NFT assets bought by the connected wallet (Tickets, Vehicles, Toys and Skins)
2) A Store to buy NFTs
3) A simple tournament simulator that when the player wins, an NFT Trophy is minted.
4) An Administration area, which can only be accessed by a wallet that has an administrator role.

This frontend is a fork of the one developed by Jorge Rojas, whose original repository is the following: https://github.com/JorgeRojas827/nft-marketplace
This fork had to be done because the Mumbai testnet was decommissioned in April 2024, which is why the SCs were created again in the Sepolia testnet, and the respective changes had to be made for this frontend to work again.

## Live Demo
[Link to front-end live Demo](https://dark-rally-blockchain-main-frontend.vercel.app/)

## Built With
- Next TS

## Getting Started
### 1. Clone this repository:

```bash
git clone https://github.com/cmolinan/DarkRally-BlockChain-Main-Frontend 
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Run the development server

You can start the server using this command:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/pages/index.tsx`.
