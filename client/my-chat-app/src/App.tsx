import React, { useState, useEffect } from 'react';
import './App.css';


const App: React.FC = () => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [userName, setUserName] = useState('');
    const [chatId, setChatId] = useState('');
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");

    const connectToChat = () => {
        const socket = new WebSocket('ws://localhost:8080');
        setWs(socket);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'register', userName, chatId }));
        };

        socket.onmessage = (event) => {
            setMessages(prev => [...prev, event.data]);
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error', error);
        };

        return () => {
            socket.close();
        };
    };

    const sendMessage = () => {
        if(ws) {
            ws.send(JSON.stringify({ type: 'message', userName, chatId, message: input }));
            setInput("");
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-inputs">
                <input 
                    type="text"
                    placeholder="Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)} 
                />
                <input 
                    type="text"
                    placeholder="Chat ID"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)} 
                />
                <button onClick={connectToChat}>Join chat</button>
            </div>
            <div className="chat-messages">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)} 
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div className="chat-messages">
              {messages.map((message, idx) => {
                  const msgData = JSON.parse(message);
                  
                  if (msgData.type === 'system') {
                      return <div key={idx} className="chat-message system-message">{msgData.message}</div>;
                  } else {
                      return <div key={idx} className="chat-message">{msgData.userName}: {msgData.message}</div>;
                  }
              })}
            </div>

        </div>
    );
};

export default App;
