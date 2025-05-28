import { NextApiRequest, NextApiResponse } from "next";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { ECRClient, GetAuthorizationTokenCommand } from "@aws-sdk/client-ecr";
import { exec } from "child_process";
import util from "util";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import DockerImage from "../models/DockerImage";

const execPromise = util.promisify(exec);

// Initialize AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Initialize AWS ECR client
const ecr = new ECRClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function getEcrAuthToken() {
  const command = new GetAuthorizationTokenCommand({});
  const response = await ecr.send(command);
  if (!response.authorizationData || response.authorizationData.length === 0) {
    throw new Error("Failed to get ECR authorization token");
  }

  const authToken = response.authorizationData[0].authorizationToken!;
  const decodedToken = Buffer.from(authToken, "base64").toString("utf-8");
  const [username, password] = decodedToken.split(":");
  const proxyEndpoint = response.authorizationData[0].proxyEndpoint!;

  return { username, password, proxyEndpoint };
}

async function pushToEcr(imageName: string) {
  const { username, password, proxyEndpoint } = await getEcrAuthToken();

  // Login to ECR
  await execPromise(
    `docker login --username ${username} --password ${password} ${proxyEndpoint}`
  );

  // Tag the image for ECR
  const ecrImage = `${proxyEndpoint}/${imageName}`;
  await execPromise(`docker tag ${imageName} ${ecrImage}`);

  // Push the image to ECR
  await execPromise(`docker push ${ecrImage}`);

  return ecrImage;
}

async function downloadDockerImage(userAddress: string) {
  const dockerImage = await DockerImage.findOne({ user_address: userAddress });
  if (!dockerImage) {
    throw new Error("No Docker image found for this user");
  }

  return dockerImage; // Assuming the image name is stored in `imageName`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "prashant123";
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userAddress = decoded.user_address;

    if (!userAddress) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const imageName = await downloadDockerImage(userAddress);
    console.log(imageName,'imageName')
    const ecrImage = await pushToEcr(imageName);

    res.status(200).json({
      message: "Image pushed to ECR successfully",
      imageName,
      ecrImage,
    });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
