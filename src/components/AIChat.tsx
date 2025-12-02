'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  prompt?: string;
  placeholder?: string;
  className?: string;
  blogTitle?: string;
  isChatOpen?: boolean;
  onChatToggle?: (isOpen: boolean) => void;
  blogId?: string;
  courseId?: string;
  chapterTopicId?: string;
}

// Code Block Component with Copy Functionality
function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
        <span className="text-xs text-gray-300 uppercase font-medium">{language}</span>
        <button
          onClick={copyToClipboard}
          className="cursor-pointer flex items-center gap-1 text-xs text-gray-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function AIChat({ 
  prompt = "You are a helpful AI assistant. Please provide clear, accurate, and helpful responses to user questions.",
  placeholder = "Ask me anything...",
  className = "",
  blogTitle = "this content",
  isChatOpen = false,
  onChatToggle,
  blogId,
  courseId,
  chapterTopicId
}: AIChatProps) {
  const { isSignedIn } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Auto-expand by default
  const [showFeatures, setShowFeatures] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [lastAIMessageId, setLastAIMessageId] = useState<string | null>(null);
  const [messageLimit, setMessageLimit] = useState<number | null>(null);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history and message limits when chat opens
  useEffect(() => {
    if (isSignedIn && isChatOpen) {
      loadChatHistory();
      checkMessageLimits();
    }
  }, [isSignedIn, isChatOpen, blogId, courseId, chapterTopicId]);

  // Add welcome message if no history is found
  useEffect(() => {
    if (isSignedIn && isChatOpen && messages.length === 0 && !isLoadingHistory) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hello! I'm your AI learning assistant. I'm here to help you understand "${blogTitle}" better. Feel free to ask me any questions about the concepts, explanations, or if you need clarification on any topic covered in this lesson. How can I assist you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isSignedIn, isChatOpen, blogTitle, messages.length, isLoadingHistory]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToShowAIMessage = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      // Find the last AI message in the DOM
      const aiMessages = container.querySelectorAll('[data-role="assistant"]');
      if (aiMessages.length > 0) {
        const lastAIMessage = aiMessages[aiMessages.length - 1] as HTMLElement;
        const messageTop = lastAIMessage.offsetTop - container.offsetTop;
        
        // Scroll to show the AI message at the top of the visible area with smooth behavior
        container.scrollTo({
          top: messageTop,
          behavior: 'smooth'
        });
      }
    }
  };

  // Check message limits
  const checkMessageLimits = async () => {
    if (!isSignedIn) return;

    try {
      const response = await fetch('/api/user-plans/check-limits?feature=ai-chat');
      if (response.ok) {
        const data = await response.json();
        setHasActivePlan(data.hasActivePlan);
        setMessageLimit(data.messageLimit);
        setRemainingMessages(data.remainingMessages);
        setIsLimitExceeded(data.remainingMessages === 0 && !data.hasActivePlan);
      }
    } catch (error) {
      console.error('Error checking message limits:', error);
    }
  };

  useEffect(() => {
    // Only auto-scroll when not loading history and we have messages
    if (!isLoadingHistory && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Only scroll if user is not actively scrolling up
      if (!isUserScrolling) {
        if (lastMessage.role === 'user') {
          // For user messages, scroll to bottom
          setTimeout(() => scrollToBottom(), 50);
        } else if (lastMessage.role === 'assistant' && lastMessage.id !== lastAIMessageId && hasInitiallyLoaded) {
          // For NEW AI responses only during active chat, scroll to show the beginning of the response
          setTimeout(() => scrollToShowAIMessage(), 100);
          setLastAIMessageId(lastMessage.id);
        }
      }
    }
  }, [messages, isLoadingHistory, isUserScrolling, lastAIMessageId, hasInitiallyLoaded]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || isLimitExceeded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    // Reset input height to original
    if (inputRef.current) {
      inputRef.current.style.height = '48px';
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          systemPrompt: prompt,
          sessionId: sessionId,
          blogId: blogId,
          courseId: courseId,
          chapterTopicId: chapterTopicId,
          isFirstMessage: isFirstMessage,
          featureSlug: 'ai-chat'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle message limit exceeded
        if (errorData.error === 'MESSAGE_LIMIT_EXCEEDED') {
          setIsLimitExceeded(true);
          setRemainingMessages(0);
          const limitExceededMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'You have reached your message limit. Please upgrade to continue chatting.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, limitExceededMessage]);
          return;
        }
        
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Update session state if this was the first message
      if (isFirstMessage && data.sessionId) {
        setSessionId(data.sessionId);
        setIsFirstMessage(false);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update remaining messages after successful message
      if (remainingMessages !== null && remainingMessages > 0) {
        setRemainingMessages(prev => prev !== null ? prev - 1 : null);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
    setSessionId(null);
    setIsFirstMessage(true);
    setHasMoreMessages(true);
    setIsUserScrolling(false);
    setHasInitiallyLoaded(false);
    setLastAIMessageId(null);
  };

  // Load chat history when chat opens
  const loadChatHistory = async () => {
    if (!isSignedIn || !isChatOpen || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      const params = new URLSearchParams();
      if (blogId) params.append('blogId', blogId);
      if (courseId) params.append('courseId', courseId);
      if (chapterTopicId) params.append('chapterTopicId', chapterTopicId);

      // Use the main chat-sessions route instead of the last route
      const response = await fetch(`/api/chat-sessions?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sessions && data.sessions.length > 0) {
          // Get the most recent session for this specific content
          const latestSession = data.sessions[0];
          setSessionId(latestSession.id);
          setIsFirstMessage(false);
          
          // Convert database messages to component format
          const historyMessages: Message[] = latestSession.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.sender === 'USER' ? 'user' : 'assistant',
            content: msg.message,
            timestamp: new Date(msg.createdAt)
          }));

          setMessages(historyMessages);
          setHasInitiallyLoaded(true);
          
          // Set the last AI message ID to prevent scroll behavior on initial load
          if (historyMessages.length > 0) {
            const lastMessage = historyMessages[historyMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              setLastAIMessageId(lastMessage.id);
            }
          }
          
          // Scroll to bottom on initial load
          setTimeout(() => scrollToBottom(), 50);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load older messages when scrolling to top
  const loadOlderMessages = async () => {
    if (!sessionId || isLoadingOlderMessages || !hasMoreMessages) return;

    setIsLoadingOlderMessages(true);
    try {
      const params = new URLSearchParams({
        sessionId,
        limit: '20',
        offset: messages.length.toString()
      });

      const response = await fetch(`/api/chat-history?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages.length > 0) {
          // Convert database messages to component format
          const olderMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.sender === 'USER' ? 'user' : 'assistant',
            content: msg.message,
            timestamp: new Date(msg.createdAt)
          }));

          setMessages(prev => [...olderMessages, ...prev]);
          setHasMoreMessages(data.hasMore);
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingOlderMessages(false);
    }
  };

  // Handle scroll to top for loading older messages
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Check if user is scrolling up (not at bottom)
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
    setIsUserScrolling(!isAtBottom);
    
    // Load older messages when scrolling to top
    if (scrollTop === 0 && hasMoreMessages && !isLoadingOlderMessages) {
      loadOlderMessages();
    }
  };

  const handleBeginLearning = () => {
    onChatToggle?.(true);
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseChat = () => {
    onChatToggle?.(false);
  };

  // Show premium lock screen for non-logged-in users
  if (!isSignedIn) {
    return (
      <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl border-2 border-yellow-200 ${className}`}>
        {/* Header */}
        <div className="p-6">
          {/* Top row: Icon and Title */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">AI Premium Learning</h3>
          </div>
          
        </div>

        {/* Premium Lock Content */}
        <div className="border-t border-gray-200 p-6 text-center">
          <div className="mb-4">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Unlock AI Premium Learning For</h4>
            <h4 className="text-lg font-bold text-yellow-900 mb-2">{blogTitle}</h4>
            <p className="text-gray-600 text-sm mb-4">
              Get instant answers, explanations, and personalized learning assistance with our AI tutor.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Instant doubt resolution</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Personalized explanations</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>24/7 learning support</span>
            </div>
          </div>

          <a
            href="/profile?tab=subscription"
            className="cursor-pointer mt-6 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Upgrade to AI Premium
          </a>
        </div>
      </div>
    );
  }

  // If chat is not open, show the "Begin AI Learning" button
  if (!isChatOpen) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border-2 border-blue-200 ${className}`}>
        <div className="p-6">
          {/* Header with logo and title in one line */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">AI Learning Assistant</h3>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-6">
            Get personalized help understanding "{blogTitle}" with our AI tutor.
          </p>

          <button 
            onClick={handleBeginLearning}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 mb-4 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Begin AI Learning
          </button>
          
          {/* Features section with toggle */}
          <div>
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mb-3 cursor-pointer"
            >
              {showFeatures ? 'Show less' : 'What will it help with?'}
              <svg 
                className={`h-4 w-4 transition-transform duration-200 ${showFeatures ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showFeatures && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Instant doubt resolution</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personalized explanations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 learning support</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Chat interface when opened
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border-2 border-blue-200 flex flex-col ${className}`} style={{ height: '85vh' }}>
      {/* Header */}
      <div className="p-6">
        {/* Top row: Icon and Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">AI Learning Assistant</h3>
          </div>
          <button
            onClick={handleCloseChat}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer"
            title="Close chat"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Blog Title */}
        <h2 className="text-lg font-semibold text-gray-700 mb-3">{blogTitle}</h2>
        
        {/* Bottom row: Status and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">
              {messages.length > 0 ? `${messages.length} message${messages.length !== 1 ? 's' : ''}` : 'Ready to help with your learning'}
            </p>
            {/* Message limit display */}
            {messageLimit !== null && (
              <p className="text-xs text-gray-500 mt-1">
                {remainingMessages !== null ? (
                  hasActivePlan ? (
                    <span className="text-green-600">
                      {messageLimit === -1 ? 'Unlimited messages' : `${remainingMessages} of ${messageLimit} messages remaining`}
                    </span>
                  ) : remainingMessages > 0 ? (
                    <span className="text-blue-600">
                      {remainingMessages} of {messageLimit} messages remaining
                    </span>
                  ) : (
                    <span className="text-red-600">Message limit reached</span>
                  )
                ) : (
                  <span className="text-gray-500">Loading limits...</span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="border-t border-gray-200 flex flex-col flex-1 min-h-0">
        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scroll-smooth"
          onScroll={handleScroll}
        >
          {/* Loading older messages indicator */}
          {isLoadingOlderMessages && (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                Loading older messages...
              </div>
            </div>
          )}

          {/* Loading history indicator */}
          {isLoadingHistory && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                Loading chat history...
              </div>
            </div>
          )}

          {/* No more messages indicator */}
          {!hasMoreMessages && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <div className="text-xs text-gray-400">No more messages</div>
            </div>
          )}

          {messages.length === 0 && !isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Start a conversation with AI</p>
            </div>
          ) : (
            <>
              <div ref={messagesStartRef} />
              {messages.map((message) => (
              <div
                key={message.id}
                data-role={message.role}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-8'
                      : 'bg-gray-100 text-gray-900 mr-8'
                  }`}
                >
                  <div className="text-sm prose prose-sm max-w-none">
                    {(() => {
                      // Parse content and render code blocks with the CodeBlock component
                      const parts = message.content.split(/(```[\w]*\n[\s\S]*?```)/g);
                      return parts.map((part, index) => {
                        if (part.startsWith('```')) {
                          const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
                          if (match) {
                            const language = match[1] || 'text';
                            const code = match[2].trim();
                            return <CodeBlock key={index} code={code} language={language} />;
                          }
                        }
                        return (
                          <div
                            key={index}
                            dangerouslySetInnerHTML={{
                              __html: part
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
                                .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>')
                            }}
                          />
                        );
                      });
                    })()}
                  </div>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              ))}
            </>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg mr-8">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 mt-auto">
          {isLimitExceeded ? (
            /* Limit Exceeded UI */
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center">
              <div className="mb-4">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Message Limit Reached</h4>
                <p className="text-gray-600 text-sm mb-4">
                  You've used all {messageLimit} free messages. Upgrade to continue chatting with unlimited AI support.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited AI conversations</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority AI responses</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced AI features</span>
                </div>
              </div>

              <a
                href="/profile?tab=subscription"
                className="cursor-pointer w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Upgrade to Premium
              </a>
            </div>
          ) : (
            /* Normal Input Form */
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  }}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl ${
                  input.trim() ? 'hover:scale-105' : ''
                }`}
                style={{ 
                  minWidth: input.trim() ? 'auto' : '48px',
                  width: input.trim() ? 'auto' : '48px',
                  height: '48px'
                }}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
