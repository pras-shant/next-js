"use client";
import {
  useDisconnect,
  useAppKit,
  useAppKitAccount,
} from "@reown/appkit/react";
import { useSignMessage } from "wagmi";
import { Address } from "viem";
import { useState } from "react";

export const ActionButtonList = () => {
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected, embeddedWalletInfo } =
    useAppKitAccount();

  const [nonce, setNonce] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null
  );
  const fetchNonce = async (): Promise<string | void> => {
    try {
      const response = await fetch(`/api/nonce?address=${address}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch nonce");
      }
      const data = await response.json();
      console.log("Nonce fetched:", data.nonce);
      setNonce(data.nonce);
      return data.nonce;
    } catch (error) {
      console.error("Error fetching nonce:", error);
      throw error;
    }
  };
  console.log(embeddedWalletInfo, "embedded", address);
  const handleSignMsg = async (nonce: string) => {
    try {
      const message = `Hello Reown AppKit! Nonce: ${nonce}`;
      const sig = await signMessageAsync({
        message,
        account: address as Address,
      });
      setSignature(sig);
      verifySignature(nonce, sig, address);
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

  const verifySignature = async (nonce, signature, address) => {
    if (!nonce || !signature || !address) {
      console.error(
        "Nonce, signature, and address are required for verification."
      );
      return;
    }

    try {
      const response = await fetch("/api/verifySignature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Hello Reown AppKit! Nonce: ${nonce}`,
          signature,
          expectedAddress: address,
          nonce,
        }),
      });

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
        localStorage.setItem("userData", JSON.stringify(saveData.data));
      }
    } catch (error) {
      console.error("Error verifying signature:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      localStorage.clear();
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-4 ">
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition cursor-pointer"
          onClick={() => open()}
        >
          Connect wallet
        </button>
        <button
          className="px-6 py-3 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition cursor-pointer"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      

        {isConnected && (
          <>
            <button
              className="px-6 py-3 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition"
              onClick={fetchAndSign}
            >
              Create Account
            </button>
            
          </>
        )}
</div>
<div>
{verificationResult && <p>{verificationResult}</p>}
</div>
    </div>
  );
};
