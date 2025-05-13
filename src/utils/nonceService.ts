import User from '../models/user'; // Adjust the path to your User model

export const checkNonce = async (address: string, nonce: string): Promise<boolean> => {
  const user = await User.findOne({ user_address: address.toLowerCase() });

  if (!user || user.nonce !== nonce) {
    return false;
  }

  // Invalidate the nonce after successful validation
  await User.findOneAndUpdate({ user_address: address.toLowerCase() }, { nonce: '' });

  return true;
};
