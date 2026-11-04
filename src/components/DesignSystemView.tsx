import React, { useState } from 'react';
import { Palette, Copy, Check, Code, Layers, Sparkles, Smartphone, Scissors, Terminal, Eye } from 'lucide-react';

export const DesignSystemView: React.FC = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'tokens' | 'tailwind' | 'streamlit'>('tokens');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colorTokens = [
    {
      name: 'Obsidian Slate',
      hex: '#0B0F19',
      variable: '--bg-obsidian',
      role: 'Primary Canvas Background',
      usage: 'App root, deep canvas backing, input wells',
    },
    {
      name: 'Deep Charcoal',
      hex: '#161F30',
      variable: '--surface-charcoal',
      role: 'Secondary Surface / Card',
      usage: 'Interactive cards, toolbars, modal backgrounds',
    },
    {
      name: 'Subtle Steel',
      hex: '#243049',
      variable: '--border-subtle',
      role: 'Hairline 1px Divider & Border',
      usage: '1px clean component boundaries, divider tracks',
    },
    {
      name: 'The Blade (Electric Emerald)',
      hex: '#10B981',
      variable: '--blade-emerald',
      role: 'Primary Action Accent',
      usage: 'Main Chop button, active state rings, timeline slice',
    },
    {
      name: 'The Blade (Cyber Neon Red)',
      hex: '#FF3366',
      variable: '--blade-red',
      role: 'Alternative Slicing Blade',
      usage: 'High-intensity slicing indicator, error states',
    },
    {
      name: 'TikTok Gold',
      hex: '#FACC15',
      variable: '--caption-yellow',
      role: 'High-Retention Caption Highlight',
      usage: 'Word-by-word active karaoke spoken highlight',
    },
  ];

  const typographyTokens = [
    {
      role: 'Hero Display & Brand Wordmark',
      family: 'Syne / Plus Jakarta Sans',
      weights: 'Bold (700), Heavy (800)',
      example: 'Turn heavy beasts into bite-sized snacks.',
      css: "font-family: 'Syne', sans-serif; font-weight: 800;",
    },
    {
      role: 'Interface Body & Labels',
      family: 'Plus Jakarta Sans',
      weights: 'Medium (500), SemiBold (600)',
      example: 'High-precision YouTube video chunk extraction without downloading 1-hour files.',
      css: "font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;",
    },
    {
      role: 'Timestamps, Telemetry & Code',
      family: 'JetBrains Mono',
      weights: 'Regular (400), SemiBold (600)',
      example: '00:15:30.45 ➔ 00:45:30.45 [1080x1920]',
      css: "font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums;",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Brand Philosophy Banner */}
      <div className="border border-[#243049] bg-[#161F30]/70 rounded-2xl p-6 sm:p-8 backdrop-blur-xl space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#10B981] font-bold">
          <Scissors className="w-4 h-4 transform -rotate-45" />
          <span>CHOPCHOP-AI / BRAND IDENTITY SYSTEM</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Visual Aesthetic & Design Philosophy
        </h2>
        <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
          Inspired by <strong>Linear.app</strong>, <strong>Raycast</strong>, and <strong>Vercel</strong>. 
          The design language rejects generic soft AI gradients and cluttered cards in favor of a 
          high-performance developer aesthetic: <strong>Obsidian canvas</strong>, <strong>hairline 1px borders</strong>, 
          <strong>tactile feedback</strong>, and <strong>The Blade</strong> (clean division, razor precision, instant results).
        </p>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#243049]">
          <div className="space-y-1">
            <div className="font-display font-bold text-white text-sm">01. The Razor Chop</div>
            <p className="text-xs text-neutral-400">
              Instant chunk streaming without buffering 1-hour beasts. Snappy cuts, zero latency.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-display font-bold text-white text-sm">02. Obsidian Depth</div>
            <p className="text-xs text-neutral-400">
              Pure #0B0F19 canvas with single-elevation #161F30 card surfaces and subtle #243049 hairline edges.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-display font-bold text-white text-sm">03. High-Retention Gold</div>
            <p className="text-xs text-neutral-400">
              #FACC15 TikTok Yellow with heavy black outlines for maximum mobile subtitle retention.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Color Palette & Design Tokens Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#10B981]" />
            Color Tokens & Palette Matrix
          </h3>
          <span className="text-xs font-mono text-neutral-400">Click swatch to copy CSS variable</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorTokens.map((token, idx) => (
            <div
              key={idx}
              onClick={() => copyToClipboard(`var(${token.variable})`, `var-${idx}`)}
              className="group cursor-pointer border border-[#243049] hover:border-[#10B981]/50 bg-[#161F30] rounded-2xl p-4 transition-all shadow-lg hover:shadow-black/60 relative"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl border border-white/10 shrink-0 shadow-inner"
                  style={{ backgroundColor: token.hex }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm truncate">{token.name}</div>
                  <div className="font-mono text-xs text-neutral-400">{token.hex}</div>
                </div>
                <button className="text-neutral-500 group-hover:text-white transition">
                  {copiedToken === `var-${idx}` ? (
                    <Check className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#243049]/60 font-mono text-xs">
                <div className="text-[#10B981] font-semibold">{token.variable}</div>
                <div className="text-neutral-400 font-sans text-xs">{token.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Typography Pairing Scale */}
      <div className="border border-[#243049] bg-[#161F30] rounded-2xl p-6 space-y-5">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-[#FACC15]" />
          Typography System (Syne + Plus Jakarta Sans + JetBrains Mono)
        </h3>

        <div className="space-y-4 divide-y divide-[#243049]">
          {typographyTokens.map((typo, idx) => (
            <div key={idx} className="pt-4 first:pt-0 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#10B981]">{typo.role}</span>
                <span className="font-mono text-neutral-400">{typo.family} · {typo.weights}</span>
              </div>
              <div
                className="text-white text-lg py-1"
                style={{
                  fontFamily: typo.family.split('/')[0].trim(),
                }}
              >
                {typo.example}
              </div>
              <div className="font-mono text-[11px] text-neutral-500">{typo.css}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Component Implementation Snippets (Streamlit, Tailwind, Raw CSS) */}
      <div className="border border-[#243049] bg-[#161F30] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#0B0F19] border-b border-[#243049] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#10B981]" />
            <span className="font-display font-bold text-sm text-white">
              Code Blueprints & Implementation Recipes
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-[#161F30] p-1 rounded-lg border border-[#243049]">
            <button
              onClick={() => setActiveCodeTab('tokens')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                activeCodeTab === 'tokens' ? 'bg-[#243049] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              CSS Variables
            </button>
            <button
              onClick={() => setActiveCodeTab('tailwind')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                activeCodeTab === 'tailwind' ? 'bg-[#243049] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tailwind CSS
            </button>
            <button
              onClick={() => setActiveCodeTab('streamlit')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                activeCodeTab === 'streamlit' ? 'bg-[#243049] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Streamlit CSS
            </button>
          </div>
        </div>

        <div className="p-5 font-mono text-xs text-neutral-300 bg-[#0B0F19]/90 max-h-[380px] overflow-y-auto leading-relaxed">
          {activeCodeTab === 'tokens' && (
            <pre className="text-neutral-300">
{`:root {
  /* ChopChop-ai Core Design Tokens */
  --bg-obsidian: #0B0F19;              /* Primary canvas background */
  --surface-charcoal: #161F30;         /* Secondary card surface */
  --border-subtle: #243049;            /* Hairline 1px border */
  --blade-emerald: #10B981;            /* Primary action blade */
  --blade-red: #FF3366;                /* Cyber neon alternative */
  --caption-yellow: #FACC15;           /* TikTok retention gold */

  /* Typography */
  --font-display: 'Syne', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-code: 'JetBrains Mono', monospace;
}`}
            </pre>
          )}

          {activeCodeTab === 'tailwind' && (
            <pre className="text-neutral-300">
{`// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0F19',
        charcoal: '#161F30',
        steel: '#243049',
        blade: '#10B981',
        neonred: '#FF3366',
        tiktokGold: '#FACC15',
      },
      fontFamily: {
        display: ['Syne', 'Plus Jakarta Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};`}
            </pre>
          )}

          {activeCodeTab === 'streamlit' && (
            <pre className="text-neutral-300">
{`# Streamlit Custom Styling Block (app.py)
CHOPCHOP_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@500;700&family=Syne:wght@700;800&display=swap');

html, body, [class*="st-"] {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #0B0F19 !important;
    color: #E2E8F0 !important;
}

/* Card Boxes */
div[data-testid="stVerticalBlock"] > div {
    background: #161F30;
    border: 1px solid #243049;
    border-radius: 16px;
    padding: 18px;
}

/* Primary Chop Button */
button[kind="primary"] {
    background: linear-gradient(90deg, #10B981, #059669) !important;
    color: #0B0F19 !important;
    font-weight: 800 !important;
    border: none !important;
    border-radius: 12px !important;
}
</style>
"""
st.markdown(CHOPCHOP_CSS, unsafe_allow_html=True)
`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
