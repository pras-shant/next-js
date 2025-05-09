import crypto from "crypto";

type NonceData = {
  nonce: string;
  expiration: number;
};

const NONCE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes
const nonces = new Map<string, NonceData>();

export const generateNonce = (address: string): string => {
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiration = Date.now() + NONCE_EXPIRATION_TIME;
  nonces.set(address.toLowerCase(), { nonce, expiration });
  return nonce;
};

export const validateNonce = (address: string, nonce: string): boolean => {
  const storedData = nonces.get(address.toLowerCase());
  if (!storedData || storedData.nonce !== nonce || Date.now() > storedData.expiration) {
    return false;
  }
  nonces.delete(address.toLowerCase());
  return true;
};
