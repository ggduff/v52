import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GrayUserIcon, GreenUserIcon } from './HeroIcons';
import FileUploadModal from './FileUploadModal';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.maxHeight = '120px'; // Set the maximum height to 10 lines (assuming line height of 12px)
    }
  };

  const openFileUploadModal = () => {
    setIsFileUploadModalOpen(true);
  };

  const closeFileUploadModal = () => {
    setIsFileUploadModalOpen(false);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
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
          <div key={match.index} className="code-container relative max-w-full overflow-auto">
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
            <span className="text-green-300 text-xl mr-4">🌐 v51</span>
            <span className="text-2xl font-bold text-gray-300">HugeThink</span>
          </div>
          <div className="relative">
            <span className="text-white text-2xl cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <GreenUserIcon />
            </span>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-500 rounded-md shadow-lg py-1 z-10">
                <a href="/logout" className="block px-4 py-2 text-sm text-gray-800 hover:bg-green-600">
                  Logout
                </a>
                <a href="/admin" className="block px-4 py-2 text-sm text-gray-800 hover:bg-green-600">
                  Admin
                </a>
                <a href="/about" className="block px-4 py-2 text-sm text-gray-800 hover:bg-green-600">
                  Settings
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex-grow w-full overflow-n-auto pt-28 pb-40 px-8" ref={chatContainerRef}>
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
        <button
          className="scroll-to-bottom-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          title="Scroll to latest message"
        >
          ⬇️
        </button>
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
        className={`fixed right-0 top-0 bottom-0 w-80 bg-dark-charcoal p-6 transition-transform duration-300 ease-in-out transform border-l border-gray-700 z-20 ${
          isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full bg-gray-700 text-white p-2 rounded-l-md focus:outline-none"
          onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
        >
          {isSidePanelOpen ? '>' : '<'}
        </button>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Application Status</h3>
          <div className="bg-gray-800 p-4 rounded-md">
            <p className="text-gray-300">Mon, 25 Mar 2024</p>
            <p className="text-gray-300"><span className="text-gray-400">15:59:53 UTC</span></p>
            <p className="text-gray-300">v51 Status: <span className="text-green-400">Active</span></p>
            <p className="text-gray-300">Uptime: <span className="text-gray-400">2h 30m</span></p>
            
            
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Performance Information</h3>
          <div className="bg-gray-800 p-4 rounded-md">
            <p className="text-gray-300">Avg CPU Usage: <span className="text-gray-400">25%</span></p>
            <p className="text-gray-300">Avg GPU Usage: <span className="text-gray-400">19.2 TFLOPS</span></p>
            <p className="text-gray-300">Memory Usage: <span className="text-gray-400">1.2 GB</span></p>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Advanced Prompt Settings</h3>
          <div className="bg-gray-800 p-4 rounded-md">
            <div className="flex items-center">
              <input type="checkbox" id="enhancedMode" className="mr-2" />
              <label htmlFor="enhancedMode" className="text-gray-300">Enhanced Mode</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="code" className="mr-2" />
              <label htmlFor="code" className="text-gray-300">Code Emphasis</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="temperature" className="mr-2" />
              <label htmlFor="temperature" className="text-gray-300">Temperature</label>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Live Connections</h3>
          <div className="bg-gray-800 p-4 rounded-md">
            <div className="flex items-center">
              <input type="checkbox" id="freshdesk" className="mr-2" />
              <label htmlFor="freshdesk" className="text-gray-300">Freshdesk</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="whmcs" className="mr-2" />
              <label htmlFor="whmcs" className="text-gray-300">WHMCS</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="brokerpanel" className="mr-2" />
              <label htmlFor="brokerpanel" className="text-gray-300">Broker Panel</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="solus" className="mr-2" />
              <label htmlFor="solus" className="text-gray-300">Solus VM</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="openstack" className="mr-2" />
              <label htmlFor="openstack" className="text-gray-300">Openstack</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="github" className="mr-2" />
              <label htmlFor="github" className="text-gray-300">Github</label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Session Assistants</h3>
          <div className="bg-gray-800 p-4 rounded-md">
            <div className="flex items-center">
              <input type="checkbox" id="customerAssistant" className="mr-2" />
              <label htmlFor="customerAssistant" className="text-gray-300">Support Assistant</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="customerAssistant" className="mr-2" />
              <label htmlFor="customerAssistant" className="text-gray-300">Marketing Assistant</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="infraAssistant" className="mr-2" />
              <label htmlFor="infraAssistant" className="text-gray-300">Infra Assistant</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="codeAssistant" className="mr-2" />
              <label htmlFor="codeAssistant" className="text-gray-300">Dev/Code Assistant</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="accountingAssistant" className="mr-2" />
              <label htmlFor="accountingAssistant" className="text-gray-300">Accounting Assistant</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="reportsAssistant" className="mr-2" />
              <label htmlFor="reportsAssistant" className="text-gray-300">Reports Assistant</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="strategyAssistant" className="mr-2" />
              <label htmlFor="strategyAssistant" className="text-gray-300">Strategy Assistant</label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Context Documents</h3>
          <div className="bg-gray-800 p-4 rounded-md">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={openFileUploadModal}
            >
              Manage Files
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Model Tuning</h3>
          <div className="bg-gray-800 p-4 rounded-md">
            <nav>
              <ul className="space-y-2">
                <li className="hover:bg-blue-700">
                  <a href="#" className="block px-4 py-2 bg-gray-600 text-white rounded-md hover:text-gray-200">Persona Tuning</a>
                </li>
                <li className="hover:bg-blue-700">
                  <a href="#" className="block px-4 py-2 bg-gray-600 text-white rounded-md hover:text-gray-200">Support Model</a>
                </li>
                <li className="hover:bg-blue-700">
                  <a href="#" className="block px-4 py-2 bg-gray-600 text-white rounded-md hover:text-gray-200">Infra Model</a>
                </li>
                <li className="hover:bg-blue-700">
                  <a href="#" className="block px-4 py-2 bg-gray-600 text-white rounded-md hover:text-gray-200">Marketing Model</a>
                </li>
                <li className="hover:bg-blue-700">
                  <a href="#" className="block px-4 py-2 bg-gray-600 text-white rounded-md hover:text-gray-200">Code Model</a>
                </li>
                <li className="hover:bg-blue-700">
                  <a href="#" className="block px-4 py-2 bg-gray-600 text-white rounded-md hover:text-gray-200">Forex Model</a>
                </li>
                <li className="hover:bg-orange-300">
                  <a href="#" className="block px-4 py-2 bg-orange-500 text-black rounded-md hover:text-gray-800">v51 System Model</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>    

      <FileUploadModal isOpen={isFileUploadModalOpen} onClose={closeFileUploadModal} />
      <ToastContainer />
    </div>
  );
};

export default Chat;