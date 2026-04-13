import { useState, useRef, useEffect } from "react";

export default function ChatSafeHome() {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const userMsg = { role: "user", content: mensaje };
    setMensajes(prev => [...prev, userMsg]);
    setMensaje("");
    setLoading(true);

    try {
      const res = await fetch("https://ai-assistant-api-zd1a.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mensaje: userMsg.content })
      });

      const data = await res.json();

      const botMsg = {
        role: "bot",
        content: data.respuesta || "Sin respuesta"
      };

      setMensajes(prev => [...prev, botMsg]);

    } catch (error) {
      setMensajes(prev => [
        ...prev,
        { role: "bot", content: "Error conectando con el asistente" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-chat">

      {/* Header */}
      <div className="sh-chat-header">
        SafeHome Assistant
      </div>

      {/* Mensajes */}
      <div className="sh-chat-body">
        {mensajes.map((msg, index) => (
          <div
            key={index}
            className={`sh-chat-msg ${msg.role}`}
          >
            <div className="sh-chat-bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="sh-chat-msg bot">
            <div className="sh-chat-bubble">
              escribiendo...
            </div>
          </div>
        )}

        <div ref={chatRef}></div>
      </div>

      {/* Input */}
      <div className="sh-chat-input">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
        <button onClick={enviarMensaje}>➤</button>
      </div>

    </div>
  );
}