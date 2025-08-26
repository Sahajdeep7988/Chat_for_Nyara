"use client";

import { siteConfig } from "@/config/site";
import { useState } from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length,
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: input,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Something went wrong");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: messages.length + 1,
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "8px 8px 0 0", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "20px" }}>{siteConfig.name}</h1>
      </div>
      <div style={{ border: "1px solid #f0f0f0", padding: "10px", height: "400px", overflowY: "auto", display: "flex", flexDirection: "column-reverse" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {error && <div style={{ color: "red", textAlign: "center" }}>Error: {error}</div>}
          {[...messages].reverse().map((msg) => (
            <div key={msg.id} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                background: msg.role === "user" ? "#007bff" : "#e9e9eb",
                color: msg.role === "user" ? "white" : "black",
                padding: "8px 12px",
                borderRadius: "18px",
                maxWidth: "70%",
                wordWrap: "break-word",
                textAlign: msg.role === "user" ? "right" : "left",
              }}>
                <strong>{msg.role === "user" ? "You" : siteConfig.name}: </strong>{msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", padding: "10px", border: "1px solid #f0f0f0", borderRadius: "0 0 8px 8px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
          disabled={loading}
          placeholder="Type your message..."
          style={{ flexGrow: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "18px", marginRight: "10px" }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{ padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "18px", cursor: "pointer" }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
