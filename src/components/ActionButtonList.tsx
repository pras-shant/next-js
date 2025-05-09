"use client";
import {
  useDisconnect,
  useAppKit,
  useAppKitNetwork,
  useAppKitAccount,
} from "@reown/appkit/react";
import { networks } from "@/config";
import { useSignMessage } from "wagmi";
import { Address } from "viem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectDB } from "@/lib/db";

export const ActionButtonList = () => {
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { switchNetwork } = useAppKitNetwork();
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected } = useAppKitAccount();

  const [nonce, setNonce] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null
  );
  const fetchNonce = async (): Promise<string | void> => {
    try {
      const response = await fetch(`/api/nonce?address=${address}`);
      if (!response.ok) {
        throw new Error("Failed to fetch nonce");
      }
      const data = await response.json();
      console.log("Nonce fetched:", data.nonce);
      setNonce(data.nonce)
      return data.nonce;
    } catch (error) {
      console.error("Error fetching nonce:", error);
      throw error;
    }
  };
  
  const handleSignMsg = async (nonce: string) => {
    try {
      const message = `Hello Reown AppKit! Nonce: ${nonce}`;
      const sig = await signMessageAsync({
        message,
        account: address as Address,
      });
      setSignature(sig);
      console.log("Message signed:", sig);
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  const fetchAndSign = async () => {
    try {
      const nonce = await fetchNonce();
      if (nonce) {
        await handleSignMsg(nonce);
      }
    } catch (error) {
      console.error("Error in fetch and sign:", error);
    }
  };

  
  const verifySignature = async () => {
    if (!nonce || !signature || !address) {
      console.error(
        "Nonce, signature, and address are required for verification."
      );
      return;
    }

    try {
      const response = await fetch(
        "/api/verify-signature",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Hello Reown AppKit! Nonce: ${nonce}`,
            signature,
            expectedAddress: address,
            nonce,
          }),
        }
      );

      if (!response.ok) throw new Error("Signature verification failed");
      const data = await response.json();

      if (data.recoveredAddress) {
        localStorage.setItem("userAddress", data.recoveredAddress);

        const saveResponse = await fetch("/api/insertAddress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_address: data.recoveredAddress }),
        });

        if (!saveResponse.ok) throw new Error("Failed to save user address");
        const saveData = await saveResponse.json();
        console.log("User address saved successfully:", saveData);
        localStorage.setItem("token", saveData.token);
        window.location.href = "/upload";
      }
    } catch (error) {
      console.error("Error verifying signature:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    <div>
      <button onClick={() => open()}>Connect wallet</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      <button onClick={() => switchNetwork(networks[1])}>Switch</button>
      {isConnected && (
        <div>
          <button onClick={fetchAndSign}>Fetch Nonce & Sign Message</button>
          <button onClick={verifySignature}>Verify Signature</button>
          {verificationResult && <p>{verificationResult}</p>}
        </div>
      )}
    </div>
  );
};
