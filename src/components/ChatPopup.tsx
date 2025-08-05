import React, { useState, useRef, useEffect } from "react";
import { Send, X, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ChatPopup({ isOpen, onClose, documentId, documentName }: ChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    "Summarize this document",
    "What are the key points?",
    "What are the compliance requirements?",
    "When does this take effect?",
  ];

  // Generate a new session ID for new conversations
  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (messageToSend.trim() === "" || isLoading) return;

    // Generate session ID if it's a new conversation
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setSessionId(currentSessionId);
    }

    // Add user message immediately to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: messageToSend,
          mode: "single",
          document_id: documentId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      // Add bot response to UI
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Error calling chat API:', error);
      
      // Add error message to UI
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear messages when popup opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setSessionId("");
      setInputMessage("");
      setIsMinimized(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#1F4A75] text-white rounded-t-lg">
        <div className="flex-1">
          <h3 className="text-sm font-medium truncate">Chat - {documentName}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-[#FBFBFB]">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-center text-sm">
                <div>
                  Ask me anything about this document!
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.type === "bot" ? (
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <div className="w-6 h-6 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575]">
                        AI
                      </div>
                      <div className="p-3 bg-white rounded-lg shadow text-xs text-[#333333] prose prose-xs">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <div className="p-3 bg-[#1F4A75] text-white rounded-lg shadow text-xs">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                      <img
                        src="/analyst.png"
                        alt="user"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575]">
                    AI
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow text-xs text-[#333333]">
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-gray-500 text-xs ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 0 && (
            <div className="p-3 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-1">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestionClick(question)}
                    className="px-2 py-1 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded text-xs text-gray-700 hover:text-blue-700 transition-all duration-200 text-left"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t bg-white p-3 rounded-b-lg">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about this document..."
                  rows={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1976D2] focus:border-transparent resize-none text-sm"
                  style={{ minHeight: "32px" }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="absolute right-2 bottom-2 text-[#1976D2] hover:text-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || inputMessage.trim() === ""}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}