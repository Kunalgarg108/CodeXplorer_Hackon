import React, { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [expanded, setExpanded] = useState(true);
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-card border-l-4 border-signal/60 overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-btn bg-signal/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-signal" />
          </div>
          <div>
            <h3 className="font-display font-bold text-[32px] leading-tight text-white">
              Pocket Buddy AI
            </h3>
            <p className="text-[18px] text-white/70 font-thin">
              Ask about budgets, food options, or savings tips
            </p>
          </div>
        </div>
        <button className="text-mist hover:text-white transition-colors p-1.5 rounded-btn hover:bg-indigo/40">
          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Chat Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Messages Area */}
            <div className="max-h-[450px] overflow-y-auto px-5 space-y-4">
              {messages.length === 0 && (
                <div className="py-8 text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-signal/10 flex items-center justify-center mx-auto">
                    <Bot className="w-7 h-7 text-signal" />
                  </div>
                  <div>
                    <p className="text-[18px] text-white font-medium">
                      Hi! I'm Pocket Buddy, your AI financial assistant.
                    </p>
                    <p className="text-[16px] text-white/70 font-thin mt-2">
                      I know your budgets, expenses, and scanned restaurant menus. Ask me anything!
                    </p>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="flex flex-wrap gap-2 justify-center pt-3">
                    {SUGGESTIONS.slice(0, 3).map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          sendMessage(suggestion);
                        }}
                        className="text-[14px] text-white/80 font-thin px-4 py-2 rounded-full border border-steel/40 hover:border-signal/60 hover:text-signal transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-signal/15 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-signal" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 leading-relaxed ${
                      msg.role === "user"
                        ? "bg-signal/20 text-white text-[16px] font-normal border border-signal/30"
                        : "bg-indigo/50 text-white text-[18px] font-thin border border-steel/30"
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
                    <div className="w-7 h-7 rounded-full bg-indigo/60 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-white/70" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-signal/15 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-signal" />
                  </div>
                  <div className="bg-indigo/50 border border-steel/30 rounded-xl px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-signal animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-signal animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-signal animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions after first message */}
            {messages.length > 0 && messages.length < 4 && !loading && (
              <div className="px-5 pt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.filter(
                  (s) => !messages.some((m) => m.content === s)
                )
                  .slice(0, 2)
                  .map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion)}
                      className="text-[12px] text-white/60 font-thin px-3 py-1.5 rounded-full border border-steel/30 hover:border-signal/50 hover:text-signal transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-5 border-t border-steel/20 mt-3">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your budget, food options, savings..."
                  disabled={loading}
                  className="flex-1 bg-indigo/30 border border-steel/40 rounded-btn px-4 py-3 text-[16px] text-white font-thin placeholder:text-white/40 focus:outline-none focus:border-signal/50 transition-colors disabled:opacity-50"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  size="sm"
                  className="px-4 py-3 h-auto shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
