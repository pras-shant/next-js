import { NextApiRequest, NextApiResponse } from "next";
import { generateNonce, validateNonce } from "../../utils/nonceManager";
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { connectDB } from '@/lib/db';

type Data = {
  nonce?: string;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
): Promise<any> {


    try {
        
console.log("==============handler nocnce==========")
  if (req.method === "GET") {
    const { address } = req.query as { address?: string };
    await connectDB();

    if (!address) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Address is required." });
      return;
    }
    console.log("======2========handler nocnce==========")

    const nonce = await generateNonce(address);
    res.status(StatusCodes.OK).json({ nonce });
  } else if (req.method === "POST") {
    const { address, nonce } = req.body as { address?: string; nonce?: string };

    if (!address || !nonce) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Address and nonce are required." });
      return;
    }

    const isValid = await validateNonce(address, nonce);

    if (isValid) {
      res.status(StatusCodes.OK).json({ message: "Nonce validated successfully." });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid or expired nonce." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} catch (error) {
    console.log("sdsdfsdfsdbfsdf ", error)    
}

}
