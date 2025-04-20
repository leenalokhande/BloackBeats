'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { FaMusic, FaWallet } from 'react-icons/fa';
import Web3 from 'web3';

const Navbar = ()=> {
 const [isPlaying, setIsPlaying] = useState(Array(4).fill(false));
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  
 const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
            setWalletConnected(true);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };
    
    checkWalletConnection();
  }, []);


  // Connect wallet function
  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get connected accounts
        const accounts = await web3.eth.getAccounts();
        setCurrentAccount(accounts[0]);
        setWalletConnected(true);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <nav className="border-b border-white/10 bg-black/30 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FaMusic className="h-8 w-8 text-pink-400" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">BlockBeats</span>
            </div>
            <div className="flex items-center">
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-4">
                  <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-pink-300 transition">Home</Link>
                  <Link href="/view-licences" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-pink-300 transition">My Licenses</Link>
                  <Link href="/create-licence" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-pink-300 transition">Upload</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              
              {walletConnected ? (
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm flex items-center shadow-lg transition">
                  <FaWallet className="mr-2" />
                  {currentAccount.substring(0, 6)}...{currentAccount.substring(currentAccount.length - 4)}
                </button>
              ) : (
                <button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm flex items-center shadow-lg transition disabled:opacity-70"
                >
                  <FaWallet className="mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
}
export default Navbar