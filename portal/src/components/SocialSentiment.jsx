import React from 'react';
import { MessageSquare, Twitter, TrendingUp, ThumbsUp, Hash } from 'lucide-react';

export default function SocialSentiment({ sentiment }) {
  if (!sentiment) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Twitter color="var(--cyan-neon)" size={22} />
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
              X (Twitter) & Fan Sentiment Radar
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time trackside news, steward decisions, and social buzz score.
          </p>
        </div>

        {/* Sentiment Meter */}
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

      {/* Trending Hashtags */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {sentiment.trendingHashtags && sentiment.trendingHashtags.map((tag, idx) => (
          <span key={idx} className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Hash size={12} /> {tag.replace('#', '')}
          </span>
        ))}
      </div>

      {/* Live Trackside Tweets / News Cards */}
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
              <span style={{ fontWeight: 800, color: '#FFF' }}>{tweet.author}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{tweet.time}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
              "{tweet.text}"
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              <span>❤️ {tweet.likes}</span>
              <span>🔄 {tweet.retweets}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
