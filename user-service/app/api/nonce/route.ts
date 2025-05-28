import { NextRequest, NextResponse } from "next/server";
// import { generateNonce, validateNonce } from "../../../utils/nonceManager";
// import { connectDB } from "../../../lib/db";
import { StatusCodes } from "http-status-codes";
import { connectDB } from "../../lib/db";
import { generateNonce, validateNonce } from "../../utils/nonceManager";

// Handler for GET requests
export async function GET(req: NextRequest) {
  try {
    console.log("Incoming GET request to /api/nonce");
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address is required." },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    await connectDB();
    const nonce = await generateNonce(address);

    return NextResponse.json({ nonce }, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error in GET /api/nonce:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

// Handler for POST requests
export async function POST(req: NextRequest) {
  try {
    console.log("Incoming POST request to /api/nonce");
    const body = await req.json();
    const { address, nonce } = body;

    if (!address || !nonce) {
      return NextResponse.json(
        { error: "Address and nonce are required." },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const isValid = await validateNonce(address, nonce);

    if (isValid) {
      return NextResponse.json(
        { message: "Nonce validated successfully." },
        { status: StatusCodes.OK }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid or expired nonce." },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/nonce:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
