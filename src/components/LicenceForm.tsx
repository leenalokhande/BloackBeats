// pages/create-license.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { FaMusic, FaFileUpload, FaSpinner, FaCheckCircle, FaEthereum, FaWallet } from 'react-icons/fa';
import { HiOutlineDocumentText, HiOutlineMusicNote, HiOutlineUser } from 'react-icons/hi';
import Web3 from 'web3';
import toast from 'react-hot-toast';
import { CONTRACT_ABI } from '../app/backend/services/contractService';

// Type definitions
interface FormDataType {
  title: string;
  artist: string;
  description: string;
  licenseeAddress: string;
  licenseType: number;
  duration: number;
  terms: string;
}

interface PreviewType {
  audio: string | null;
  image: string | null;
}

interface LicenseType {
  id: number;
  name: string;
  description: string;
}

interface TransactionType {
  transactionHash: string;
  events: {
    LicenseIssued?: {
      returnValues: {
        licenseId: string;
      }
    }
  }
}

export default function CreateLicense() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    artist: '',
    description: '',
    licenseeAddress: '',
    licenseType: 0,
    duration: 30,
    terms: ''
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [preview, setPreview] = useState<PreviewType>({
    audio: null,
    image: null
  });
  const [licenseId, setLicenseId] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const licenseTypes: LicenseType[] = [
    { id: 0, name: 'Streaming', description: 'License for streaming platforms' },
    { id: 1, name: 'Distribution', description: 'License for distribution to platforms' },
    { id: 2, name: 'Commercial', description: 'License for commercial use cases' },
    { id: 3, name: 'Remix', description: 'License to remix or sample the music' },
    { id: 4, name: 'Exclusive', description: 'Exclusive rights to the music' }
  ];

  // Connect wallet on initial load
  useEffect(() => {
    const connectAccount = async (): Promise<void> => {
      try {
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          setCurrentAccount(accounts[0]);
        } else {
          console.error('MetaMask is not installed');
          toast.error('Please install MetaMask to use this application');
        }
      } catch (error) {
        console.error('Failed to connect wallet', error);
        toast.error('Failed to connect wallet');
      }
    };
    
    connectAccount();
  }, []);

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file uploads
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'audio' | 'image'): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (fileType === 'audio') {
      setAudioFile(file);
      setPreview((prev) => ({
        ...prev,
        audio: URL.createObjectURL(file)
      }));
    } else if (fileType === 'image') {
      setImageFile(file);
      setPreview((prev) => ({
        ...prev,
        image: URL.createObjectURL(file)
      }));
    }
  };

  // Function to upload files to IPFS
  const uploadToIPFS = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload to IPFS');
      }
      
      return data.ipfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Create metadata JSON
  const createMetadata = async (): Promise<string> => {
    if (!audioFile) {
      throw new Error("Audio file is required");
    }
    
    // Upload audio file first
    const audioHash = await uploadToIPFS(audioFile);
    
    // Upload image if it exists
    let imageHash = '';
    if (imageFile) {
      imageHash = await uploadToIPFS(imageFile);
    }
    
    // Create metadata object
    const metadata = {
      title: formData.title,
      artist: formData.artist,
      description: formData.description,
      audioHash,
      imageHash,
      terms: formData.terms,
      createdAt: new Date().toISOString(),
    };
    
    // Convert metadata to Blob and upload
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    
    return await uploadToIPFS(metadataFile);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    
    if (!audioFile) {
      toast.error("Please select an audio file.");
      return;
    }
    
    if (!currentAccount) {
      toast.error("Please connect your wallet first.");
      return;
    }
    
    try {
      setIsLoading(true);
      toast.loading("Processing your license...");
      
      // 1. Upload files and metadata to IPFS
      const metadataHash = await createMetadata();
      
      // 2. Issue license on the blockchain
      const web3 = new Web3(window.ethereum);
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        throw new Error("Contract address is not defined in environment variables");
      }
      
      const contract = new web3.eth.Contract(CONTRACT_ABI as any, contractAddress);
      
      // Convert license type and duration to appropriate format
      const licenseTypeNum = parseInt(formData.licenseType.toString());
      const durationDays = parseInt(formData.duration.toString());
      
      // Call the contract method
      const transaction = await contract.methods
        .issueLicense(
          formData.licenseeAddress,
          licenseTypeNum,
          durationDays,
          metadataHash
        )
        .send({ from: currentAccount }) as TransactionType;
      
      // Get license ID from event logs
      const licenseIssuedEvent = transaction.events.LicenseIssued;
      if (licenseIssuedEvent) {
        const newLicenseId = licenseIssuedEvent.returnValues.licenseId;
        setLicenseId(newLicenseId);
        setTransactionHash(transaction.transactionHash);
        
        // Set success message
        setSuccess(`License ID #${newLicenseId} has been created successfully and issued to ${formData.licenseeAddress}`);
        
        // Move to success step
        setStep(3);
      } else {
        throw new Error("License creation event not found in transaction");
      }
      
      toast.dismiss();
      toast.success("License created successfully!");
    } catch (error: any) {
      console.error("Error creating license:", error);
      setError(error.message || "Failed to create license");
      toast.dismiss();
      toast.error("Failed to create license");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = (): void => setStep(step + 1);
  const prevStep = (): void => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white">
      <Head>
        <title>Create Music License | BlockBeats</title>
        <meta name="description" content="Create a new music license on the blockchain" />
      </Head>

  

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">Create Music License</h1>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700/30 rounded-full h-2 mb-10">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          
          {/* Step 1: Music Details */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <HiOutlineMusicNote className="mr-2 text-pink-400" />
                Music Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-pink-200">Track Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="Enter track title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-pink-200">Artist Name</label>
                  <input
                    type="text"
                    name="artist"
                    value={formData.artist}
                    onChange={handleChange}
                    className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="Enter artist name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-pink-200">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition h-24"
                  placeholder="Describe your music and its unique features..."
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-pink-200">Audio File</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileChange(e, 'audio')}
                      className="hidden"
                      id="audio-upload"
                      required
                    />
                    <label
                      htmlFor="audio-upload"
                      className="flex items-center justify-center w-full bg-black/40 text-white px-4 py-8 rounded-xl border-2 border-dashed border-purple-500/40 cursor-pointer hover:bg-black/50 transition group"
                    >
                      <div className="text-center">
                        <FaFileUpload className="mx-auto text-3xl mb-2 text-purple-400 group-hover:text-pink-400 transition" />
                        <span className="font-medium">{audioFile ? audioFile.name : "Upload Audio File"}</span>
                        <p className="text-xs text-gray-400 mt-1">MP3, WAV, FLAC (max 50MB)</p>
                      </div>
                    </label>
                  </div>
                  {preview.audio && (
                    <div className="mt-4 p-4 bg-black/30 rounded-xl">
                      <audio controls className="w-full">
                        <source src={preview.audio} />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-pink-200">Cover Image (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image')}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full bg-black/40 text-white px-4 py-8 rounded-xl border-2 border-dashed border-purple-500/40 cursor-pointer hover:bg-black/50 transition group"
                    >
                      <div className="text-center">
                        <FaFileUpload className="mx-auto text-3xl mb-2 text-purple-400 group-hover:text-pink-400 transition" />
                        <span className="font-medium">{imageFile ? imageFile.name : "Upload Cover Image"}</span>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (max 10MB)</p>
                      </div>
                    </label>
                  </div>
                  {preview.image && (
                    <div className="mt-4">
                      <img 
                        src={preview.image} 
                        alt="Cover preview" 
                        className="h-48 w-full object-cover rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.title || !formData.artist || !formData.description || !audioFile}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex items-center"
                >
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: License Details */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <HiOutlineDocumentText className="mr-2 text-pink-400" />
                License Details
              </h2>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-pink-200">Licensee Wallet Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEthereum className="text-purple-400" />
                  </div>
                  <input
                    type="text"
                    name="licenseeAddress"
                    value={formData.licenseeAddress}
                    onChange={handleChange}
                    className="w-full bg-black/30 text-white pl-10 pr-4 py-3 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="0x..."
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-300">The Ethereum address that will receive this license</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-pink-200">License Type</label>
                  <select
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleChange}
                    className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition appearance-none"
                    required
                  >
                    {licenseTypes.map(type => (
                      <option key={type.id} value={type.id} className="bg-gray-900">
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 p-3 bg-black/30 rounded-xl">
                    <p className="text-sm text-gray-300">
                      {licenseTypes[formData.licenseType].description}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-pink-200">Duration (days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    max="3650"
                    className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-300">
                    License will be valid for {formData.duration} days from creation
                    {formData.duration > 365 && " (approx. " + (formData.duration / 365).toFixed(1) + " years)"}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-pink-200">Additional Terms</label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleChange}
                  className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition h-32"
                  placeholder="Any additional terms or conditions for this license agreement..."
                ></textarea>
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-black/30 hover:bg-black/40 border border-purple-500/30 rounded-xl font-medium transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formData.licenseeAddress || isLoading || isUploading}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex items-center"
                >
                  {isLoading || isUploading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {isUploading ? "Uploading..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      Create License
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl">
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-green-400 text-5xl" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">License Created Successfully!</h2>
              
              <div className="max-w-lg mx-auto mt-8">
                <div className="bg-black/30 border border-purple-500/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">License ID</span>
                    <span className="font-mono font-bold text-pink-400">#{licenseId}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Type</span>
                    <span className="font-medium">{licenseTypes[formData.licenseType].name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Duration</span>
                    <span className="font-medium">{formData.duration} days</span>
                  </div>
                  
                  <div className="pt-4 border-t border-purple-500/20">
                    <div className="flex items-start mb-2">
                      <span className="text-gray-400 mr-2">Licensee</span>
                      <span className="font-mono text-sm break-all">{formData.licenseeAddress}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-2">Transaction</span>
                      <a 
                        href={`https://sepolia.arbiscan.io/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-purple-400 hover:text-pink-400 break-all"
                      >
                        {transactionHash}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="mb-8 mt-6 text-lg">{success}</p>
              
              <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <button
                  onClick={() => router.push('/view-licences')}
                  className="px-6 py-3 bg-black/30 hover:bg-black/40 border border-purple-500/30 rounded-xl font-medium transition"
                >
                  View My Licenses
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setFormData({
                      title: '',
                      artist: '',
                      description: '',
                      licenseeAddress: '',
                      licenseType: 0,
                      duration: 30,
                      terms: ''
                    });
                    setAudioFile(null);
                    setImageFile(null);
                    setPreview({ audio: null, image: null });
                    setSuccess('');
                    setError('');
                    setLicenseId(null);
                    setTransactionHash('');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-medium transition shadow-lg"
                >
                  Create Another License
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
 
    </div>
  );
}