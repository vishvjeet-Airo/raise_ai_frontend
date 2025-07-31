import React, { useState } from "react";
import { Send, MoreHorizontal, Plus, ChevronDown, ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";


export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  
  const [inputMessage, setInputMessage] = useState("");

  const quickQuestions = [
    "How has FPI regulation evolved over 3 years?",
    "Compare investment strategies across documents", 
    "What are scenario-based risk projections?",
    "Cross-document compliance gap analysis",
    "Build 12-month implementation roadmap",
    "What is the main purpose of this circular?",
    "Which previous circulars are referenced?"
  ];

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputMessage,
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-1 overflow-hidden gap-x-[12px] bg-white">
          {/* Chat Area Column */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <span className="font-medium" style={{ font: 'poppins', fontSize: '15px', lineHeight: '100%', color: '#767575' }}>Documents Name:</span>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center" style={{ width: '154px', height: '38px', font:'montserrat', fontWeight: 500, fontSize: '14px', lineHeight: '100%', color: '#1F4A75' }}>
                  Add Documents
                </button>
                <div className="relative">
                  <button className="bg-[#1F4A75] text-white rounded-lg hover:bg-[#1a3f66] transition-colors flex items-center justify-center space-x-2" style={{ width: '114px', height: '38px', font:'montserrat', fontWeight: 500, fontSize: '14px', lineHeight: '100%' }}>
                    <span>Action</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Info */}
            <div className="bg-[#FBFBFB] px-6 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Active Documents</span>
                  
                </div>
                <button className="px-3 py-1 bg-[#1F4A75] text-white rounded hover:bg-[#1a3f66] transition-colors" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '20px' }}>
                  + Add Documents
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
              {/* Messages will be rendered here */}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-end space-x-4">
                <button className="text-gray-400 hover:text-gray-600 mb-3">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask any questions about your documents"
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent resize-none"
                    style={{ minHeight: '48px' }}
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
          <div className="w-72 bg-[#FBFBFB] flex-shrink-0 flex flex-col mr-3">
            <div className="px-4 bg-white flex items-center flex-shrink-0" style={{ height: '71px' }}>
                <h3 style={{ font: 'poppins', fontWeight: 500, fontSize: '16px', color: '#767575', lineHeight: '100%' }}>Quick Questions</h3>
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
