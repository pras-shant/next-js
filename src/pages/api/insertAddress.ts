import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { connectDB } from '@/lib/db';
import User from '@/models/user';

// Secret key for signing the JWT (store this securely in your environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { user_address } = req.body;

  if (!user_address) {
    return res.status(400).json({ message: 'User address is required' });
  }

  try {
    await connectDB();

    let user = await User.findOne({ user_address });

    if (!user) {
      user = new User({ user_address });
      await user.save();
    }

    const token = jwt.sign({ user_address }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({
      message: 'User address processed successfully',
      data: user,
      token,
    });
  } catch (error) {
    console.error('Error adding user address:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
