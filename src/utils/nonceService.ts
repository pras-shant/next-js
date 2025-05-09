type NonceData = {
    nonce: string;
    expiration: number;
  };
  
  const nonces = new Map<string, NonceData>();
  
  export const checkNonce = (address: string, nonce: string): boolean => {
    const storedData = nonces.get(address.toLowerCase());
    if (!storedData || storedData.nonce !== nonce || Date.now() > storedData.expiration) {
      return false;
    }
    nonces.delete(address.toLowerCase());
    return true;
  };
  