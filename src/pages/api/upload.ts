import { NextApiRequest, NextApiResponse } from "next";
import { uploadToS3 } from "@/lib/s3";
import { connectDB } from "@/lib/db";
import DockerImage, { IDockerImage } from "@/models/DockerImage";
// import { v4 as uuidv4 } from "uuid";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to use Busboy
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userWallet = validateTokenAndGetWallet(token);
    if (!userWallet) return res.status(401).json({ error: 'Invalid token' });

    console.log("Request received, initializing Busboy");

    const busboy = Busboy({ headers: req.headers });
    let fileBuffer: Buffer = Buffer.alloc(0);
    let fileName = "";
    let mimeType = "";

    busboy.on("file", (_, file, info) => {
      fileName = info.filename;
      mimeType = info.mimeType;

      file.on("data", (data: Buffer) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });

      file.on("end", () => {
        console.log("File stream ended");
      });
    });

    busboy.on("finish", async () => {
      try {
        const allowedExtensions = [".tar", ".tar.gz", ".tar.xz", ".tar.bz2", ".tar.zst"];

        if (!fileName || !allowedExtensions.some(ext => fileName.endsWith(ext))) {
          throw new Error("Invalid file extension or missing file");
        }
        
        console.log("Uploading to S3...");
        const uniqueFileName = `agent_${userWallet}_${Date.now()}.tar`;
        const s3Url = await uploadToS3({ buffer: fileBuffer, filename: uniqueFileName, mimetype: mimeType });
        console.log("File uploaded to S3:", s3Url);
        const dockerImage: IDockerImage = new DockerImage({
          image_name: uniqueFileName,
          s3_url: s3Url,
          user_address: userWallet
        });
        await dockerImage.save();

        res.status(200).json({ message: "File uploaded successfully", fileName: uniqueFileName, s3Url });
      } catch (error: any) {
        console.error("Error during file processing:", error);
        res.status(500).json({ error: "Upload failed" });
      }
    });

    req.pipe(busboy);
  } catch (error: any) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: error.message });
  }
}

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function validateTokenAndGetWallet(token: string): any | null {
  try {
    const decoded: any = jwt.verify(token, "prashant123") ;
    return decoded.user_address ;
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}

