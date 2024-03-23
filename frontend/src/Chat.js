import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.maxHeight = '120px'; // Set the maximum height to 10 lines (assuming line height of 12px)
    }
  };

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    adjustTextareaHeight();
  }, [messages, prompt]);

  const parseMessageContent = (message) => {
    if (typeof message.content === 'string') {
      const codeBlockRegex = /```(.*?)\n(.*?)```/gs;
      const parsedContent = [];

      let lastIndex = 0;
      let match;

      while ((match = codeBlockRegex.exec(message.content)) !== null) {
        const language = match[1].trim();
        const code = match[2];
        const textBefore = message.content.slice(lastIndex, match.index);

        if (textBefore) {
          parsedContent.push(
            <div key={lastIndex} className="message-content p-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{textBefore}</ReactMarkdown>
            </div>
          );
        }

        parsedContent.push(
          <div key={match.index} className="code-container relative">
            <div className="code-title bg-gray-700 text-gray-200 px-4 py-1 text-sm rounded-t-md">{language}</div>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers
              lineNumberStyle={{
                display: 'inline-block',
                width: 'fit-content',
                marginRight: '10px',
                textAlign: 'right',
                paddingRight: '10px',
                backgroundColor: '#1E1E1E',
              }}
              lineNumberContainerStyle={{
                float: 'left',
                paddingRight: '10px',
                color: '#9B9B9B',
              }}
              customStyle={{
                backgroundColor: '#1E1E1E',
                padding: '20px',
                borderRadius: '0 0 5px 5px',
                marginTop: '-1px',
              }}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#1E1E1E',
                  display: 'block',
                },
              }}
            >
              {code.trim()}
            </SyntaxHighlighter>
            <CopyToClipboard text={code.trim()} onCopy={() => toast.success('Code copied!', { position: 'bottom-right' })}>
              <button className="copy-btn absolute bottom-2 right-2 bg-gray-600 bg-opacity-75 text-gray-300 hover:text-white rounded-sm px-2 py-1 text-xs transition-colors duration-300">
                Copy
              </button>
            </CopyToClipboard>
          </div>
        );

        lastIndex = codeBlockRegex.lastIndex;
      }

      const textAfter = message.content.slice(lastIndex);
      if (textAfter) {
        parsedContent.push(
          <div key={lastIndex} className="message-content p-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textAfter}</ReactMarkdown>
          </div>
        );
      }

      return parsedContent;
    } else {
      return message.content;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the prompt is empty
    if (!prompt.trim()) {
      alert('Please enter a prompt.');
      return;
    }

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
      <header className="bg-dark-charcoal p-6 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-white text-2xl mr-4">🌐</span>
            <h1 className="text-3xl font-bold text-gray-400">Chat with HugeThink</h1>
          </div>
          <div className="relative">
            <span className="text-white text-2xl cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              👤
            </span>
            {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-400 rounded-md shadow-lg py-1 z-10">
              <a href="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                Logout
              </a>
              <a href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                Admin
              </a>
              <a href="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                About
              </a>
            </div>
          )}
          </div>
        </div>
      </header>
      <div className="flex-grow w-full overflow-y-auto pt-28 pb-40 px-8" ref={chatContainerRef}>
        <div className="max-w-screen-xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className={`mb-6 ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
              <div
                className={`inline-block p-4 rounded-lg text-lg text-left ${
                  message.type === 'user' ? 'bg-gray-600 text-white user-message' : 'bg-gray-800 text-gray-200'
                }`}
              >
                {parseMessageContent(message)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-dark-charcoal p-8 fixed bottom-0 left-0 right-0">
        <div className="max-w-screen-xl mx-auto flex gap-6">
          <textarea
            className="flex-grow p-4 bg-gray-700 text-white border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={1}
            placeholder="Enter your prompt"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
            required
            ref={textareaRef}
          />
          <button
            type="submit"
            className={`px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-300 ${
              isLoading ? 'bg-red-600 animate-pulse text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
      </form>
      <div
        className={`fixed right-0 top-20 bottom-32 w-80 bg-gray-700 p-6 transition-transform duration-300 ease-in-out transform border-l border-gray-700 ${
          isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Side panel content */}
      </div>
      <button
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-l-md focus:outline-none"
        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
      >
        {isSidePanelOpen ? '>' : '<'}
      </button>
      <ToastContainer />
    </div>
  );
};

export default Chat;