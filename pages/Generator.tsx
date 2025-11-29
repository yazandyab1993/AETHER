import React, { useState } from 'react';
import { User, MediaType, RequestStatus } from '../types';
import { Button, Card, Input } from '../components/UI';
import { getConfig, deductCredits, createRequest, updateRequestStatus, updateUserCredits } from '../services/mockBackend';
import { generateImage, generateVideo } from '../services/freepikService';
import { useNavigate } from 'react-router-dom';

export const Generator = ({ user, refreshUser }: { user: User; refreshUser: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<MediaType>(MediaType.IMAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const config = getConfig();

  const cost = type === MediaType.IMAGE ? config.costPerImage : config.costPerVideo;

  const handleGenerate = async () => {
    setError(null);
    if (!prompt.trim()) return;

    if (user.credits < cost) {
      setError(`Insufficient credits. Required: ${cost}, Available: ${user.credits}`);
      return;
    }

    setLoading(true);

    // 1. Deduct credits & Create local record
    const success = deductCredits(user.id, cost);
    if (!success) {
        setError("Transaction failed.");
        setLoading(false);
        return;
    }
    refreshUser(); // Update UI balance

    // 2. Create DB Record (Pending)
    const request = createRequest(user.id, prompt, type);

    try {
      // 3. Update status to Processing
      updateRequestStatus(request.id, RequestStatus.PROCESSING);

      // 4. Call API
      let url = '';
      if (type === MediaType.IMAGE) {
        url = await generateImage(prompt);
      } else {
        url = await generateVideo(prompt);
      }

      // 5. Complete
      updateRequestStatus(request.id, RequestStatus.COMPLETED, url);
      
      // Redirect to dashboard to see result
      navigate('/dashboard');
    } catch (err) {
      updateRequestStatus(request.id, RequestStatus.FAILED);
      setError("Generation failed. Credits consumed (contact admin for refund).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
          Unleash Your Imagination
        </h1>
        <p className="text-gray-400">
          Powered by Freepik API. High-fidelity generation securely stored on our VPS.
        </p>
      </div>

      <Card className="p-8">
        {/* Type Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setType(MediaType.IMAGE)}
            className={`flex-1 py-4 rounded-xl font-medium transition-all ${
              type === MediaType.IMAGE 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20' 
                : 'bg-black/20 text-gray-400 hover:bg-black/40'
            }`}
          >
            Generate Image
            <div className="text-xs opacity-70 mt-1">{config.costPerImage} Credit</div>
          </button>
          <button
            onClick={() => setType(MediaType.VIDEO)}
            className={`flex-1 py-4 rounded-xl font-medium transition-all ${
              type === MediaType.VIDEO 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-white/20' 
                : 'bg-black/20 text-gray-400 hover:bg-black/40'
            }`}
          >
            Generate Video
            <div className="text-xs opacity-70 mt-1">{config.costPerVideo} Credits</div>
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe your ${type === MediaType.IMAGE ? 'image' : 'video'} in detail...`}
                className="w-full h-32 bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
                Balance: <span className="text-white font-bold">{user.credits}</span>
            </div>
            
            <div className="flex items-center gap-4">
                {error && <span className="text-red-400 text-sm">{error}</span>}
                <Button 
                    onClick={handleGenerate} 
                    disabled={loading || !prompt}
                    className="min-w-[140px]"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            Generating...
                        </span>
                    ) : (
                        `Generate (${cost} Credits)`
                    )}
                </Button>
            </div>
        </div>
      </Card>
      
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
        {/* Placeholder decorative grid for 'vibes' */}
        {[1,2,3,4].map(i => (
            <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/5 animate-pulse" style={{animationDelay: `${i*100}ms`}}></div>
        ))}
      </div>
    </div>
  );
};