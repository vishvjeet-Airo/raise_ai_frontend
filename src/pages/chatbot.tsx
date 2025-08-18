import { API_BASE_URL } from "@/lib/config";
import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, Search, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';



interface Reference {
  document_id: string;
  file_name: string;
  title: string;
  blob_url?: string;
}

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

interface ChatSession {
  session_id: string;
  document_id?: string;
  chat_history: any[]; 
}


export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchChatSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/no-document`);
      if (!response.ok) throw new Error('Failed to fetch chat sessions');
      const sessions = await response.json();
      setChatSessions(sessions || []);
      return sessions;
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      setChatSessions([]);
      return [];
    }

  };

  const handleNewChat = async (docId?: string) => {
    setIsLoading(true);
    setMessages([]);
    setInputMessage("");
    setSessionId("");
    setDocumentId(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: docId ? JSON.stringify({ document_id: docId }) : undefined,
      });

      if (!response.ok) throw new Error('Failed to create new chat session');

      const data = await response.json();
      setSessionId(data.session_id);
      setDocumentId(data.document_id || null);
      await fetchChatSessions(); 
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

  const handleDeleteChat = async (sessionIdToDelete: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/${sessionIdToDelete}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete chat session');
        }

        const remainingSessions = await fetchChatSessions();

        if (sessionId === sessionIdToDelete) {
            if (remainingSessions.length > 0) {
                loadChatHistory(remainingSessions[0].session_id);
            } else {
                handleNewChat();
            }
        }
    } catch (error) {
        console.error("Error deleting chat:", error);
    }
  };

  const loadChatHistory = (sessionIdToLoad: string) => {
    const session = chatSessions.find(s => s.session_id === sessionIdToLoad);
    if (!session) {
        fetchHistoryForSession(sessionIdToLoad);
        return;
    }

    if (Array.isArray(session.chat_history)) {
        const formattedMessages: Message[] = session.chat_history.map((item: any, index: number) => ({
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

    setSessionId(session.session_id);
    setDocumentId(session.document_id || null);
  };

  const fetchHistoryForSession = async (sessionIdToLoad: string) => {
      setIsLoading(true);
      try {
          const response = await fetch(`${API_BASE_URL}/api/chat/${sessionIdToLoad}/history`);
          if (!response.ok) {
              throw new Error(`Failed to fetch chat history for session ${sessionIdToLoad}`);
          }
          const history = await response.json();
          
          if (Array.isArray(history)) {
              const formattedMessages: Message[] = history.map((item: any, index: number) => ({
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
          setSessionId(sessionIdToLoad);
          const sessionDetails = chatSessions.find(s => s.session_id === sessionIdToLoad);
          if (sessionDetails) {
              setDocumentId(sessionDetails.document_id || null);
          }

      } catch (error) {
          console.error('Error loading chat history:', error);
          await handleNewChat();
      } finally {
          setIsLoading(false);
      }

  };

  


  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (messageToSend.trim() === "" || isLoading) return;

    const currentSessionId = sessionId;

    if (!currentSessionId) {
      console.error("No session ID found. Cannot send message.");
      const errorMessage: Message = {
          id: 'error-no-session',
          type: 'bot',
          content: 'There is no active chat session. Please start a new chat.',
          timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
        
        // Split chunk by newlines to handle multiple JSON objects in one chunk
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
      await fetchChatSessions();

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


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const sid = urlParams.get('session_id');
        const docId = urlParams.get('document_id');
        
        const sessions = await fetchChatSessions();

        if (sid) {
            loadChatHistory(sid);
        } else if (docId) {
            await handleNewChat(docId);
        } else if (sessions && sessions.length > 0) {
            loadChatHistory(sessions[0].session_id);
        } else {
            await handleNewChat();
        }
    };

    initializeChat();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col bg-[#FBFBFB]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {messages.length === 0 && !isLoading ? (
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
                        {isLoading && messages[messages.length - 1].id === msg.id ? <div className="loader"></div> : "AI"}
                      </div>
                      {/* Change made here: Removed `prose prose-sm` classes */}
                      <div className="max-w-xl p-4 bg-white rounded-lg shadow text-sm text-[#333333] whitespace-pre-wrap">
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
            
            {isLoading && messages.length > 0 && messages[messages.length -1].type === 'user' && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575]">
                    AI
                  </div>
                  <div className="max-w-xl p-4 bg-white rounded-lg shadow text-sm text-[#333333]">
                    <div className="loader"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && !isLoading && (
            <div className="px-6 pb-3">
              <div className="grid grid-cols-2 gap-2 w-full">
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
                  disabled={isLoading || !sessionId}
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="absolute right-3 bottom-3 text-[#1976D2] hover:text-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !sessionId || inputMessage.trim() === ""}
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
              onClick={() => handleNewChat()}
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
          <div className="flex-1 px-4 overflow-y-auto">
            <h3 className="font-poppins font-medium text-sm text-gray-500 mb-3">Chats</h3>
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <div 
                  key={session.session_id}
                  className={`group flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer ${sessionId === session.session_id ? 'bg-blue-100 text-blue-800' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'}`}>
                  <span onClick={() => loadChatHistory(session.session_id)} className="flex-grow">
                    Chat - {session.session_id.substring(0, 8)}...
                    {session.document_id && <span className="text-xs text-gray-500 ml-2">(Doc: {session.document_id})</span>}
                  </span>
                  <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteChat(session.session_id); 
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-2 p-1">
                      <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

