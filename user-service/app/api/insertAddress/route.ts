import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import { connectDB } from "../../lib/db";
import User from "../../models/user";
// import { connectDB } from "../../../lib/db";
// import User from "../../../models/user";

// Secret key for signing the JWT (store securely in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
console.log(JWT_SECRET,'jwttt secret')
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_address } = body;

    if (!user_address) {
      return NextResponse.json(
        { message: "User address is required" },
        { status: 400 }
      );
    }

    await connectDB();

    let user = await User.findOne({ user_address });

    if (!user) {
      user = new User({ user_address });
      await user.save();
    }

    // Generate a JWT token with the user_address as payload
    const token = jwt.sign({ user_address,role:'creator' }, JWT_SECRET, { expiresIn: "1h" });
    //     const token = jwt.sign(
    //   { id: user._id.toString(), role: 'creator' },
    //   JWT_SECRET,
    //   { expiresIn: "1h" }
    // );


    return NextResponse.json(
      {
        message: "User address processed successfully",
        data: user,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user address:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
