import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare, Send, X } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (message) => {
      const response = await axios.post(
        'http://localhost:5000/api/chat',
        { message },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      const botMessage = { 
        text: data.response, 
        sender: 'bot',
        isFallback: data.is_fallback,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: () => {
      setMessages(prev => [...prev, { 
        text: "Connection error. Please message us on WhatsApp at +94760848706", 
        sender: 'bot',
        isFallback: true,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = { 
      text: inputMessage, 
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    sendMessage(inputMessage);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setMessages([]), 300);
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/94760848706`, '_blank');
  };

  // Auto-scroll and initial message
  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ 
        text: "Hi there! 😊 I'm MindCare Assistant. You can ask me about:\n\n" +
              "- Depression symptoms\n- Anxiety management\n- Therapy options\n- Emergency contacts\n\n" +
              "Or just say hello!",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-4 right-4 bg-[#667449] text-white p-3 rounded-full shadow-lg hover:bg-[#667449] transition" size="icon">
          <MessageSquare size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full bg-white sm:max-w-md flex flex-col p-0">
        <SheetHeader className="border-b p-4 bg-blue-50">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-lg font-semibold text-[#667449]">MindCare Assistant</SheetTitle>
            <Button onClick={handleClose} variant="ghost" size="icon" className="text-[#667449] hover:bg-blue-100">
              <X size={20} />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg relative ${
                message.sender === 'user' 
                  ? 'bg-[#667449] text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <div className="whitespace-pre-line">{message.text}</div>
                {message.isFallback && (
                  <button 
                    onClick={openWhatsApp}
                    className="mt-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
                  >
                    <span>Chat on WhatsApp</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                )}
                <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          
          {isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <SheetFooter className="p-4 border-t bg-white">
          <div className="flex w-full items-center space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isPending && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isPending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isPending || !inputMessage.trim()} 
              size="icon"
              className="bg-[#667449] hover:bg-lime-700"
            >
              <Send size={18} />
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Chatbot;