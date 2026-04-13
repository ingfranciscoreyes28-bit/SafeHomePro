import { useState } from "react";
import ChatSafeHome from "./ChatSafeHome";

export default function ChatWidget() {
  const [chatAbierto, setChatAbierto] = useState(false);

  return (
    <div style={{
      position: "fixed",
      bottom: "35px",
      right: "35px",
      zIndex: 999
    }}>

      <div style={{
        marginBottom: "10px",
        display: chatAbierto ? "block" : "none"
      }}>
        <ChatSafeHome />
      </div>

      <button
        onClick={() => setChatAbierto(prev => !prev)}
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "#FFC107",
          color: "#000",
          fontSize: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px rgba(255,193,7,0.7)",
          transition: "all 0.25s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 0 25px rgba(255,193,7,1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(255,193,7,0.7)";
        }}
      >
        {chatAbierto ? "✖" : "🤖"}
      </button>

    </div>
  );
}