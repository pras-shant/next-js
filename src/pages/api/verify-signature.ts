import { NextApiRequest, NextApiResponse } from "next";
import { checkNonce } from "../../utils/nonceService";
import { verifySignature } from "../../utils/signatureService";

type RequestBody = {
  message?: string;
  signature?: string;
  expectedAddress?: string;
  nonce?: string;
};

type ResponseData = {
  message?: string;
  recoveredAddress?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { message, signature, expectedAddress, nonce } = req.body as RequestBody;

  if (!message || !signature || !expectedAddress || !nonce) {
    res.status(400).json({ error: "Message, signature, expectedAddress, and nonce are required." });
    return;
  }

  try {


    const isValid = verifySignature(message, signature, expectedAddress);

    if (isValid) {
      res.status(200).json({ message: "Signature verified successfully!", recoveredAddress: expectedAddress });
    } else {
      res.status(400).json({ error: "Signature does not match the address." });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
