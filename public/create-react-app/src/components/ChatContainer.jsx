import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import {
  getOpenRouterReply,
  summarizeMessage,
  translateMessage,
  detectToxicity,
} from "../utils/openrouter";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      const chatUser = localStorage.getItem("chat-app-user");
      if (!chatUser || !currentChat) return;

      try {
        const data = JSON.parse(chatUser);
        const response = await axios.post(recieveMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const chatUser = localStorage.getItem("chat-app-user");
    if (!chatUser || !currentChat) return;

    const data = JSON.parse(chatUser);
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    });

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off("msg-recieve");
      }
    };
  }, []);

  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAIAction = async (type) => {
    try {
      if (!aiInput.trim()) return;

      if (type === "enhance") {
        const result = await getOpenRouterReply(aiInput);
        setAiOutput(result || "No response");
      } else if (type === "summarize") {
        const result = await summarizeMessage([{ message: aiInput }]);
        setAiOutput(result || "No summary");
      } else if (type === "translate") {
        const result = await translateMessage(aiInput, "hi");
        setAiOutput(result || "No translation");
      } else if (type === "toxicity") {
        const result = await detectToxicity(aiInput);
        setAiOutput(result ? "⚠️ May be toxic" : "✅ Looks safe");
      }
    } catch (err) {
      setAiOutput("Error processing message");
    }
  };

  if (!currentChat) return null;

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt="avatar"
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>

        <button className="ai-toggle" onClick={() => setShowAI((prev) => !prev)}>
          {showAI ? "X" : "Ask AI🤖"}
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div ref={scrollRef} key={uuidv4()}>
            <div className={`message ${message.fromSelf ? "sended" : "recieved"}`}>
              <div className="content">
                <p>{message.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAI && (
        <div className="ai-panel">
          <textarea
            placeholder="Paste or write your message here..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          />
          <div className="ai-actions">
            <button onClick={() => handleAIAction("enhance")}>Enhance</button>
            <button onClick={() => handleAIAction("summarize")}>Summarize</button>
            <button onClick={() => handleAIAction("translate")}>Translate</button>
            <button onClick={() => handleAIAction("toxicity")}>Check Toxicity</button>
          </div>
          <div className="ai-output">
            <strong>Response:</strong>
            <p>{aiOutput}</p>
          </div>
        </div>
      )}

      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.1rem;
  overflow: hidden;
  position: relative;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #2d2d2d;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar {
        img {
          height: 3rem;
        }
      }

      .username {
        h3 {
          color: white;
        }
      }
    }

    .ai-toggle {
      background-color: #4f04ff;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 1rem;
      cursor: pointer;
      font-size: 0.9rem;
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }

    .sended {
      justify-content: flex-end;

      .content {
        background-color: #4f04ff21;
      }
    }

    .recieved {
      justify-content: flex-start;

      .content {
        background-color: #9900ff20;
      }
    }
  }

    .ai-panel {
    position: absolute;
    top: 4rem;
    right: 0;
    width: 50%;
    max-width: 600px;
    height: auto;
    background-color: #1e1e1e;
    color: white;
    padding: 1.5rem;
    border-radius: 1rem 0 0 1rem;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 1000;

    textarea {
      width: 100%;
      height: 100px;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: none;
      resize: none;
      font-size: 1rem;
      background: #2c2c2c;
      color: white;
    }

    .ai-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

      button {
        flex: 1;
        min-width: 100px;
        padding: 0.6rem;
        border: none;
        border-radius: 0.5rem;
        background-color: #4f04ff;
        color: white;
        cursor: pointer;
        font-size: 0.85rem;
        transition: background 0.2s ease;

        &:hover {
          background-color: #3c03cc;
        }
      }
    }

    .ai-output {
      font-size: 0.95rem;
      background: #2c2c2c;
      padding: 0.75rem;
      border-radius: 0.5rem;
      min-height: 60px;
      white-space: pre-wrap;
    }
  }
`
