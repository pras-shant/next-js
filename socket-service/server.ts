import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { InferenceClient } from "@huggingface/inference";
import cors from "cors";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email?: string;
  // Add more fields as needed
}

interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = 3001;
const JWT_SECRET = "your-secret-key";
const HF_TOKEN = process.env.HF_Token;

const client = new InferenceClient(HF_TOKEN);

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.use((socket: AuthenticatedSocket, next) => {
  const token = socket.handshake.auth?.token;
  console.log("Received token:", token);

  if (!token) {
    return next(new Error("Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    socket.user = decoded;
    next();
  } catch (err) {
    console.log("Invalid token:", (err as Error).message);
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket: AuthenticatedSocket) => {
  console.log("A user connected:", socket.user);

  socket.on("message", async (data: string) => {
    console.log("Message received:", data);

    try {
      const out = await client.chatCompletion({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [{ role: "user", content: data }],
        max_tokens: 512,
        provider: "sambanova",
      });

      const responseText =
        out.choices?.[0]?.message.content || out.generated_text || "No response";

      socket.emit("response", responseText);
    } catch (error) {
      console.error("Error communicating with LLM:", error);
      socket.emit("response", {
        error: "Failed to get response from the LLM.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
