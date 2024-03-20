// Chat.js
import React, { useState } from 'react';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { model: 'standard', prompt };

    try {
        console.log('Sending request:', data);
        const res = await fetch('http://localhost:2152/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      
        const result = await res.json();
        if (res.ok) {
          setResponse(result.message?.content || 'No response');
        } else {
          setResponse(result.error || 'Error fetching response');
        }
      } catch (error) {
        console.error('Error fetching response:', error);
        setResponse('Error fetching response');
      }
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
      <p>Test Message: Chat Component</p>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <textarea
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '0.25rem' }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Enter your prompt"
        ></textarea>
        <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
          Send
        </button>
      </form>
      {response && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default Chat;