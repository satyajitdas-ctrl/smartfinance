import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  PieChart,
  IndianRupee,
  Trash2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  ChatMessage,
} from '../services/api';

interface LocalMessage {
  id: string | number;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'How much did I spend this month?',
    'What is my biggest spending category?',
    'Compare my expenses with last month.',
    'Am I likely to exceed my budget?',
    'How much did I save this month?',
    'Give me suggestions to reduce spending.',
  ];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load chat history from backend database
  useEffect(() => {
    getChatHistory()
      .then((history) => {
        if (history && history.length > 0) {
          const formatted: LocalMessage[] = [];
          history.forEach((h, idx) => {
            const time = h.created_at
              ? new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';
            formatted.push({
              id: `user-${idx}`,
              sender: 'user',
              text: h.message,
              time: time,
            });
            formatted.push({
              id: `asst-${idx}`,
              sender: 'assistant',
              text: h.response,
              time: time,
            });
          });
          setMessages(formatted);
        } else {
          // Default greeting
          setMessages([
            {
              id: 'welcome',
              sender: 'assistant',
              text: `Hello ${user?.name || 'there'}! I am your FinWise AI Assistant. I calculate verified financial metrics directly from your ledger in SQLite. Ask me questions about your monthly spending, savings velocity, category breakdown, or budget forecasts!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [user]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message immediately
    const userMsg: LocalMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: timeString,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await sendChatMessage(text);
      const asstMsg: LocalMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      const errorMsg: LocalMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue analyzing your ledger. Please make sure the backend server is running and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    try {
      await clearChatHistory();
      setMessages([
        {
          id: 'cleared',
          sender: 'assistant',
          text: 'Conversation history cleared. What would you like to review in your financial records?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      alert('Failed to clear chat history.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Finance Assistant</h2>
            <span className="flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
              <Cpu className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span>Grounded in DB Ledger</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ask factual questions answered directly from your authenticated financial database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Clear Chat History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/80 p-4 sm:p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-xl space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12 text-xs text-slate-400 gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
            <span>Loading conversation history...</span>
          </div>
        ) : (
          messages.map((m) => {
            const isAsst = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAsst ? 'justify-start' : 'justify-end'}`}
              >
                {isAsst && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-600/20 dark:border-purple-500/30 dark:text-purple-400">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    isAsst
                      ? 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200'
                      : 'bg-brand-600 text-white shadow-brand-600/20'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  <div
                    className={`mt-1.5 text-[10px] text-right ${
                      isAsst ? 'text-slate-400 dark:text-slate-500' : 'text-brand-200'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {!isAsst && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-600/20 dark:border-purple-500/30 dark:text-purple-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400">
              <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1 text-[11px] text-slate-500 dark:text-slate-400">Calculating ledger metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-purple-500 dark:text-purple-400" />
          <span>Quick Prompts:</span>
        </span>
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            disabled={isTyping}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-2xs hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-purple-500/40 dark:hover:bg-purple-500/10 dark:hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isTyping}
          placeholder="Ask a question about your spending, categories, savings, or budget limits..."
          className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-12 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-brand-500 focus:outline-none backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500"
        />

        <button
          onClick={() => handleSend()}
          disabled={isTyping || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md hover:bg-brand-500 transition-colors disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Footnote Disclaimers */}
      <p className="text-center text-[10px] text-slate-500">
        🛡️ Zero-Hallucination Architecture: Figures are computed deterministically via SQL/Python before answer synthesis. No financial data is invented.
      </p>
    </div>
  );
};
