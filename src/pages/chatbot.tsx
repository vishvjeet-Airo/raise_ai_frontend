import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

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
    "What are the latest guidelines on KYC (Know Your Customer)?",
    "What are the current interest rate policies or repo rate?",
    "What are the rules for foreign exchange transactions (Forex)?",
    "Are there any recent updates related to digital payments or UPI?",
    "What are the regulations on loan restructuring or moratorium?",
    "What are the capital adequacy requirements for banks?",
    "Is there any policy on cryptocurrency or virtual digital assets?"
  ];

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-1 overflow-hidden gap-x-[12px] bg-white">

          {/* Chat Area Column */}
          <div className="flex-1 flex flex-col bg-[#FBFBFB] ml-3 mt-3 mb-3 rounded-md">

            {/* Messages Display Area */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-6">
  {messages.length === 0 ? (
    <div className="flex items-center justify-center h-full text-gray-500 text-center font-poppins italic font-normal">
      <div>
        Welcome to the chatbot! <br />
        Feel free to ask any questions regarding the documents.
      </div>
    </div>
  ) : (
    messages.map((msg, index) => (
      <div
        key={index}
        className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
      >
        {/* Avatar */}
        {msg.type === "bot" ? (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#EEEEEE] flex items-center justify-center text-xs font-semibold text-[#767575]">
              AI
            </div>
            <div className="max-w-xl p-4 bg-white rounded-lg shadow text-sm text-[#333333] whitespace-pre-line">
              {msg.content}
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
    ))
  )}
</div>

            {/* Input Area */}
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
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-3 bottom-3 text-[#1976D2] hover:text-[#1565C0]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Questions Panel */}
          <div className="w-72 bg-[#FBFBFB] flex-shrink-0 flex flex-col mr-3 mb-3 mt-3 rounded-md">
            <div className="px-4 bg-white flex items-center flex-shrink-0" style={{ height: "71px" }}>
              <h3 style={{ font: "poppins", fontWeight: 500, fontSize: "16px", color: "#767575", lineHeight: "100%" }}>
                Quick Questions
              </h3>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="w-full h-14 px-4 py-3 flex items-center justify-start text-left bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 font-poppins font-normal text-[13px] leading-[20px] text-[#767575]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
