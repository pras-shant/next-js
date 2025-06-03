



"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
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
    setExpiryDate(localData?.subscriptionExpiry);

    const socket = io(URL, {
      auth: { token },
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
      if (message === "unauthorized") {
        alert("Invalid or expired token. Please log in again.");
        try {
          localStorage.removeItem("token");
        } catch (storageErr) {
          console.error("Error clearing token:", storageErr);
        }
      } else {
        setErrorMessage(`Socket connection error: ${message}`);
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
      alert("An unexpected error occurred while fetching and downloading the Docker image.");
    }
  };

  const dismissError = () => setErrorMessage(null);

  return (
  <div className="flex justify-center ">
    <div className="flex flex-col justify-center max-w-xl w-[50vw] mx-auto my-10 border border-gray-300 rounded-lg h-[80vh] overflow-hidden font-sans">
      {errorMessage && (
        <div className="bg-red-100 text-red-800 border border-red-800 px-4 py-2 mb-2 rounded flex justify-between items-center">
          <p>{errorMessage}</p>
          <button onClick={dismissError} className="font-bold text-red-800">Dismiss</button>
        </div>
      )}

      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Subscription Expires:</h2>
          <p className="text-gray-600 text-sm mt-1">{formatDateOnly(expiryDate)}</p>
        </div>
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded-md text-sm"
        >
          Subscribe
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-2 px-3 py-2 rounded-md break-words ${
              msg.sender === "You"
                ? "bg-green-100 self-end ml-auto"
                : "bg-gray-200 self-start mr-auto"
            }`}
          >
            <strong>{msg.sender}:</strong> 
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex border-t border-gray-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          className="flex-1 px-4 py-3 text-base border-none outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-5 py-3 bg-blue-600 text-white text-base hover:bg-blue-800"
        >
          Send
        </button>
      </div>
    </div>
</div>
  );
}
