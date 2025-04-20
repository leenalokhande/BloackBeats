# BlockBeats


BlockBeats is a decentralized music licensing platform built on the Arbitrum blockchain, providing a transparent, fair, and efficient way for artists to license their music directly to users.

## Vision

BlockBeats transforms music licensing through blockchain, creating a decentralized marketplace where artists control their work, receive instant payments, and connect directly with licensees. Our Arbitrum-based platform ensures transparent, verifiable rights management with minimal fees, making creative content accessible to all while ensuring creators are fairly compensated.

## Features

- **Blockchain-Based Licensing**: Secure, immutable licenses stored on Arbitrum
- **Smart Contract Integration**: Automated license issuance and management
- **IPFS Content Storage**: Decentralized storage for music files and metadata
- **Web3 Wallet Integration**: Connect with MetaMask and other Ethereum wallets
- **Artist Dashboard**: Upload and manage music licenses
- **License Marketplace**: Browse and purchase music licenses
- **License Verification**: Check license validity and terms

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Blockchain**: Solidity smart contracts on Arbitrum
- **Storage**: IPFS via Pinata API
- **Authentication**: Web3 wallet integration
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React hooks
- **API Integration**: Web3.js, Pinata SDK

## Getting Started

### Prerequisites

- Node.js (v14.0 or higher)
- npm or yarn
- MetaMask or another Web3 wallet extension

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/blockbeats.git
cd blockbeats
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the project root and add your environment variables:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_API_SECRET=your_pinata_api_secret
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Smart Contract Deployment

1. Navigate to the contracts directory
```bash
cd contracts
```

2. Deploy the main license contract to Arbitrum
```bash
npx hardhat run scripts/deploy.js --network arbitrum
```

3. Update the contract address in your `.env.local` file

## Project Structure

```
blockbeats/
├── app/                  # Next.js app directory
│   ├── backend/          # Backend services
│   ├── components/       # Reusable UI components
│   ├── create-licence/   # Create license page
│   ├── view/licences/    # View licenses page
│   └── page.tsx          # Homepage
├── contracts/            # Solidity smart contracts
│   ├── MusicLicense.sol  # Main license contract
│   └── scripts/          # Deployment scripts
├── public/               # Static assets
├── styles/               # Global styles
└── .env.local            # Environment variables (create this)
```

## API Routes

- `/api/upload` - Upload files to IPFS via Pinata
- `/api/metadata` - Create and upload metadata to IPFS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Arbitrum](https://arbitrum.io/) for providing the Layer 2 scaling solution
- [IPFS](https://ipfs.io/) and [Pinata](https://pinata.cloud/) for decentralized storage
- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Next.js](https://nextjs.org/) for the React framework

---

Built with ♥ by the BlockBeats Team
