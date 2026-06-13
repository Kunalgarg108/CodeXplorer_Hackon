import React, { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
} from "lucide-react";

const SUGGESTIONS = [
  "I only have ₹500 left for the week.",
  "What affordable food options do I have?",
  "How can I save more this month?",
  "Am I overspending on any category?",
  "Suggest a budget plan for this week.",
];

export default function AiFinancialChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await api.sendChatMessage({
        message: userMessage,
        conversationHistory,
      });

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="rounded-2xl border border-steel/30 bg-gradient-to-b from-deep via-deep to-midnight shadow-[0_0_40px_rgba(28,108,255,0.05)] overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-steel/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-signal/15 flex items-center justify-center shadow-[0_0_15px_rgba(28,108,255,0.2)]">
            <Sparkles className="w-5 h-5 text-signal" />
          </div>
          <div>
            <h3 className="font-display font-bold text-[28px] leading-tight text-white">
              AI Financial Assistant
            </h3>
            <p className="text-[14px] text-white/50 font-thin mt-0.5">
              Budget-aware · Menu-aware · Wellness-aware
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="max-h-[500px] overflow-y-auto px-6 py-4 space-y-5">
        {messages.length === 0 && (
          <div className="py-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-signal/10 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(28,108,255,0.15)]">
              <Bot className="w-8 h-8 text-signal" />
            </div>
            <div>
              <p className="text-[18px] text-white font-medium">
                Hi! I'm Pocket Buddy, your AI financial assistant.
              </p>
              <p className="text-[16px] text-white/60 font-thin mt-2 max-w-md mx-auto">
                I have access to your budgets, expenses, scanned restaurant menus, and wellness data. Ask me anything!
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2.5 justify-center pt-4">
              {SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    sendMessage(suggestion);
                  }}
                  className="text-[16px] text-white/80 font-thin px-5 py-2.5 rounded-xl border border-steel/30 bg-indigo/20 hover:border-signal/50 hover:text-white hover:bg-signal/10 hover:shadow-[0_0_12px_rgba(28,108,255,0.2)] transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-signal/15 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(28,108,255,0.15)]">
                <Bot className="w-4 h-4 text-signal" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                msg.role === "user"
                  ? "bg-signal/15 text-white text-[17px] font-normal border border-signal/25 shadow-[0_0_10px_rgba(28,108,255,0.1)]"
                  : "bg-indigo/40 text-white text-[18px] font-thin border border-steel/20 leading-[1.8]"
              }`}
            >
              {msg.content.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < msg.content.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-indigo/50 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-white/70" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-signal/15 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(28,108,255,0.15)]">
              <Bot className="w-4 h-4 text-signal" />
            </div>
            <div className="bg-indigo/40 border border-steel/20 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-signal animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2.5 h-2.5 rounded-full bg-signal animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2.5 h-2.5 rounded-full bg-signal animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions after conversation starts */}
      {messages.length > 0 && messages.length < 4 && !loading && (
        <div className="px-6 pt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.filter(
            (s) => !messages.some((m) => m.content === s)
          )
            .slice(0, 2)
            .map((suggestion, i) => (
              <button
                key={i}
                onClick={() => sendMessage(suggestion)}
                className="text-[14px] text-white/60 font-thin px-3.5 py-1.5 rounded-lg border border-steel/20 hover:border-signal/40 hover:text-white hover:bg-signal/5 transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-5 border-t border-steel/20">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your budget, food options, savings..."
            disabled={loading}
            className="flex-1 bg-indigo/20 border border-steel/30 rounded-xl px-5 py-3.5 text-[18px] text-white font-thin placeholder:text-white/50 focus:outline-none focus:border-signal/50 focus:shadow-[0_0_15px_rgba(28,108,255,0.15)] transition-all duration-200 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="px-5 py-3.5 rounded-xl bg-signal hover:bg-signal/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-[0_0_20px_rgba(28,108,255,0.3)] hover:shadow-[0_0_30px_rgba(28,108,255,0.5)] transition-all duration-200 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
