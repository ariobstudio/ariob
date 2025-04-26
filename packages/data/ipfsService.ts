import { create, IPFSHTTPClient } from 'ipfs-http-client';
import SEA from 'gun/sea';

// Initialize IPFS client with appropriate configuration
const IPFS_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://ipfs.infura.io:5001/api/v0'
  : 'http://localhost:5001/api/v0';

let ipfs: IPFSHTTPClient;

try {
  ipfs = create({
    url: IPFS_API_URL
  });
} catch (error) {
  console.error('IPFS client initialization error:', error);
}

/**
 * Upload and encrypt a file to IPFS
 * @param file - The file to upload and encrypt
 * @param encryptionKey - Optional key for encryption, uses user's key if not provided
 * @returns Promise resolving to CID of the uploaded file
 */
export const uploadEncrypted = async (file: File | Blob, encryptionKey?: string): Promise<string> => {
  try {
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    
    // Encrypt the data
    const encrypted = await SEA.encrypt(data, encryptionKey);
    
    // Add the encrypted data to IPFS
    const result = await ipfs.add(JSON.stringify(encrypted));
    
    return result.cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Download and decrypt a file from IPFS
 * @param cid - The CID of the file to download
 * @param encryptionKey - The key used for decryption
 * @returns Promise resolving to the decrypted data
 */
export const downloadAndDecrypt = async (cid: string, encryptionKey: string): Promise<Uint8Array> => {
  try {
    // Get the file from IPFS
    const stream = ipfs.cat(cid);
    
    // Collect chunks
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    // Combine chunks
    const data = Buffer.concat(chunks).toString();
    
    // Parse and decrypt
    const encrypted = JSON.parse(data);
    const decrypted = await SEA.decrypt(encrypted, encryptionKey);
    
    return new Uint8Array(decrypted);
  } catch (error) {
    console.error('Error downloading from IPFS:', error);
    throw error;
  }
};

export default {
  uploadEncrypted,
  downloadAndDecrypt
};
