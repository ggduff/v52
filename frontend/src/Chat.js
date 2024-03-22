import React, { useState, useRef, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const parseMessageContent = (message) => {
    if (typeof message.content === 'string') {
      const codeBlockRegex = /```(.*?)```/gs;
      const parsedContent = [];

      let lastIndex = 0;
      let match;

      while ((match = codeBlockRegex.exec(message.content)) !== null) {
        const code = match[1];
        const textBefore = message.content.slice(lastIndex, match.index);

        if (textBefore) {
          parsedContent.push(<div key={lastIndex} className="message-content">{textBefore}</div>);
        }

        parsedContent.push(
          <div key={match.index} className="code-container">
            <SyntaxHighlighter language="python" style={vscDarkPlus} showLineNumbers>
              {code.trim()}
            </SyntaxHighlighter>
            <CopyToClipboard text={code.trim()} onCopy={() => toast.success("Code copied!", { position: "bottom-right" })}>
              <button className="copy-btn">Copy</button>
            </CopyToClipboard>
          </div>
        );

        lastIndex = codeBlockRegex.lastIndex;
      }

      const textAfter = message.content.slice(lastIndex);
      if (textAfter) {
        parsedContent.push(<div key={lastIndex} className="message-content">{textAfter}</div>);
      }

      return parsedContent;
    } else {
      return message.content;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Add the user's message to the chat immediately after sending
    setMessages((prevMessages) => [...prevMessages, { type: 'user', content: prompt }]);
    // Reset the prompt to be ready for new input
    setPrompt('');

    try {
      const res = await fetch('http://v51.thinkhuge.net:2152/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: 'standard', prompt }),
      });

      if (!res.ok) {
        // If the server response is not ok, throw an error with the status
        throw new Error(`API Error: ${res.statusText} (Status: ${res.status})`);
      }

      const result = await res.json();

      // Update the chat with the new message(s) from the response
      setMessages((prevMessages) => [...prevMessages, { type: 'frank', content: result.response || 'No response' }]);
    } catch (error) {
      // Handle any errors that occur during the fetch operation
      console.error('Error fetching response:', error);
      alert(`Error fetching response: ${error.message}. Please check your internet connection and the API URL.`);
    } finally {
      // Ensure isLoading is set to false after the operation completes, success or fail
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <header className="bg-gray-800 p-4 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Chat with HugeThink</h1>
        </div>
      </header>
      <div className="flex-grow w-full overflow-y-auto pt-20 p-6" ref={chatContainerRef}>
        <div>
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                {parseMessageContent(message)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 fixed bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto flex gap-4">
          <textarea className="flex-grow p-3 bg-gray-700 text-white border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={1} placeholder="Enter your prompt" style={{ minHeight: '3rem' }} />
          <button type="submit" className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-300 ${isLoading ? 'bg-red-600 animate-pulse text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Chat;