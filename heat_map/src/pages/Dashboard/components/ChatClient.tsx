import React, { useState, useEffect } from 'react';

interface ChatMessage {
  name: string;
  message: string;
}

interface ChatClientProps {
  socketUrl: string;
}

const ChatClient: React.FC<ChatClientProps> = ({ socketUrl }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting");

  useEffect(() => {
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") {
        setMessages(data.messages || []);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setConnectionStatus("disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("disconnected");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [socketUrl]);

  const handleSendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && message.trim() !== '') {
      socket.send(JSON.stringify({ message }));
      setMessage('');
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center mb-4">
          <div
            className={`w-3 h-3 rounded-full mr-3 ${
              connectionStatus === "connected"
                ? "bg-green-500 animate-pulse"
                : "bg-red-500"
            }`}
          ></div>
          <h2 className="text-xl font-bold text-gray-900">Live Chat</h2>
          <div
            className={`ml-auto px-3 py-1 text-xs font-medium rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {connectionStatus === "connected" ? "Connected" : "Not Connected"}
          </div>
        </div>

        {/* Chat messages (same as before) */}
        <div className="bg-gray-50/50 rounded-xl p-4 mb-4" style={{ minHeight: 200, maxHeight: 300 }}>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {msg.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-900">{msg.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{msg.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input + Send button */}
        <div className="flex space-x-3">
          <input
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Type your message here..."
            disabled={connectionStatus !== "connected"}
          />
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={!message.trim() || connectionStatus !== "connected"}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatClient;
