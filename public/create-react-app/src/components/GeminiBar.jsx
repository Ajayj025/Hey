import React from "react";
import styled from "styled-components";

export default function GeminiBar({ onEnhance, onSummarize, onTranslate, onDetectToxicity }) {
  return (
    <Container>
      <button onClick={onEnhance}>🖋️ Enhance</button>
      <button onClick={onSummarize}>🧠 Summarize</button>
      <button onClick={onTranslate}>🌐 Translate</button>
      <button onClick={onDetectToxicity}>🚨 Detect</button>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 1rem;
  background-color: #222;
  padding: 0.8rem 1.2rem;
  border-top: 1px solid #444;
  justify-content: center;

  button {
    background-color: #4e0eff;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.6rem;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s ease-in-out;
  }

  button:hover {
    background-color: #997af0;
  }
`;
