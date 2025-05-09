import Web3 from "web3";

export const web3 = new Web3(); // Replace with your Ethereum node endpoint

export const verifySignature = (
  message: string,
  signature: string,
  expectedAddress: string
): boolean => {
  const recoveredAddress = web3.eth.accounts.recover(message, signature);
  return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
};
