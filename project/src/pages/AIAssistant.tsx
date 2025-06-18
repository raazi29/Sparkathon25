import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Loader,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, Product } from '../types';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: "Hi there! I'm ARIA, your upgraded AI shopping assistant. I can now search a live product inventory and understand you better with advanced voice recognition. How can I help?",
      timestamp: new Date(),
      suggestions: [
        "Show me what's popular",
        "I need a gift for a friend",
        "Find me some jewelry"
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [currentOccasion, setCurrentOccasion] = useState<string | null>(null);
  const [currentBudget, setCurrentBudget] = useState<{ min: number; max: number } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setSpeechSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateMessageId = () => `msg_${Date.now()}`;

  const sendMessageToBackend = useCallback(async (message: string) => {
    setIsTyping(true);
    try {
      const payload = {
        message,
        mood: currentMood,
        occasion: currentOccasion,
        budget: currentBudget,
      };

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const botMessage: ChatMessageType = {
        id: data.id || generateMessageId(),
        type: 'bot',
        content: data.content,
        timestamp: new Date(data.timestamp),
        products: data.products,
        suggestions: data.suggestions,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting to my services. Please check if the backend is running and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [currentBudget, currentMood, currentOccasion]);

  const handleSendMessage = useCallback((messageText?: string) => {
    const message = (messageText || inputMessage || '').trim();
    if (!message) return;

    if (isListening) {
      mediaRecorderRef.current?.stop();
    }

    const newUserMessage: ChatMessageType = {
      id: generateMessageId(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    sendMessageToBackend(message);
  }, [inputMessage, isListening, sendMessageToBackend]);

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTyping(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('http://localhost:8000/api/transcribe', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      if(data.transcript) {
        handleSendMessage(data.transcript);
      } else {
        throw new Error("Empty transcript returned.");
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        type: 'bot',
        content: "Sorry, I couldn't understand that. Please try speaking again or type your message.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = async () => {
    if (!speechSupported || isListening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          transcribeAudio(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please grant permission and try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleVoiceInput = () => {
    isListening ? stopListening() : startListening();
  };

  const renderMessageContent = (message: ChatMessageType) => (
    <div className="space-y-4">
      <div className="whitespace-pre-wrap">{message.content}</div>
      {message.products && message.products.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {message.products.map((product: Product) => (
            <div
              key={product.id}
              className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 flex flex-col hover:shadow-cyan-500/20 hover:shadow-lg"
            >
              <div className="aspect-w-1 aspect-h-1 bg-gray-900 flex-shrink-0 p-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-sm font-medium text-white flex-grow min-h-[40px]">{product.title}</h3>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-yellow-400 text-xs">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className={i < Math.round(product.rating.rate) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                    ))}
                    <span className="ml-2 text-gray-400">({product.rating.count} reviews)</span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-2xl font-bold text-white">${product.price.toFixed(2)}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => alert(`Added ${product.title} to cart!`)}
                      className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      title="Add to cart"
                    >
                      <ShoppingBag size={18} />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                      title="Save for later"
                    >
                      <Heart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {message.suggestions && message.suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {message.suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(suggestion)}
              className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-cyan-300 rounded-full text-sm transition-all border border-gray-700/50 hover:border-cyan-500/30"
              title={`Suggest: ${suggestion}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <div className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800/50 py-3 px-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-white tracking-wide">AI Shopping Assistant</h1>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-green-400">Live</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] lg:max-w-[75%] ${message.type === 'user' ? 'bg-cyan-900/40' : 'bg-gray-800/40'} rounded-2xl px-5 py-4 backdrop-blur-md border ${message.type === 'user' ? 'border-cyan-800/30' : 'border-gray-700/30'}`}>
                    {renderMessageContent(message)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center space-x-3"
            >
              <Loader className="animate-spin text-cyan-400" size={18} />
              <span className="text-sm text-gray-400">ARIA is thinking...</span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-black/95 backdrop-blur-xl border-t border-gray-800/50 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask for products, style advice, or anything else..."
                className="w-full bg-gray-900/80 text-white placeholder-gray-500 rounded-2xl py-3 px-4 pr-14 resize-none border border-gray-700/50 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all focus:outline-none"
                rows={1}
                aria-label="Chat input"
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                {speechSupported && (
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-full transition-colors ${
                      isListening
                        ? 'text-red-400 bg-red-500/20 animate-pulse'
                        : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                    }`}
                    title={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 