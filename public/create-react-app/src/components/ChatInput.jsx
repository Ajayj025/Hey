import React, { useState, useRef, useEffect } from "react";
import Picker from "emoji-picker-react";
import styled from "styled-components";
import { BsEmojiSmileFill } from "react-icons/bs";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const inputRef = useRef(null);

  const handleEmojiPickerHideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiData) => {
    let message = msg;
    message += emojiData.emoji;
    setMsg(message);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Container>
      <div className="emoji-container">
        <div className="emoji" ref={inputRef}>
          <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />
        </div>
        {showEmojiPicker && (
          <div className="emoji-picker-react" ref={emojiRef}>
            <Picker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
      <form className="input-container" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="Type your message here"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #080420;

  .emoji-container {
    position: relative;
    display: flex;
    align-items: center;

    .emoji {
      color: yellow;
      cursor: pointer;
      font-size: 1.5rem;
      margin-right: 0.5rem;
    }

    .emoji-picker-react {
      position: absolute;
      bottom: 2.5rem;
      left: 0;
      z-index: 999;
    }
  }

  .input-container {
    display: flex;
    flex: 1;

    input {
      flex: 1;
      padding: 0.6rem 1rem;
      border-radius: 0.5rem;
      border: none;
      font-size: 1rem;
    }

    button {
      margin-left: 0.5rem;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 0.5rem;
      background-color: #4e0eff;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }
  }
`;
