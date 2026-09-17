import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Send, Loader2, Wifi, WifiOff, AlertCircle, RefreshCw, ChevronDown, Zap, Sparkles } from 'lucide-react';
import { sendAgentChat, checkAgentHealth, AGENT_ID, SNS_FORM_URL } from '@/lib/api';

// ---------------------------------------------------------------------------
// Quick-prompt shortcuts — one click to test the agent round-trip
// ---------------------------------------------------------------------------
const QUICK_PROMPTS = [
  'Assess eligibility for a government grant opportunity',
  'What documents are required for DPIIT recognition?',
  'Summarise the bid qualification criteria',
  'Suggest improvements to our proposal',
];

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function StatusDot({ online, checking }) {
  if (checking) return <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />;
  return (
    <span
      className={`h-2 w-2 rounded-full transition-colors duration-500 ${online ? 'bg-emerald-400' : 'bg-red-400'}`}
    />
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ai-DEFAULT animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function AgentMessage({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-navy-900 px-3.5 py-2.5 text-sm text-white shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.role === 'thinking') {
    return (
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ai-light border border-ai-border">
          <Bot className="h-3.5 w-3.5 text-ai-DEFAULT" />
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-ai-light border border-ai-border px-3.5 py-2.5 shadow-sm">
          <TypingDots />
        </div>
      </div>
    );
  }

  if (msg.role === 'error') {
    return (
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gov-redLight border border-red-200">
          <AlertCircle className="h-3.5 w-3.5 text-gov-red" />
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-gov-redLight border border-red-200 px-3.5 py-2.5 shadow-sm">
          <p className="text-xs font-semibold text-gov-red mb-1">Agent Unavailable</p>
          <p className="text-xs text-gov-red/80 leading-relaxed">{msg.text}</p>
          {msg.isFallback && (
            <p className="mt-1.5 text-[10px] text-gov-muted">
              ✓ Local engine used as fallback — results still available.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ai-light border border-ai-border">
        <Bot className="h-3.5 w-3.5 text-ai-DEFAULT" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-gov-border px-3.5 py-2.5 shadow-sm">
        <p className="text-xs text-gov-ink leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[10px] text-gov-muted">SNS Agent Workbench</span>
          {msg.latencyMs != null && (
            <span className="text-[10px] text-gov-muted">· {msg.latencyMs}ms</span>
          )}
          {msg.isFallback && (
            <span className="rounded-full bg-gov-amberLight px-1.5 py-0.5 text-[10px] font-medium text-gov-amber">
              Fallback
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------

export function AIAgentWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));
  const [health, setHealth] = useState({ online: false, latencyMs: null });
  const [checkingHealth, setCheckingHealth] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ------ Health polling --------------------------------------------------
  const pollHealth = useCallback(async () => {
    setCheckingHealth(true);
    const h = await checkAgentHealth();
    setHealth(h);
    setCheckingHealth(false);
  }, []);

  useEffect(() => {
    pollHealth();
    const id = setInterval(pollHealth, 30_000);
    return () => clearInterval(id);
  }, [pollHealth]);

  // ------ Auto-scroll -----------------------------------------------------
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // ------ Focus on open ---------------------------------------------------
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // ------ Send message ----------------------------------------------------
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text ?? input).trim();
      if (!trimmed || sending) return;

      setInput('');
      setSending(true);

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'user', text: trimmed },
        { id: Date.now() + 1, role: 'thinking' },
      ]);

      const result = await sendAgentChat(trimmed, sessionId);

      setMessages((prev) => {
        // Replace the thinking bubble
        const withoutThinking = prev.filter((m) => m.role !== 'thinking');
        if (result.success && result.reply) {
          return [
            ...withoutThinking,
            { id: Date.now(), role: 'agent', text: result.reply, latencyMs: result.latencyMs, isFallback: false },
          ];
        }
        return [
          ...withoutThinking,
          {
            id: Date.now(),
            role: 'error',
            text: result.error || 'The agent did not return a response.',
            isFallback: result.isFallback,
          },
        ];
      });

      setSending(false);
    },
    [input, sending, sessionId],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ------ Render ----------------------------------------------------------
  return (
    <>
      {/* Floating trigger button */}
      <button
        id="ai-agent-widget-trigger"
        aria-label={open ? 'Close AI Agent' : 'Open AI Agent Assistant'}
        onClick={() => setOpen((o) => !o)}
        className={`
          fixed bottom-6 right-6 z-50
          flex h-14 w-14 items-center justify-center
          rounded-full shadow-xl border-2 transition-all duration-300
          ${open
            ? 'bg-navy-950 border-navy-700 rotate-0 scale-95'
            : 'bg-gradient-to-br from-ai-DEFAULT to-navy-900 border-ai-border hover:scale-110 hover:shadow-2xl'
          }
        `}
      >
        {open ? (
          <ChevronDown className="h-5 w-5 text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
            <span
              className={`absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full border-2 border-white transition-colors ${
                checkingHealth ? 'bg-yellow-400 animate-pulse' : health.online ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
          </div>
        )}
      </button>

      {/* Widget panel */}
      <div
        className={`
          fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px]
          flex flex-col rounded-2xl shadow-2xl border border-gov-border bg-white
          transition-all duration-300 origin-bottom-right
          ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}
        `}
        style={{ boxShadow: '0 20px 60px -10px rgba(15, 23, 42, 0.22), 0 8px 20px -8px rgba(79, 70, 165, 0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-navy-950 to-ai-DEFAULT px-4 py-3.5 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 border border-white/25">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">GrantPilot AI Agent</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusDot online={health.online} checking={checkingHealth} />
              <span className="text-[11px] text-white/70">
                {checkingHealth
                  ? 'Checking connection…'
                  : health.online
                    ? `Connected · ${health.latencyMs}ms`
                    : 'Workflow inactive — using local engine'}
              </span>
            </div>
          </div>
          <button
            aria-label="Refresh connection"
            onClick={pollHealth}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
          </button>
          <button
            aria-label="Close widget"
            onClick={() => setOpen(false)}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Agent ID pill */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50 border-b border-gov-border flex-shrink-0">
          <span className="text-[10px] text-gov-muted font-mono truncate">{AGENT_ID}</span>
          <a
            href={SNS_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-ai-DEFAULT hover:underline ml-2 flex-shrink-0"
          >
            Open in Workbench ↗
          </a>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ai-light border border-ai-border">
                <Zap className="h-5 w-5 text-ai-DEFAULT" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gov-ink">Ask the AI Agent</p>
                <p className="text-xs text-gov-muted mt-1 max-w-[220px] leading-relaxed">
                  Type anything or choose a quick prompt to test the SNS Agent Workbench round-trip.
                </p>
              </div>
              <div className="w-full space-y-1.5 mt-1">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="w-full text-left text-xs text-ai-DEFAULT bg-ai-light hover:bg-ai-border/50 border border-ai-border rounded-lg px-3 py-2 transition-colors leading-snug"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <AgentMessage key={msg.id} msg={msg} />)
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-gov-border px-3 py-3">
          <div className="flex items-end gap-2 rounded-xl bg-gray-50 border border-gov-border px-3 py-2 focus-within:border-ai-DEFAULT focus-within:ring-1 focus-within:ring-ai-DEFAULT transition-all">
            <textarea
              ref={inputRef}
              id="ai-agent-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the agent anything…"
              rows={1}
              disabled={sending}
              className="flex-1 resize-none bg-transparent text-sm text-gov-ink placeholder-gov-muted outline-none min-h-[20px] max-h-[100px] py-0.5 disabled:opacity-60"
              style={{ fieldSizing: 'content' }}
            />
            <button
              id="ai-agent-send-btn"
              aria-label="Send message"
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ai-DEFAULT text-white transition-all hover:bg-navy-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-gov-muted">
            AI-assisted · not official government advice · powered by{' '}
            <a href="https://agents.snsihub.ai" target="_blank" rel="noopener noreferrer" className="hover:underline">
              SNS Agent Workbench
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
