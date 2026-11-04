import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Cpu, HardDrive, Monitor, Apple, Cloud } from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  const [activeOS, setActiveOS] = useState<'hf' | 'windows' | 'macos' | 'linux' | 'docker'>('hf');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copySnippet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Setup & Deployment Terminal Guide</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Exact Terminal Commands for All Platforms
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
          Complete, verified setup instructions for local development and zero-cost cloud deployment on Hugging Face Spaces.
        </p>
      </div>

      {/* OS & Target Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setActiveOS('hf')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs sm:text-sm font-semibold transition ${
            activeOS === 'hf'
              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Hugging Face Spaces</span>
        </button>

        <button
          onClick={() => setActiveOS('windows')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs sm:text-sm font-semibold transition ${
            activeOS === 'windows'
              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Windows</span>
        </button>

        <button
          onClick={() => setActiveOS('macos')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs sm:text-sm font-semibold transition ${
            activeOS === 'macos'
              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>macOS</span>
        </button>

        <button
          onClick={() => setActiveOS('linux')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs sm:text-sm font-semibold transition ${
            activeOS === 'linux'
              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Linux / Ubuntu</span>
        </button>

        <button
          onClick={() => setActiveOS('docker')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs sm:text-sm font-semibold transition ${
            activeOS === 'docker'
              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Docker</span>
        </button>
      </div>

      {/* Guide Content Panels */}
      {activeOS === 'hf' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-red-400" />
              Deploying to Hugging Face Spaces (100% Free CPU or T4 GPU)
            </h3>
            <p className="text-xs text-neutral-300">
              Hugging Face Spaces natively supports Streamlit with hardware acceleration. System dependencies in <code className="text-amber-400 font-mono">packages.txt</code> (like FFmpeg) are installed automatically before launching!
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="text-neutral-500 mb-1"># 1. Create a Streamlit Space at huggingface.co/spaces</div>
                <div className="text-neutral-300">Space SDK: <strong>Streamlit</strong> | Hardware: <strong>CPU Basic (Free)</strong> or <strong>T4 (GPU)</strong></div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 2. Clone your Space repository locally:</div>
                <div className="text-emerald-400 font-bold">git clone https://huggingface.co/spaces/YOUR_USERNAME/shortsforge</div>
                <button
                  onClick={() => copySnippet('git clone https://huggingface.co/spaces/YOUR_USERNAME/shortsforge', 1)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 3. Copy app.py, requirements.txt, and packages.txt into the folder:</div>
                <div className="text-emerald-400">
                  cp app.py requirements.txt packages.txt ./shortsforge/
                </div>
                <button
                  onClick={() => copySnippet('cp app.py requirements.txt packages.txt ./shortsforge/', 2)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 4. Commit and push to Hugging Face:</div>
                <div className="text-sky-400">
                  git add .<br />
                  git commit -m "Deploy ShortsForge AI pipeline"<br />
                  git push
                </div>
                <button
                  onClick={() => copySnippet('git add .\ngit commit -m "Deploy ShortsForge AI pipeline"\ngit push', 3)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 3 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeOS === 'windows' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-red-400" />
              Windows Installation (PowerShell)
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 1. Install FFmpeg using Windows Package Manager (winget):</div>
                <div className="text-emerald-400">winget install "Gyan.FFmpeg"</div>
                <button
                  onClick={() => copySnippet('winget install "Gyan.FFmpeg"', 4)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 4 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 2. Setup Virtual Environment:</div>
                <div className="text-sky-400">
                  python -m venv venv<br />
                  .\venv\Scripts\Activate.ps1
                </div>
                <button
                  onClick={() => copySnippet('python -m venv venv\n.\\venv\\Scripts\\Activate.ps1', 5)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 5 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 3. Install requirements & Launch:</div>
                <div className="text-amber-300">
                  python -m pip install --upgrade pip<br />
                  pip install -r requirements.txt<br />
                  streamlit run app.py
                </div>
                <button
                  onClick={() => copySnippet('python -m pip install --upgrade pip\npip install -r requirements.txt\nstreamlit run app.py', 6)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 6 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeOS === 'macos' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Apple className="w-5 h-5 text-red-400" />
              macOS Installation (Apple Silicon & Intel via Homebrew)
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 1. Install FFmpeg and Python 3.10 via Homebrew:</div>
                <div className="text-emerald-400">brew install ffmpeg python@3.10</div>
                <button
                  onClick={() => copySnippet('brew install ffmpeg python@3.10', 7)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 7 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 2. Create Virtual Environment:</div>
                <div className="text-sky-400">
                  python3 -m venv venv<br />
                  source venv/bin/activate
                </div>
                <button
                  onClick={() => copySnippet('python3 -m venv venv\nsource venv/bin/activate', 8)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 8 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 3. Install packages and run Streamlit:</div>
                <div className="text-amber-300">
                  pip install -r requirements.txt<br />
                  streamlit run app.py
                </div>
                <button
                  onClick={() => copySnippet('pip install -r requirements.txt\nstreamlit run app.py', 9)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 9 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeOS === 'linux' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-400" />
              Linux (Ubuntu / Debian)
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 1. Install FFmpeg & fonts:</div>
                <div className="text-emerald-400">
                  sudo apt update && sudo apt install -y ffmpeg libsm6 libxext6 fonts-liberation fonts-dejavu-core python3-pip python3-venv
                </div>
                <button
                  onClick={() => copySnippet('sudo apt update && sudo apt install -y ffmpeg libsm6 libxext6 fonts-liberation fonts-dejavu-core python3-pip python3-venv', 10)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 10 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># 2. Setup Virtual Environment and Launch:</div>
                <div className="text-sky-400">
                  python3 -m venv venv<br />
                  source venv/bin/activate<br />
                  pip install -r requirements.txt<br />
                  streamlit run app.py --server.port 8501 --server.address 0.0.0.0
                </div>
                <button
                  onClick={() => copySnippet('python3 -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt\nstreamlit run app.py --server.port 8501 --server.address 0.0.0.0', 11)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 11 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeOS === 'docker' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-red-400" />
              Docker Container Build & Run
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># Build image from Dockerfile:</div>
                <div className="text-emerald-400">docker build -t shortsforge:latest .</div>
                <button
                  onClick={() => copySnippet('docker build -t shortsforge:latest .', 12)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 12 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 relative group">
                <div className="text-neutral-500 mb-1"># Run container mapping port 8501:</div>
                <div className="text-sky-400">docker run -p 8501:8501 --name shortsforge-app shortsforge:latest</div>
                <button
                  onClick={() => copySnippet('docker run -p 8501:8501 --name shortsforge-app shortsforge:latest', 13)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  {copiedIndex === 13 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
