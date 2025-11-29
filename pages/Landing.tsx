import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      
      {/* Hero Badge */}
      <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-8 backdrop-blur-sm animate-fade-in-up">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span className="text-xs font-medium tracking-wide text-gray-300 uppercase">System Operational v1.0</span>
      </div>

      {/* Hero Text */}
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
        <span className="block text-white">Create visual masterpieces</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
          with pure intelligence.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
        A premium generative AI platform. Generate high-fidelity images and videos instantly. 
        Secure VPS storage. Professional grade tools.
      </p>

      <div className="flex gap-4">
        <Button onClick={() => navigate('/login')} className="px-8 py-4 text-lg">
          Start Creating Free
        </Button>
        <Button variant="secondary" onClick={() => window.open('https://freepik.com', '_blank')} className="px-8 py-4 text-lg">
          View Examples
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
        {[
          { title: 'Freepik API', desc: 'Direct integration with top-tier generative models.' },
          { title: 'Secure Storage', desc: 'Local VPS outputs with automated 7-day retention.' },
          { title: 'Instant Delivery', desc: 'Optimized pipeline for sub-second latency.' }
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-left">
            <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};