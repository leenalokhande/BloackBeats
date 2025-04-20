'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaMusic, FaExternalLinkAlt, FaCalendarAlt, FaFileAlt, FaUserAlt, FaCheck, FaTimes, FaPlay, FaPause, FaWallet, FaFilter } from 'react-icons/fa';
import { HiOutlineDocumentText, HiOutlineMusicNote, HiOutlineUser } from 'react-icons/hi';
import Web3 from 'web3';
import toast from 'react-hot-toast';
import { CONTRACT_ABI } from '../backend/services/contractService';

// Type definitions
interface License {
  id: string;
  creator: string;
  licensee: string;
  licenseType: number;
  startTimestamp: number;
  endTimestamp: number;
  ipfsHash: string;
  isActive: boolean;
  metadata: {
    title?: string;
    artist?: string;
    description?: string;
    audioHash?: string;
    imageHash?: string;
    terms?: string;
    createdAt?: string;
  };
  role: 'creator' | 'licensee';
}

export default function ViewLicenses() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{[key: string]: HTMLAudioElement}>({});
  
  // Connect wallet and fetch licenses on initial load
  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          setCurrentAccount(accounts[0]);
          
          // Fetch licenses once we have the account
          fetchLicenses(accounts[0], web3);
        } else {
          toast.error('Please install MetaMask to use this application');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to connect wallet', error);
        toast.error('Failed to connect wallet');
        setIsLoading(false);
      }
    };
    
    init();
  }, []);
  
  const fetchLicenses = async (account: string, web3: Web3) => {
    try {
      setIsLoading(true);
      toast.loading('Loading your licenses...');
      
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        throw new Error("Contract address is not defined in environment variables");
      }
      
      const contract = new web3.eth.Contract(CONTRACT_ABI as any, contractAddress);
      
      // Get current block number
      const currentBlock = await web3.eth.getBlockNumber();
      const fromBlock = currentBlock > BigInt(10000) ? currentBlock - BigInt(10000) : BigInt(0);

      
      // Create event filters for creator and licensee
      const creatorFilter = {
        fromBlock,
        toBlock: 'latest',
        filter: { creator: account }
      };
      
      const licenseeFilter = {
        fromBlock,
        toBlock: 'latest',
        filter: { licensee: account }
      };
      
      // Get events
      const creatorEvents = await contract.getPastEvents('LicenseIssued', creatorFilter);
      const licenseeEvents = await contract.getPastEvents('LicenseIssued', licenseeFilter);
      
      // Combine and deduplicate events
      const allEvents = [...creatorEvents, ...licenseeEvents];
      const uniqueIdsSet = new Set();
      const uniqueEvents = allEvents.filter((event:any) => {
        const id = event.returnValues.licenseId;
        if (uniqueIdsSet.has(id)) {
          return false;
        }
        uniqueIdsSet.add(id);
        return true;
      });
      
      // Process each license
      const licensePromises = uniqueEvents.map(async (event:any) => {
        const licenseId = event.returnValues.licenseId;
        const creator = event.returnValues.creator;
        const licensee = event.returnValues.licensee;
        const licenseType = parseInt(event.returnValues.licenseType);
        const startTimestamp = parseInt(event.returnValues.startTimestamp);
        const endTimestamp = parseInt(event.returnValues.endTimestamp);
        const ipfsHash = event.returnValues.ipfsHash;
        
        // Check if license is active
        const isActive = await contract.methods.isLicenseActive(licenseId).call();
        
        // Fetch metadata from IPFS via Pinata gateway
        let metadata = {};
        try {
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
          metadata = await response.json();
        } catch (err) {
          console.warn(`Failed to fetch metadata for license ${licenseId}`, err);
        }
        
        return {
          id: licenseId,
          creator,
          licensee,
          licenseType,
          startTimestamp,
          endTimestamp,
          ipfsHash,
          isActive,
          metadata,
          role: creator.toLowerCase() === account.toLowerCase() ? 'creator' : 'licensee'
        };
      });
      
      const fetchedLicenses:any = await Promise.all(licensePromises);
      setLicenses(fetchedLicenses);
      toast.dismiss();
      
      if (fetchedLicenses.length === 0) {
        toast.success('No licenses found. Create your first one!');
      } else {
        toast.success(`Found ${fetchedLicenses.length} licenses`);
      }
    } catch (error: any) {
      console.error('Error fetching licenses:', error);
      setError(error.message || 'Failed to load licenses');
      toast.dismiss();
      toast.error('Failed to load licenses');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeactivate = async (licenseId: string) => {
    try {
      setIsLoading(true);
      toast.loading('Deactivating license...');
      
      const web3 = new Web3(window.ethereum);
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        throw new Error("Contract address is not defined in environment variables");
      }
      
      const contract = new web3.eth.Contract(CONTRACT_ABI as any, contractAddress);
      
      // Call deactivate function
      await contract.methods.deactivateLicense(licenseId).send({ from: currentAccount });
      
      // Update the license in state
      setLicenses(prev => 
        prev.map(license => 
          license.id === licenseId 
            ? { ...license, isActive: false } 
            : license
        )
      );
      
      toast.dismiss();
      toast.success('License deactivated successfully');
    } catch (error: any) {
      console.error('Error deactivating license:', error);
      toast.dismiss();
      toast.error('Failed to deactivate license');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAudio = (licenseId: string, audioHash?: string) => {
    if (!audioHash) return;
    
    // If this is the currently playing audio
    if (playingAudio === licenseId) {
      const audio = audioElements[licenseId];
      if (audio) {
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      }
    } 
    // If another audio is playing, pause it and play this one
    else {
      // Pause current audio if any
      if (playingAudio && audioElements[playingAudio]) {
        audioElements[playingAudio].pause();
      }
      
      // Create or get audio element for this license
      let audio = audioElements[licenseId];
      if (!audio) {
        audio = new Audio(`https://gateway.pinata.cloud/ipfs/${audioHash}`);
        setAudioElements(prev => ({ ...prev, [licenseId]: audio }));
      }
      
      // Play the new audio
      audio.play();
      setPlayingAudio(licenseId);
    }
  };
  
  const isAudioPlaying = (licenseId: string) => {
    return playingAudio === licenseId && audioElements[licenseId] && !audioElements[licenseId].paused;
  };
  
  const getFilteredLicenses = () => {
    if (filter === 'all') return licenses;
    if (filter === 'creator') return licenses.filter(l => l.role === 'creator');
    if (filter === 'licensee') return licenses.filter(l => l.role === 'licensee');
    if (filter === 'active') return licenses.filter(l => l.isActive);
    if (filter === 'expired') return licenses.filter(l => !l.isActive);
    return licenses;
  };
  
  const getLicenseTypeLabel = (typeNum: number) => {
    const types = ['Streaming', 'Distribution', 'Commercial', 'Remix', 'Exclusive'];
    return types[typeNum] || 'Unknown';
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };
  
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white">
  

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
            My Music Licenses
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-3xl">
            View and manage your music licenses securely stored on the blockchain. Listen to your licensed tracks and check their status.
          </p>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <div className="bg-black/30 backdrop-blur-md px-3 py-2 rounded-full text-sm flex items-center">
              <FaFilter className="mr-2 text-pink-400" />
              <span className="text-gray-300 mr-2">Filter:</span>
            </div>
            
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg' 
                : 'bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10'}`}
            >
              All Licenses
            </button>
            <button 
              onClick={() => setFilter('creator')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'creator' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg' 
                : 'bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10'}`}
            >
              As Creator
            </button>
            <button 
              onClick={() => setFilter('licensee')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'licensee' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg' 
                : 'bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10'}`}
            >
              As Licensee
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'active' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg' 
                : 'bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'expired' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg' 
                : 'bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10'}`}
            >
              Expired
            </button>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-pink-500 border-r-purple-500 border-b-indigo-500 border-l-transparent animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold">
                <FaMusic className="text-lg" />
              </div>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-900/30 backdrop-blur-md border border-red-500/30 text-red-200 p-6 rounded-xl mb-8">
            <h3 className="text-xl font-semibold mb-2">Error Loading Licenses</h3>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* No licenses */}
        {!isLoading && !error && licenses.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-black/20 backdrop-blur-md rounded-2xl p-10 border border-white/10">
            <HiOutlineMusicNote className="text-7xl text-gray-500 mb-6" />
            <h3 className="text-2xl font-bold mb-3">No Licenses Found</h3>
            <p className="text-gray-300 max-w-xl mb-8">
              You don't have any music licenses yet. Create your first license to start managing your music rights on the blockchain.
            </p>
            <Link href="/create-license" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-medium shadow-lg transition-all">
              Create Your First License
            </Link>
          </div>
        )}
        
        {/* License list */}
        {!isLoading && !error && licenses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-h-[50vh] p-6 " >
            {getFilteredLicenses().map(license => (
              <div key={license.id} className="bg-black/20 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all shadow-lg group">
                {/* License header with cover image if available */}
                <div className="relative h-48 bg-gradient-to-r from-purple-900 to-pink-900 overflow-hidden">
                  {license.metadata.imageHash && (
                    <img 
                      src={`https://gateway.pinata.cloud/ipfs/${license.metadata.imageHash}`}
                      alt={license.metadata.title || `License #${license.id}`}
                      className="w-full h-full object-cover opacity-80"
                    />
                  )}
                  
                  {/* Play button overlay for audio */}
                  {license.metadata.audioHash && (
                    <button 
                      onClick={() => toggleAudio(license.id, license.metadata.audioHash)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="w-16 h-16 bg-pink-500/80 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                        {isAudioPlaying(license.id) ? (
                          <FaPause className="text-white text-xl" />
                        ) : (
                          <FaPlay className="text-white text-xl ml-1" />
                        )}
                      </div>
                    </button>
                  )}
                  
                  {/* Status indicator */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center space-x-1.5" 
                    style={{
                      backgroundColor: license.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      borderWidth: '1px',
                      borderColor: license.isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <div className={`h-2 w-2 rounded-full ${license.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs font-medium">{license.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  {/* License type badge */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'linear-gradient(to right, rgba(216, 80, 247, 0.3), rgba(129, 30, 219, 0.3))',
                      borderWidth: '1px',
                      borderColor: 'rgba(216, 80, 247, 0.4)',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    {getLicenseTypeLabel(license.licenseType)}
                  </div>
                </div>
                
                {/* License content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 line-clamp-1">
                    {license.metadata.title || `License #${license.id}`}
                  </h3>
                  <p className="text-pink-300 mb-4 text-sm">
                    {license.metadata.artist || 'Unknown Artist'}
                  </p>
                  
                  {/* License details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0 mr-3">
                        <HiOutlineUser className="text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Your Role</p>
                        <p className="text-sm font-medium capitalize">{license.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0 mr-3">
                        <FaCalendarAlt className="text-pink-400 text-sm" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">License Period</p>
                        <p className="text-sm">
                          {formatDate(license.startTimestamp)} → {formatDate(license.endTimestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Creator</p>
                        <p className="text-sm font-mono">{truncateAddress(license.creator)}</p>
                      </div>
                      
                      <div className="bg-black/30 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Licensee</p>
                        <p className="text-sm font-mono">{truncateAddress(license.licensee)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="space-y-2">
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${license.ipfsHash}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-black/30 hover:bg-black/40 border border-purple-500/30 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                    >
                      <HiOutlineDocumentText className="mr-2" />
                      View License Details
                    </a>
                    
                    {license.role === 'creator' && license.isActive && (
                      <button 
                        onClick={() => handleDeactivate(license.id)}
                        className="flex items-center justify-center w-full bg-red-900/30 hover:bg-red-900/40 border border-red-500/30 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                      >
                        <FaTimes className="mr-2" />
                        Deactivate License
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      

    </div>
  );
}