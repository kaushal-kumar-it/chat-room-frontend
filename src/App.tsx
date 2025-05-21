import React, { useState, useEffect } from 'react';
import "./App.css";

const App: React.FC = () => {
  const [code, setCode] = useState<number | undefined>();
  const [room, setRoom] = useState<string>('');
  const [joined, setJoined] = useState(false);
  const [web, setWeb] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (joined && code && !web) {
      const ws = new WebSocket('ws://localhost:8080');

      ws.onopen = () => {
        ws.send(`{ "type":"join", "payload":{ "roomId":${code} } }`);
      };

      ws.onmessage = (event: MessageEvent) => {
        setMessages((prev) => [...prev, `Friend: ${event.data}`]);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
      };

      setWeb(ws);
    }
  }, [joined, code, web]);

  const join = () => {
    if (room) {
      setCode(Number(room));
      setJoined(true);
    }
  };

  const send = () => {
    if (!web || web.readyState !== WebSocket.OPEN) return;

    web.send(`{ "type":"chat", "payload":{ "message":"${message}" } }`);
    setMessages((prev) => [...prev, `You: ${message}`]);
    setMessage('');
  };

  const random = () => {
    const number = Math.floor(Math.random() * 9000) + 1000;
    setCode(number);
  };

  return (
    <div className="bg-black h-[90vh] w-xl flex items-center justify-center">
      <div className="bg-[#111] p-6 rounded-lg w-full h-full max-w-none flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-1">💬 Real Time Chat</h2>
          <p className="text-gray-400 mb-4 text-sm">
            Temporary room that expires after all users exit
          </p>
        </div>

        {!joined && (
          <>
            <button
              className="w-full bg-white text-black font-mono font-semibold py-2 px-4 rounded mb-4"
              onClick={random}
            >
              Create New Room
            </button>

            <div className="flex gap-2 mb-4">
              <input
                type="number"
                className="flex-1 bg-transparent border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 font-mono"
                placeholder="Enter Room Code"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
              <button
                onClick={join}
                className="bg-white text-black font-mono px-4 py-2 rounded"
              >
                Join Room
              </button>
            </div>
          </>
        )}

        {code && (
          <div className="bg-[#222] text-center py-3 rounded mb-4">
            <p className="text-gray-400 text-sm mb-1">Share this code with your friend</p>
            <p className="text-white font-bold text-xl font-mono">{code}</p>
          </div>
        )}

        {joined && (
          <>
            <div className="flex-1 bg-black border border-gray-700  rounded-md mb-4 overflow-y-auto p-4">
              {messages.map((msg, index) => (
                <div key={index} className="text-sm text-gray-300 text-right">
                  {msg}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-[#111] text-white border border-gray-700 px-3 py-2 rounded focus:outline-none"
              />
              <button
                className="bg-white text-black font-semibold px-4 py-2 rounded hover:bg-gray-300"
                onClick={send}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
