import React, { useState } from 'react';
import { Twitter, Youtube, ThumbsUp, Hash, Video, Tag, CheckCircle } from 'lucide-react';

export default function SocialSentiment({ sentiment }) {
  const [activeTab, setActiveTab] = useState('tweets'); // 'tweets', 'youtube', 'keywords'

  if (!sentiment) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Twitter color="var(--cyan-neon)" size={22} />
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
              X & YouTube Multi-Source Sentiment Radar <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>v{sentiment.version || '2026.3'}</span>
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time trackside updates, steward decisions, technical debriefs & YouTube watchalongs.
          </p>
        </div>

        {/* Buzz Meter */}
        <div style={{
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid var(--cyan-neon)',
          padding: '8px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ThumbsUp color="var(--cyan-neon)" size={18} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>WEEKEND BUZZ SCORE</div>
            <div className="font-mono font-orbitron" style={{ fontSize: '1rem', color: '#FFF', fontWeight: 800 }}>
              {sentiment.sentimentScore}% {sentiment.overallSentiment}
            </div>
          </div>
        </div>
      </div>

      {/* Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', pb: '12px' }}>
        <button
          className={`nav-tab ${activeTab === 'tweets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tweets')}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          <Twitter size={14} /> X Trackside Feed ({sentiment.breakingNewsTweets?.length || 0})
        </button>
        <button
          className={`nav-tab ${activeTab === 'youtube' ? 'active' : ''}`}
          onClick={() => setActiveTab('youtube')}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          <Youtube size={14} /> YouTube Watchalongs ({sentiment.youtubeSources?.length || 0})
        </button>
        <button
          className={`nav-tab ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          <Tag size={14} /> Categorized Keywords
        </button>
      </div>

      {/* Trending Hashtags */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {sentiment.trendingHashtags && sentiment.trendingHashtags.map((tag, idx) => (
          <span key={idx} className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Hash size={12} /> {tag.replace('#', '')}
          </span>
        ))}
      </div>

      {/* Tab Content 1: X (Twitter) Feed */}
      {activeTab === 'tweets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {sentiment.breakingNewsTweets && sentiment.breakingNewsTweets.map((tweet, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              padding: '16px',
              borderRadius: '12px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontWeight: 800, color: '#FFF' }}>{tweet.author}</span>
                  {tweet.type && <span className="badge badge-red" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>{tweet.type}</span>}
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{tweet.time}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
                "{tweet.text}"
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                <div>
                  <span>❤️ {tweet.likes}</span> • <span>🔄 {tweet.retweets}</span>
                </div>
                {tweet.weight && <span style={{ color: 'var(--cyan-neon)' }}>Weight: {tweet.weight}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: YouTube Watchalongs */}
      {activeTab === 'youtube' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {sentiment.youtubeSources && sentiment.youtubeSources.map((yt, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 0, 0, 0.05)',
              border: '1px solid rgba(255, 0, 0, 0.2)',
              padding: '16px',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Youtube color="#FF0000" size={20} />
                <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>{yt.channel_name}</div>
                <span className="font-mono" style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>({yt.handle})</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {yt.focus}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: Categorized Keywords */}
      {activeTab === 'keywords' && sentiment.keywords && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {Object.entries(sentiment.keywords).map(([cat, kwList], idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold-warning)', marginBottom: '10px' }}>
                {cat} Keywords
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Array.isArray(kwList) && kwList.map((kw, kIdx) => (
                  <span key={kIdx} style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#FFF'
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
