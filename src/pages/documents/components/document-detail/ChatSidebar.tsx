import { API_BASE_URL } from "@/lib/config";
import React, { useState, useRef, useEffect } from "react";
import { Send, X, ExternalLink, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { useNavigate } from "react-router-dom";

interface Reference {
  document_id: string;
  file_name: string;
  title: string;
  blob_url?: string;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  references?: Reference[];
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
  const navigate = useNavigate();

  const quickQuestions = [
    "Summarize this document",
    "What are the key points?",
    "What are the compliance requirements?",
    "When does this take effect?",
  ];

  const handleNewChat = async (docId?: string) => {
    setIsLoading(true);
    setMessages([]);
    setInputMessage("");
    setSessionId("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      });

      if (!response.ok) throw new Error('Failed to create new chat session');

      const data = await response.json();
      setSessionId(data.session_id);
    } catch (error) {
      console.error('Error creating new chat:', error);
      const errorMessage: Message = {
        id: 'error-new-chat',
        type: 'bot',
        content: 'Sorry, I was unable to start a new chat. Please try again.',
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (messageToSend.trim() === "" || isLoading) return;

    let currentSessionId = sessionId;

    // If no session exists, create one first
    if (!currentSessionId) {
      await handleNewChat();
      // After creating new session, we need to wait for it to complete
      return;
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
      const response = await fetch(`${API_BASE_URL}/api/chat/${currentSessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: messageToSend }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessageContent = "";
      let botMessageReferences: Reference[] = [];
      const botMessageId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          type: 'bot',
          content: '',
          timestamp: new Date(),
          references: []
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        const jsonStrings = chunk.split(/\r?\n/).filter(s => s.trim() !== '');

        for (const jsonString of jsonStrings) {
            try {
                const parsed = JSON.parse(jsonString);
                if (parsed.type === "chunk") {
                    botMessageContent += parsed.content;
                } else if (parsed.type === "references") {
                    botMessageReferences = parsed.data;
                }
            } catch (parseError) {
                console.warn("Failed to parse JSON chunk:", jsonString, parseError);
            }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, content: botMessageContent, references: botMessageReferences } : msg
          )
        );
      }

    } catch (error) {
      console.error('Error calling chat API:', error);
      
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

  const handleNavigateToFullChat = () => {
    if (sessionId) {
      navigate(`/chatbot?session_id=${sessionId}`);
    } else {
      navigate(`/chatbot`);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !sessionId) {
      handleNewChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setSessionId("");
      setInputMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-[#FBFBFB] border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">Chat Assistant</span>
          <span className="text-xs text-gray-500">{documentId ? `Document ID: ${documentId}` : "No Document Selected"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleNewChat()}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="New chat"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleNavigateToFullChat}
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center font-poppins italic font-normal text-sm">
            <div>Ask me anything!</div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              {msg.type === "bot" ? (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575] flex-shrink-0">AI</div>
                  <div className="max-w-full p-3 bg-white rounded-lg shadow text-sm text-[#333333] prose prose-sm whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    {msg.references && msg.references.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                            <strong>References:</strong>
                            <ul className="list-disc list-inside">
                                {msg.references.map((ref, refIndex) => (
                                    <li key={refIndex}>
                                        {ref.blob_url ? (
                                            <a href={ref.blob_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {ref.title}
                                            </a>
                                        ) : (
                                            ref.title
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-2 justify-end">
                  <div className="max-w-full p-3 bg-[#1F4A75] text-white font-poppins rounded-lg shadow text-sm whitespace-pre-line">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                  <img src="/analyst.png" alt="user" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575] flex-shrink-0">AI</div>
              <div className="p-3 bg-white rounded-lg shadow text-sm text-[#333333]">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-gray-500 text-xs ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer (Input Area) */}
      <div className="border-t bg-[#FBFBFB] px-4 py-3 flex-shrink-0">
        {messages.length === 0 && !isLoading && (
          <div className="grid grid-cols-1 gap-2 w-full mb-3">
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
        )}
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask any questions..."
            rows={1}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent resize-none text-sm"
            style={{ minHeight: "40px" }}
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
            className="absolute right-2 bottom-2 text-[#1976D2] hover:text-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed p-1" 
            disabled={isLoading || inputMessage.trim() === ""}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}