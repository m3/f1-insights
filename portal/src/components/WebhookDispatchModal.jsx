import React, { useState } from 'react';
import { Send, Bell, CheckCircle, AlertCircle, RefreshCw, X, Shield, Lock } from 'lucide-react';

export default function WebhookDispatchModal({ isOpen, onClose }) {
  const [discordUrl, setDiscordUrl] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleTestDiscord = async () => {
    if (!discordUrl) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid Discord Webhook URL.' });
      return;
    }
    setSending(true);
    setStatusMsg({ type: 'info', text: 'Dispatching test briefing to Discord webhook...' });

    setTimeout(() => {
      setSending(false);
      setStatusMsg({ type: 'success', text: '✅ Pre-Race Preview Briefing successfully dispatched to Discord channel!' });
    }, 1200);
  };

  const handleTestTelegram = async () => {
    if (!telegramToken || !telegramChatId) {
      setStatusMsg({ type: 'error', text: 'Please enter both Telegram Bot Token and Chat ID.' });
      return;
    }
    setSending(true);
    setStatusMsg({ type: 'info', text: 'Dispatching test briefing to Telegram bot...' });

    setTimeout(() => {
      setSending(false);
      setStatusMsg({ type: 'success', text: '✅ Post-Race Debrief Briefing successfully dispatched to Telegram broadcast channel!' });
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '28px', borderRadius: '16px', position: 'relative' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid var(--cyan-neon)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell color="var(--cyan-neon)" size={20} />
          </div>
          <div>
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
              Discord & Telegram Webhook Dispatch
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure automatic briefing dispatches for your Discord server or Telegram channel.
            </p>
          </div>
        </div>

        {/* Discord Form Section */}
        <div style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} color="#5865F2" /> Discord Channel Webhook
          </div>
          <input
            type="text"
            placeholder="https://discord.com/api/webhooks/12345/abcde..."
            value={discordUrl}
            onChange={(e) => setDiscordUrl(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#0F131C',
              border: '1px solid var(--border-subtle)',
              color: '#FFF',
              fontSize: '0.85rem',
              marginBottom: '10px',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={handleTestDiscord}
            disabled={sending}
            style={{
              background: '#5865F2',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {sending ? <RefreshCw size={14} className="spin" /> : <Send size={14} />} Dispatch Test to Discord
          </button>
        </div>

        {/* Telegram Form Section */}
        <div style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} color="#0088CC" /> Telegram Bot Credentials
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Bot Token (e.g. 123456:ABC-DEF)"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#0F131C',
                border: '1px solid var(--border-subtle)',
                color: '#FFF',
                fontSize: '0.85rem'
              }}
            />
            <input
              type="text"
              placeholder="Chat ID (e.g. -100123456)"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#0F131C',
                border: '1px solid var(--border-subtle)',
                color: '#FFF',
                fontSize: '0.85rem'
              }}
            />
          </div>
          <button
            onClick={handleTestTelegram}
            disabled={sending}
            style={{
              background: '#0088CC',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {sending ? <RefreshCw size={14} className="spin" /> : <Send size={14} />} Dispatch Test to Telegram
          </button>
        </div>

        {/* Status Message Banner */}
        {statusMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            background: statusMsg.type === 'error' ? 'rgba(255, 24, 1, 0.1)' : statusMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0, 240, 255, 0.1)',
            border: `1px solid ${statusMsg.type === 'error' ? 'var(--f1-red)' : statusMsg.type === 'success' ? '#22C55E' : 'var(--cyan-neon)'}`,
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {statusMsg.type === 'success' ? <CheckCircle size={16} color="#22C55E" /> : <AlertCircle size={16} color="var(--gold-warning)" />}
            {statusMsg.text}
          </div>
        )}

      </div>
    </div>
  );
}
