import { NextApiRequest, NextApiResponse } from "next";
import { generateNonce, validateNonce } from "../../utils/nonceManager";

type Data = {
  nonce?: string;
  message?: string;
  error?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>): void {
  if (req.method === "GET") {
    const { address } = req.query as { address?: string };

    if (!address) {
      res.status(400).json({ error: "Address is required." });
      return;
    }

    const nonce = generateNonce(address);
    res.status(200).json({ nonce });
  } else if (req.method === "POST") {
    const { address, nonce } = req.body as { address?: string; nonce?: string };

    if (!address || !nonce) {
      res.status(400).json({ error: "Address and nonce are required." });
      return;
    }

    const isValid = validateNonce(address, nonce);

    if (isValid) {
      res.status(200).json({ message: "Nonce validated successfully." });
    } else {
      res.status(400).json({ error: "Invalid or expired nonce." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
