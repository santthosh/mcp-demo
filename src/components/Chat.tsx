'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, TextInput, Button, Avatar } from 'flowbite-react';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful assistant for booking appointments. Keep responses concise and focused on gathering necessary information for appointment booking.' },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content || 'Sorry, I could not process your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto p-4">
      <Card className="flex-1 mb-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-16rem)]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-8 h-8 flex-none">
                <Avatar
                  className="w-full h-full rounded-full"
                  img={message.role === 'user' ? undefined : 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'}
                  status={message.role === 'user' ? 'online' : undefined}
                />
              </div>
              <div className={`flex flex-col min-w-[160px] max-w-[320px] leading-1.5 p-3 border-gray-200 ${
                message.role === 'user'
                  ? 'bg-gray-100 text-gray-900 rounded-s-xl rounded-ee-xl'
                  : 'bg-blue-600 text-white rounded-e-xl rounded-es-xl'
              }`}>
                <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
                  <span className="text-sm font-semibold">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className={`text-xs ${message.role === 'user' ? 'text-gray-500' : 'text-blue-100'}`}>
                    {format(message.timestamp, 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm font-normal py-1.5 whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 flex-none">
                <Avatar
                  className="w-full h-full rounded-full"
                  img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                />
              </div>
              <div className="flex flex-col min-w-[160px] max-w-[320px] leading-1.5 p-3 border-gray-200 bg-blue-600 text-white rounded-e-xl rounded-es-xl">
                <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
                  <span className="text-sm font-semibold">Assistant</span>
                </div>
                <div className="flex space-x-1 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-200 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-200 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-200 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      <div className="flex items-center bg-white rounded-lg shadow-lg h-16 px-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <HiOutlineChatAlt2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
} 