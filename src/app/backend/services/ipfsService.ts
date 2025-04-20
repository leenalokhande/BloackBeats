// services/ipfsService.ts
import axios from 'axios';
import FormData from 'form-data';

class IPFSService {
  private apiKey: string | undefined;
  private apiSecret: string | undefined;
  private jwt: string | undefined;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    this.apiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
    this.jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    this.baseURL = 'https://api.pinata.cloud';
  }

  /**
   * Upload a file to IPFS via Pinata
   * @param file - The file to upload
   * @param name - Name for the file
   * @returns The IPFS hash (CID)
   */
  async uploadFile(file: Buffer | Blob, name?: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const metadata = JSON.stringify({
        name: name || 'Music License File',
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      const headers = {
        'Authorization': `Bearer ${this.jwt}`,
        ...(formData.getHeaders ? formData.getHeaders() : {})
      };

      const res = await axios.post(`${this.baseURL}/pinning/pinFileToIPFS`, formData, {
        headers
      });

      return res.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   * @param metadata - The metadata to upload
   * @param name - Name for the metadata
   * @returns The IPFS hash (CID)
   */
  async uploadMetadata(metadata: Record<string, any>, name?: string): Promise<string> {
    try {
      const data = JSON.stringify({
        pinataOptions: {
          cidVersion: 0
        },
        pinataMetadata: {
          name: name || 'Music License Metadata',
        },
        pinataContent: metadata
      });

      const res = await axios.post(`${this.baseURL}/pinning/pinJSONToIPFS`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.jwt}`
        }
      });

      return res.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Generate full IPFS URL from hash
   * @param hash - The IPFS hash (CID)
   * @returns The full IPFS URL
   */
  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
}

export default new IPFSService();
