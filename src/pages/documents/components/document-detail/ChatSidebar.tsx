import { API_BASE_URL } from "@/lib/config";
import React, { useState, useRef, useEffect } from "react";
import { Send, X, Plus, Clock } from "lucide-react";
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
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [chatHistory, setChatHistory] = useState<{sessionId: string, lastMessage: string, timestamp: Date}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Create a storage key for this specific document's chat session
  const getStorageKey = (docId: string) => `chat_session_${docId}`;
  const getMessagesKey = (docId: string) => `chat_messages_${docId}`;
  const getHistoryKey = (docId: string) => `chat_history_${docId}`;

  // Load chat history for the current document
  const loadChatHistory = () => {
    const history = JSON.parse(localStorage.getItem(getHistoryKey(documentId)) || '[]');
    setChatHistory(history.map((h: any) => ({
      ...h,
      timestamp: new Date(h.timestamp)
    })));
  };

  // Load a specific chat session from history
  const loadHistorySession = async (historySessionId: string) => {
    setIsLoading(true);

    // Store current session to history if it has messages
    if (sessionId && messages.length > 0 && sessionId !== historySessionId) {
      const lastMessage = messages[messages.length - 1];
      const historyEntry = {
        sessionId: sessionId,
        lastMessage: lastMessage?.content?.substring(0, 50) + '...' || 'Chat session',
        timestamp: new Date()
      };

      const existingHistory = JSON.parse(localStorage.getItem(getHistoryKey(documentId)) || '[]');
      const updatedHistory = [historyEntry, ...existingHistory.filter((h: any) => h.sessionId !== sessionId)].slice(0, 10);
      localStorage.setItem(getHistoryKey(documentId), JSON.stringify(updatedHistory));
      setChatHistory(updatedHistory.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp)
      })));
    }

    // Set the new session
    setSessionId(historySessionId);
    localStorage.setItem(getStorageKey(documentId), historySessionId);

    // Try to load existing messages for this session
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${historySessionId}/history`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.chat_history && Array.isArray(data.chat_history)) {
          const formattedMessages: Message[] = data.chat_history.map((item: any, index: number) => ({
            id: `hist-${index}-${Date.now()}`,
            type: item.role === 'user' ? 'user' : 'bot',
            content: item.content,
            timestamp: new Date(item.timestamp || Date.now()),
            references: item.references || []
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } else {
        // If API call fails, just clear messages
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
    }

    setShowHistoryPopup(false);
    setIsLoading(false);
  };

  const handleNewChat = async (docId?: string) => {
    setIsLoading(true);

    // Store current session to history before creating new one
    if (sessionId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const historyEntry = {
        sessionId: sessionId,
        lastMessage: lastMessage?.content?.substring(0, 50) + '...' || 'Chat session',
        timestamp: new Date()
      };

      const existingHistory = JSON.parse(localStorage.getItem(getHistoryKey(documentId)) || '[]');
      const updatedHistory = [historyEntry, ...existingHistory.filter((h: any) => h.sessionId !== sessionId)].slice(0, 10); // Keep last 10 sessions
      localStorage.setItem(getHistoryKey(documentId), JSON.stringify(updatedHistory));
      setChatHistory(updatedHistory.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp)
      })));
    }

    setMessages([]);
    setInputMessage("");
    setSessionId("");

    // Clear stored session for this document
    localStorage.removeItem(getStorageKey(documentId));
    localStorage.removeItem(getMessagesKey(documentId));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      });
      if (!response.ok) throw new Error('Failed to create new chat session');
      const data = await response.json();
      setSessionId(data.session_id);

      // Store the new session ID
      localStorage.setItem(getStorageKey(documentId), data.session_id);
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

    if (!currentSessionId) {
      // If no session exists, we should ideally wait for it to be created.
      // A robust way is to use the state callback from handleNewChat.
      // For now, this logic might need adjustment if handleNewChat takes time.
      await handleNewChat();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    // Store messages to localStorage
    localStorage.setItem(getMessagesKey(documentId), JSON.stringify(newMessages));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${currentSessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: messageToSend }),
      });

      if (!response.ok) throw new Error('Failed to get response from chatbot');
      if (!response.body) throw new Error('Response body is null');

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

        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, content: botMessageContent, references: botMessageReferences } : msg
          );
          // Store updated messages to localStorage
          localStorage.setItem(getMessagesKey(documentId), JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Error calling chat API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      const updatedMessages = [...messages, errorMessage];
      setMessages(updatedMessages);
      // Store error message to localStorage
      localStorage.setItem(getMessagesKey(documentId), JSON.stringify(updatedMessages));
    } finally {
      setIsLoading(false);
    }
  };





  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load existing session and messages when component mounts or documentId changes
  useEffect(() => {
    if (isOpen && documentId) {
      loadChatHistory();

      const storedSessionId = localStorage.getItem(getStorageKey(documentId));
      const storedMessages = localStorage.getItem(getMessagesKey(documentId));

      if (storedSessionId && storedMessages) {
        // Restore existing session
        setSessionId(storedSessionId);
        try {
          const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Error parsing stored messages:', error);
          // If parsing fails, start new chat
          handleNewChat();
        }
      } else {
        // No existing session, create new one
        handleNewChat();
      }
    }
  }, [isOpen, documentId]);

  // Close history popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Don't close if clicking on the clock button or popup content
      if (!target.closest('.relative')) {
        setShowHistoryPopup(false);
      }
    };

    if (showHistoryPopup) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showHistoryPopup]);

  useEffect(() => {
    if (!isOpen) {
      setInputMessage("");
    }
  }, [isOpen]);

  return (
    <div className="w-full bg-[#FBFBFB] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">Chat Assistant</span>
          <span className="text-xs text-gray-500">{documentId ? `Document ID: ${documentId}` : "No Document Selected"}</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Chat History Button - always show for testing, only show if there are previous chats */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHistoryPopup(!showHistoryPopup);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Chat history"
            >
              <Clock className="w-4 h-4 text-gray-600" />
            </button>

            {/* History Popup */}
            {showHistoryPopup && (
              <div
                className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-700">Previous Chats</span>
                </div>
                {chatHistory.length > 0 ? (
                  chatHistory.map((chat, index) => (
                    <button
                      key={index}
                      onClick={() => loadHistorySession(chat.sessionId)}
                      className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="text-xs text-gray-900 truncate mb-1">{chat.lastMessage}</div>
                      <div className="text-xs text-gray-500 mb-1">
                        Session: {chat.sessionId?.substring(0, 12)}...
                      </div>
                      <div className="text-xs text-gray-400">
                        {chat.timestamp ? new Date(chat.timestamp).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Unknown'}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-gray-500 text-center">
                    No previous chats found
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={() => handleNewChat()} className="p-1 hover:bg-gray-100 rounded transition-colors" title="New chat">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>

          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Close">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center font-poppins italic font-normal text-sm">
            <div>Ask me anything about this document!</div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              {msg.type === "bot" ? (
                <div className="flex items-start space-x-2">
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
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="p-3 bg-white rounded-lg shadow text-sm text-[#333333]">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
