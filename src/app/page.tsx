'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaMusic, FaWallet, FaSearch, FaPlay, FaPause, FaEthereum, FaHeadphones, FaShieldAlt } from 'react-icons/fa';
import { HiOutlineChevronRight } from 'react-icons/hi';
import { BsMusicNoteList, BsArrowRight } from 'react-icons/bs';
import Web3 from 'web3';
import toast from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
 

  const [audioElements, setAudioElements] = useState<{[key: number]: HTMLAudioElement}>({});
  const [animateHero, setAnimateHero] = useState(false);

  useEffect(() => {
    setAnimateHero(true);
  }, []);


  return (
 <>

      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
     

      {/* Hero Section */}
      <div className="relative pt-16 pb-12 md:pt-24 md:pb-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-4xl md:text-7xl font-extrabold tracking-tight transform transition-all duration-1000 ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="block">Decentralized Music Licensing</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 mt-2">on Arbitrum</span>
            </h1>
            <p className={`mt-6 max-w-2xl mx-auto text-xl text-gray-200 transform transition-all duration-1000 delay-300 ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              License music directly from creators with blockchain security. 
              Transparent, fair, and instant payments with low gas fees.
            </p>
            <div className={`mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 transform transition-all duration-1000 delay-500 ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Link href="/view-licences" className="px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all">
                View Licences
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-48 bg-gradient-to-r from-purple-600/20 to-transparent blur-xl rounded-r-full"></div>
        <div className="absolute right-0 top-1/3 -translate-y-1/2 w-32 h-64 bg-gradient-to-l from-pink-600/20 to-transparent blur-xl rounded-l-full"></div>
      </div>

      {/* Features */}
      <div className="py-20 bg-black/20 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">Why Choose BlockBeats?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-white/10 rounded-2xl bg-black/20 backdrop-blur-md hover:border-pink-500/50 transition-all shadow-xl group relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-all"></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <FaEthereum className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-300 transition-colors">Arbitrum Powered</h3>
              <p className="text-gray-300 group-hover:text-white transition-colors">Built on Arbitrum for lightning-fast transactions and minimal gas fees. Secure, efficient, and cost-effective.</p>
            </div>
            <div className="p-8 border border-white/10 rounded-2xl bg-black/20 backdrop-blur-md hover:border-pink-500/50 transition-all shadow-xl group relative overflow-hidden mt-8 md:mt-0">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-300 transition-colors">Smart Licensing</h3>
              <p className="text-gray-300 group-hover:text-white transition-colors">Clear licensing terms encoded in smart contracts for guaranteed rights protection and transparent agreements.</p>
            </div>
            <div className="p-8 border border-white/10 rounded-2xl bg-black/20 backdrop-blur-md hover:border-pink-500/50 transition-all shadow-xl group relative overflow-hidden mt-8 md:mt-0">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <FaHeadphones className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-300 transition-colors">Direct Payments</h3>
              <p className="text-gray-300 group-hover:text-white transition-colors">Artists receive instant payments directly to their wallet with no intermediaries, maximizing your earnings.</p>
            </div>
          </div>
        </div>
      </div>


      {/* How It Works */}
      <div className="py-20 bg-black/20 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl z-10 relative">1</div>
              <h3 className="text-xl font-bold mb-3">Connect Wallet</h3>
              <p className="text-gray-300">Link your Arbitrum-compatible wallet to get started on your journey.</p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl z-10 relative">2</div>
              <h3 className="text-xl font-bold mb-3">Browse Music</h3>
              <p className="text-gray-300">Explore our curated library of tracks from talented global artists.</p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl z-10 relative">3</div>
              <h3 className="text-xl font-bold mb-3">Choose License</h3>
              <p className="text-gray-300">Select the license type that perfectly fits your creative needs.</p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl z-10 relative">4</div>
              <h3 className="text-xl font-bold mb-3">Instant Access</h3>
              <p className="text-gray-300">Get immediate access to your licensed music with blockchain verification.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/20 rounded-full blur-xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Ready to revolutionize your music licensing?</h2>
            <p className="text-xl text-gray-300 mb-10 text-center max-w-2xl mx-auto">Join the community of artists and creators on the Arbitrum blockchain. Start licensing your music today.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href='/create-licence' className="px-8 py-4 text-base font-medium rounded-xl shadow-xl text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all text-center">
                Upload Your Music
              </Link>
            </div>
          </div>
        </div>
      </div>

 

      {/* Add some CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(30px, -50px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}