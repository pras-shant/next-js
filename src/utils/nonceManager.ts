import User from '@/models/user';
import crypto from 'crypto';

const NONCE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

export const generateNonce = async (address: string): Promise<string> => {
    console.log("=====generateNonce=========start==========")

  const nonce = crypto.randomBytes(16).toString('hex');
  console.log("=====nonce=========start==========")

  await User.findOneAndUpdate(
    { user_address: address.toLowerCase() },
    { nonce },
    { upsert: true }
  );
  console.log("=====generateNonce=========c==========")

  return nonce;
};

export const validateNonce = async (
  address: string,
  nonce: string
): Promise<boolean> => {
  const user = await User.findOne({ user_address: address.toLowerCase() });
  if (!user || user.nonce !== nonce) {
    return false;
  }
  await User.findOneAndUpdate({ user_address: address.toLowerCase() }, { nonce: '' });
  return true;
};