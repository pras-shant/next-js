import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import { connectDB } from "../../lib/db";
import User from "../../models/user";
import { NextApiRequest, NextApiResponse } from "next";

// Secret key (use environment variable in real app)
const JWT_SECRET = process.env.JWT_SECRET || "prashant123";

// Token validator
function validateTokenAndGetWallet(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.user_address;
  } catch (error) {
    console.error("Token validation failed:", error);
    return null;
  }
}

// GET handler (App Router style)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    console.log(token, "received token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWallet = validateTokenAndGetWallet(token);
    if (!userWallet) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await User.findOne({ user_address: userWallet });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const currentExpiry = user.subscriptionExpiry || now;
    const newExpiry = new Date(currentExpiry > now ? currentExpiry : now);
    newExpiry.setDate(newExpiry.getDate() + 1);

    user.subscriptionExpiry = newExpiry;
    await user.save();

    return NextResponse.json(
      {
        message: "Subscription extended by 1 day",
        subscription_expiry: newExpiry,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in subscription:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
