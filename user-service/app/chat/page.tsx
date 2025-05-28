"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./chat.css";
import { formatDateOnly } from "./date";

export default function ChatPage() {
  const URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
      let token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");
      const localData = JSON.parse(userData || "null");
      setExpiryDate(localData.subscriptionExpiry);
      const socket = io(  URL, {
        auth: {
          token,
        },
      });

      setSocket(socket);

    const handleResponse = (data: string) => {
      try {
        if (typeof data !== "string")
          throw new Error("Invalid response format");
        setMessages((prev) => [...prev, { sender: "AI", text: data }]);
      } catch (err) {
        setErrorMessage("You have exceeded your limit");
        console.error("Error handling socket response:", err);
      }
    };

    const handleConnectError = (err: any) => {
      const message = err?.message ?? "Unknown error";
      console.log(message, err, "message========");
      if (message === "unauthorized") {
        alert("Invalid or expired token. Please log in again.");
        try {
          localStorage.removeItem("token");
        } catch (storageErr) {
          console.error("Error clearing token:", storageErr);
        }
      } else {
        setErrorMessage(`Socket connection error: ${message}`);
        console.error("Socket connection error:", message);
      }
    };

    socket.on("response", handleResponse);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("response", handleResponse);
      socket.off("connect_error", handleConnectError);
    };
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (trimmed !== "") {
      setMessages((prev) => [...prev, { sender: "You", text: trimmed }]);
      socket.emit("message", trimmed);
      setInput("");
    }
  };

  const handleClick = async () => {
    try {
      const response = await fetch("/api/subscribe", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Error fetching file URL:", errorMessage);
        return;
      }

      const data = await response.json();
      setExpiryDate(data.subscription_expiry);

      const userData = localStorage.getItem("userData");

      const localData = JSON.parse(userData || "null");
      localData.subscriptionExpiry = data.subscription_expiry;

      localStorage.setItem("userData", JSON.stringify(localData));
    } catch (error) {
      console.error("Error during API call:", error);
      alert(
        "An unexpected error occurred while fetching and downloading the Docker image."
      );
    }
  };
  const dismissError = () => setErrorMessage(null);

  return (
    <div className="chatContainer">
      {errorMessage && (
        <div className="errorMessage">
          <p>{errorMessage}</p>
          <button onClick={dismissError}>Dismiss</button>
        </div>
      )}
      <div className="subscriptionHeader">
        <div className="expiryInfo">
          <h2>Subscription Expires:</h2>
          <p>{formatDateOnly(expiryDate)}</p>
        </div>
        <button className="subscribeButton" onClick={handleClick}>
          Subscribe
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === "You" ? "user" : "ai"}`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="inputContainer">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
