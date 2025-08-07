import { API_BASE_URL } from "@/lib/config";
import React, { useState, useRef, useEffect } from "react";
import { Send, X, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
}

export default function ChatSidebar({ isOpen, onClose, documentId, documentName }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate(); // Hook for navigation

  const quickQuestions = [
    "Summarize this document",
    "What are the key points?",
    "What are the compliance requirements?",
    "When does this take effect?",
  ];

  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (messageToSend.trim() === "" || isLoading) return;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setSessionId(currentSessionId);
    }

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: messageToSend,
          mode: "single",
          document_id: parseInt(documentId, 10)
        }),
      });

      if (!response.ok) throw new Error('Failed to get response from chatbot');

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Error calling chat API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I encountered an error. Please try again.",
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setSessionId("");
      setInputMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Main container uses flex-col to structure header, content, and footer
    <div className="w-80 bg-[#FBFBFB] border-l border-gray-200 flex flex-col h-full">
      {/* Header - flex-shrink-0 prevents it from shrinking */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <span className="text-sm font-medium text-gray-700">Chat Section</span>
        <div className="flex items-center space-x-2">
            {/* NEW: Icon to navigate to the main chatbot page */}
            <button
                onClick={() => navigate('/chatbot')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Open in full view"
            >
                <ExternalLink className="h-4 w-4 text-gray-500" />
            </button>
            <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Close"
            >
                <X className="h-4 w-4 text-gray-500" />
            </button>
        </div>
      </div>

      {/* Messages Area - flex-1 allows it to grow and overflow-y-auto makes it scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center font-poppins italic font-normal text-sm">
            <div>Ask me anything about this document!</div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              {msg.type === "bot" ? (
                <div className="flex items-start space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575] flex-shrink-0">AI</div>
                  <div className="max-w-full p-3 bg-white rounded-lg shadow text-sm text-[#333333] prose prose-sm whitespace-pre-wrap"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                </div>
              ) : (
                <div className="flex items-start space-x-2 justify-end">
                  <div className="max-w-full p-3 bg-[#1F4A75] text-white font-poppins rounded-lg shadow text-sm whitespace-pre-line"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                  <img src="/analyst.png" alt="user" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575] flex-shrink-0">AI</div>
              <div className="p-3 bg-white rounded-lg shadow text-sm text-[#333333]">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer (Input Area) - flex-shrink-0 prevents it from shrinking */}
      <div className="border-t bg-[#FBFBFB] px-4 py-3 flex-shrink-0">
        {messages.length === 0 && (
          <div className="grid grid-cols-1 gap-2 w-full mb-3">
            {quickQuestions.map((question, index) => (
              <button key={index} onClick={() => handleQuickQuestionClick(question)} className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-poppins text-gray-700 hover:text-blue-700 transition-all duration-200 text-left" disabled={isLoading}>
                {question}
              </button>
            ))}
          </div>
        )}
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask any questions..."
            rows={1}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent resize-none text-sm"
            style={{ minHeight: "40px" }}
            onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            disabled={isLoading}
          />
          <button onClick={() => handleSendMessage()} className="absolute right-2 bottom-2 text-[#1976D2] hover:text-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed p-1" disabled={isLoading || inputMessage.trim() === ""}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
