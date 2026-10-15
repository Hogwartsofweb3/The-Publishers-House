"use client";

import React, { useState } from "react";
import { Buffer } from "buffer";

// Ensure Buffer is available before web3 hooks evaluate
if (typeof window !== "undefined") {
  if (!(window as unknown as { Buffer?: typeof Buffer }).Buffer) {
    (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
  }
}

import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import PrivySafeProvider, { PrivyErrorBoundary } from "./PrivySafeProvider";

const S = {
  label: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  button: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  readSmall: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
};

interface PrivyCryptoGivingProps {
  displayAmount: number;
  name: string;
  email: string;
  category: string;
  churchAddress: string;
}

function PrivyGivingInner({
  displayAmount,
  name,
  email,
  category,
  churchAddress,
}: PrivyCryptoGivingProps) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const [isSending, setIsSending] = useState(false);
  const [txSuccess, setTxSuccess] = useState("");
  const [txError, setTxError] = useState("");
  const [copied, setCopied] = useState(false);

  const activeWallet = user?.wallet?.address;
  const shortAddress = activeWallet
    ? `${activeWallet.slice(0, 6)}...${activeWallet.slice(-4)}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(churchAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWalletTransfer = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (displayAmount < 100) {
      alert("Please enter a valid amount equivalent (min ₦100).");
      return;
    }

    setIsSending(true);
    setTxSuccess("");
    setTxError("");

    try {
      const usdAmount = displayAmount / 1600;
      const ethAmount = usdAmount / 3000;
      const weiAmount = BigInt(Math.max(1, Math.floor(ethAmount * 10 ** 18)));

      const txResult = await sendTransaction({
        to: churchAddress,
        value: `0x${weiAmount.toString(16)}`,
      });

      setTxSuccess("Transaction submitted successfully! Thank you for partnering in publishing the Word.");

      try {
        await fetch("/api/crypto-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name || user?.email?.address || shortAddress || "Anonymous",
            email: email || user?.email?.address || "Web3 Donor",
            amountNGN: displayAmount,
            category,
            network: "EVM",
            txHash: (txResult as unknown as { transactionHash?: string })?.transactionHash || "",
          }),
        });
      } catch (err) {
        console.error("Failed to log crypto transaction:", err);
      }
    } catch (err: unknown) {
      console.error("Transaction error:", err);
      const msg = err instanceof Error ? err.message : "Transaction was canceled or failed.";
      setTxError(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Wallet Status Banner */}
      <div
        style={{
          padding: "16px",
          background: authenticated ? "#F0FDF4" : "#F8FAFC",
          border: `1px solid ${authenticated ? "#BBF7D0" : "#E2E8F0"}`,
          borderRadius: "6px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ ...S.label, fontSize: "10px", color: authenticated ? "#166534" : "#64748B", display: "block" }}>
            {authenticated ? "Wallet Connected" : "Web3 Wallet (Privy)"}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#1E293B", fontWeight: 600 }}>
            {authenticated ? (shortAddress || user?.email?.address || "Connected") : "Not Connected"}
          </span>
        </div>
        <div>
          {authenticated ? (
            <button
              type="button"
              onClick={logout}
              style={{
                ...S.label,
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid #CBD5E1",
                borderRadius: "4px",
                fontSize: "10px",
                cursor: "pointer",
                color: "#64748B",
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={login}
              disabled={!ready}
              style={{
                ...S.label,
                padding: "8px 14px",
                background: "#0140C1",
                border: "none",
                borderRadius: "4px",
                fontSize: "10px",
                color: "#FFFFFF",
                cursor: !ready ? "not-allowed" : "pointer",
                letterSpacing: "0.1em",
                opacity: !ready ? 0.7 : 1,
              }}
            >
              {!ready ? "Loading..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      {authenticated ? (
        <button
          type="button"
          onClick={handleWalletTransfer}
          disabled={isSending}
          style={{
            ...S.button,
            width: "100%",
            height: "52px",
            background: "#0140C1",
            border: "none",
            borderRadius: "2px",
            color: "#FFFFFF",
            cursor: isSending ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#013091")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0140C1")}
        >
          {isSending ? "Approving Transfer..." : `Transfer ₦${displayAmount.toLocaleString()} via Connected Wallet`}
        </button>
      ) : (
        <button
          type="button"
          onClick={login}
          disabled={!ready}
          style={{
            ...S.button,
            width: "100%",
            height: "52px",
            background: "#0140C1",
            border: "none",
            borderRadius: "2px",
            color: "#FFFFFF",
            cursor: !ready ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            opacity: !ready ? 0.7 : 1,
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#013091")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0140C1")}
        >
          {!ready ? "Loading Wallet Provider..." : "Connect Wallet & Give"}
        </button>
      )}

      {txSuccess && (
        <div style={{ padding: "12px", background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: "4px", color: "#166534", fontSize: "12px", textAlign: "center", fontFamily: "'Poppins', sans-serif" }}>
          {txSuccess}
        </div>
      )}

      {txError && (
        <div style={{ padding: "12px", background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: "4px", color: "#991B1B", fontSize: "12px", textAlign: "center", fontFamily: "'Poppins', sans-serif" }}>
          {txError}
        </div>
      )}

      {/* Direct Copy Fallback */}
      <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #E2E8F0" }}>
        <span style={{ ...S.label, fontSize: "10px", color: "#64748B", display: "block", marginBottom: "8px" }}>
          Or send directly from any exchange or wallet:
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <code style={{ fontSize: "11px", color: "#151A54", wordBreak: "break-all", fontFamily: "monospace", background: "#F4F6FB", padding: "10px", borderRadius: "4px", border: "1px solid #D3DAEC" }}>
            {churchAddress}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              ...S.label,
              padding: "6px 12px",
              background: copied ? "#16A34A" : "transparent",
              color: copied ? "#FFFFFF" : "#0140C1",
              border: `1px solid ${copied ? "#16A34A" : "#0140C1"}`,
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "10px",
              alignSelf: "flex-start",
              transition: "all 0.2s",
            }}
          >
            {copied ? "COPIED! ✓" : "COPY EVM ADDRESS"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Fallback component if Privy fails to load or error boundary triggers
function PrivyFallback({ churchAddress }: { churchAddress: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ padding: "16px", background: "#F4F6FB", border: "1px solid #D3DAEC", borderRadius: "6px" }}>
      <span style={{ ...S.label, color: "#4A62A0", display: "block", marginBottom: "8px" }}>
        Send ETH, USDT, or USDC (Ethereum, Base, Arbitrum) to:
      </span>
      <code style={{ fontSize: "12px", color: "#151A54", wordBreak: "break-all", fontFamily: "monospace", background: "#FFFFFF", padding: "10px", borderRadius: "4px", border: "1px solid #E8ECF7", display: "block", marginBottom: "10px" }}>
        {churchAddress}
      </code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(churchAddress);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }}
        style={{
          padding: "8px 14px",
          background: copied ? "#16A34A" : "#0140C1",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          ...S.label,
          fontSize: "10px",
        }}
      >
        {copied ? "ADDRESS COPIED! ✓" : "COPY ADDRESS"}
      </button>
    </div>
  );
}

export default function PrivyCryptoGiving(props: PrivyCryptoGivingProps) {
  return (
    <PrivyErrorBoundary fallback={<PrivyFallback churchAddress={props.churchAddress} />}>
      <PrivySafeProvider fallback={<PrivyFallback churchAddress={props.churchAddress} />}>
        <PrivyGivingInner {...props} />
      </PrivySafeProvider>
    </PrivyErrorBoundary>
  );
}
