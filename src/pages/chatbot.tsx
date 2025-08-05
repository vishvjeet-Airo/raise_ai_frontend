import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, Search } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    "What are the latest guidelines on KYC?",
    "What are the current interest rate policies or repo rate?",
    "What are the rules for foreign exchange transactions?",
    "Are there any recent updates related to UPI?",
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
          mode: "all"
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

  const handleNewChat = () => {
    setMessages([]);
    setSessionId("");
    setInputMessage("");
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col bg-[#FBFBFB]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-center font-poppins italic font-normal">
                <div>
                  Welcome to the chatbot! <br />
                  Ask me anything about the documents.
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.type === "bot" ? (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575]">
                        AI
                      </div>
                      <div className="max-w-xl p-4 bg-white rounded-lg shadow text-sm text-[#333333] prose prose-sm whitespace-pre-wrap">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <div className="max-w-xl p-4 bg-[#1F4A75] text-white font-poppins rounded-lg shadow text-sm whitespace-pre-line">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                      <img
                        src="/analyst.png"
                        alt="user"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575]">
                    AI
                  </div>
                  <div className="max-w-xl p-4 bg-white rounded-lg shadow text-sm text-[#333333]">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-gray-500 text-xs">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="px-6 pb-3">
              <div className="grid grid-cols-2 gap-2 w-full">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestionClick(question)}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-poppins text-gray-700 hover:text-blue-700 transition-all duration-200 text-left"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t bg-[#FBFBFB] px-6 py-4">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask any questions about the documents"
                  rows={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent resize-none"
                  style={{ minHeight: "48px" }}
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
                  className="absolute right-3 bottom-3 text-[#1976D2] hover:text-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || inputMessage.trim() === ""}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 space-y-3">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
              <span className="font-poppins font-medium text-sm text-gray-700">New chat</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
              <span className="font-poppins font-medium text-sm text-gray-700">Search chats</span>
            </button>
          </div>
          <div className="flex-1 px-4">
            <h3 className="font-poppins font-medium text-sm text-gray-500 mb-3">Chats</h3>
            <div className="space-y-2">
              {sessionId && (
                <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded cursor-pointer">
                  Current: {sessionId.substring(0, 20)}...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}