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

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    "What are the latest guidelines on KYC?",
    "What are the current interest rate policies or repo rate?",
    "What are the rules for foreign exchange transactions?",
    "Are there any recent updates related to UPI?",
  ];

  // ==================================================================
  // TESTING VERSION of handleSendMessage
  // This function will now always respond with a table for testing purposes.
  // ==================================================================
  const handleSendMessage = (message?: string) => {
    const messageToSend = message || inputMessage;
    if (messageToSend.trim() === "") return;

    // 1. Add the user's message to the chat as normal
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    // 2. This is the sample table string, as if it came from an LLM
    const llmTableResponse = `
Here is the data you requested in a table format:

| Feature        | Status      | Priority |
|:---------------|:-----------:|---------:|
| User Login     | Implemented |     High |
| Chat History   | In Progress |   Medium |
| File Uploads   |   Planned   |      Low |

Let me know if you need more details.
`;

    // 3. We create a bot message with the table content
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: llmTableResponse, // The content is our table string
      timestamp: new Date(),
    };

    // 4. Add BOTH the user's message and the bot's table response to the state
    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInputMessage("");
  };

  const handleQuickQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  // HOOK #1: Sets a simple initial welcome message (runs only once).
  useEffect(() => {
    setMessages([
      {
        id: "initial-welcome",
        type: "bot",
        content: "Welcome to the chatbot! Ask me anything, or type 'test' to see a sample table.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // HOOK #2: Scrolls to the latest message whenever the messages array changes.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col bg-[#FBFBFB]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.type === "bot" ? (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#EEEEEE] flex items-center justify-center text-s font-bold text-[#767575]">
                      AI
                    </div>
                    <div className="max-w-xl p-4 bg-white rounded-lg shadow text-sm text-[#333333] prose prose-sm whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <div className="max-w-xl p-4 bg-[#1F4A75] text-white font-poppins rounded-lg shadow text-sm whitespace-pre-line">
                      {msg.content}
                    </div>
                    <img
                      src="/analyst.png"
                      alt="user"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-6 pb-3">
              <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestionClick(question)}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-poppins text-gray-700 hover:text-blue-700 transition-all duration-200 text-left"
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
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="absolute right-3 bottom-5 text-[#1976D2] hover:text-[#1565C0]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 space-y-3">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
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
              <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
                Previous chat example...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}