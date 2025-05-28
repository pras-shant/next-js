import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "../../utils/signatureService";
// import { checkNonce } from "../../../utils/nonceService";
// import { verifySignature } from "../../../utils/signatureService";

type RequestBody = {
  message?: string;
  signature?: string;
  expectedAddress?: string;
  nonce?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, signature, expectedAddress, nonce } = body as RequestBody;

    if (!message || !signature || !expectedAddress || !nonce) {
      return NextResponse.json(
        { error: "Message, signature, expectedAddress, and nonce are required." },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifySignature(message, signature, expectedAddress);

    if (isValid) {
      return NextResponse.json(
        { message: "Signature verified successfully!", recoveredAddress: expectedAddress },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Signature does not match the address." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error verifying signature:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
