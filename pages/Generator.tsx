import React, { useState, useEffect } from 'react';
import { User, MediaType, RequestStatus, AIModel } from '../types';
import { Button, Card, Input } from '../components/UI';
import { getConfig, deductCredits, createRequest, updateRequestStatus, updateUserCredits, getModels } from '../services/mockBackend';
import { generateImage, generateImageToVideo, generateTextToVideo, getTaskStatus } from '../services/freepikService';
import { useNavigate } from 'react-router-dom';

export const Generator = ({ user, refreshUser }: { user: User; refreshUser: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<MediaType>(MediaType.IMAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [duration, setDuration] = useState<number>(5);
  const [cfgScale, setCfgScale] = useState<number>(0.5);
  const [sourceImage, setSourceImage] = useState<string>(''); // For image-to-video
  const navigate = useNavigate();
  const config = getConfig();

  useEffect(() => {
    // Load available models
    const availableModels = getModels().filter(model => model.isActive);
    setModels(availableModels);
    
    // Set default model if available
    if (availableModels.length > 0) {
      setSelectedModel(availableModels[0].id);
      setDuration(availableModels[0].defaultDuration);
      setCfgScale(availableModels[0].defaultCfgScale);
    }
  }, []);

  // Find the selected model to get its cost
  const selectedModelObj = models.find(model => model.id === selectedModel);
  const cost = selectedModelObj ? selectedModelObj.costPerGeneration : (type === MediaType.IMAGE ? config.costPerImage : config.costPerVideo);

  const handleGenerate = async () => {
    setError(null);
    if (!prompt.trim()) return;
    if (!selectedModel) {
      setError("Please select an AI model");
      return;
    }

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
    const request = createRequest(user.id, prompt, type, selectedModel, duration, cfgScale, sourceImage);

    try {
      // 3. Update status to Processing
      updateRequestStatus(request.id, RequestStatus.PROCESSING);

      // 4. Call API based on type and model
      let taskId = '';
      if (type === MediaType.IMAGE) {
        // For image generation, use the existing function
        const imageUrl = await generateImage(prompt);
        updateRequestStatus(request.id, RequestStatus.COMPLETED, imageUrl);
      } else {
        // For video generation, use the new functions based on whether we have an image
        if (sourceImage) {
          // Image-to-video
          taskId = await generateImageToVideo(sourceImage, prompt, duration, cfgScale);
        } else {
          // Text-to-video
          taskId = await generateTextToVideo(prompt, duration, cfgScale);
        }

        // Poll for task completion
        let statusResult = await getTaskStatus(taskId);
        let attempts = 0;
        const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait time

        while (statusResult.status !== 'completed' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          statusResult = await getTaskStatus(taskId);
          attempts++;
        }

        if (statusResult.status === 'completed' && statusResult.result?.url) {
          updateRequestStatus(request.id, RequestStatus.COMPLETED, statusResult.result.url);
        } else {
          updateRequestStatus(request.id, RequestStatus.FAILED);
          throw new Error("Video generation timed out or failed");
        }
      }
      
      // Redirect to dashboard to see result
      navigate('/dashboard');
    } catch (err) {
      updateRequestStatus(request.id, RequestStatus.FAILED);
      setError(`Generation failed: ${(err as Error).message || "Unknown error"}. Credits consumed (contact admin for refund).`);
    } finally {
      setLoading(false);
    }
  };

  // Get the selected model's capabilities
  const currentModel = models.find(model => model.id === selectedModel);

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
        {/* Model Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
          <select
            value={selectedModel}
            onChange={(e) => {
              const modelId = e.target.value;
              setSelectedModel(modelId);
              const model = models.find(m => m.id === modelId);
              if (model) {
                setDuration(model.defaultDuration);
                setCfgScale(model.defaultCfgScale);
              }
            }}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.costPerGeneration} Credits)
              </option>
            ))}
          </select>
        </div>

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
            <div className="text-xs opacity-70 mt-1">{cost} Credit</div>
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
            <div className="text-xs opacity-70 mt-1">{cost} Credits</div>
          </button>
        </div>

        {/* Video-specific settings */}
        {type === MediaType.VIDEO && currentModel && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (seconds)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {Array.from({ length: currentModel.maxDuration }, (_, i) => i + 1).map(sec => (
                  <option key={sec} value={sec}>{sec} second{sec > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CFG Scale</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={cfgScale}
                onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-400">{cfgScale}</div>
            </div>
          </div>
        )}

        {/* Image-to-Video Source Image Input */}
        {type === MediaType.VIDEO && currentModel?.supportsImageToVideo && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Source Image URL (optional)</label>
            <input
              type="text"
              value={sourceImage}
              onChange={(e) => setSourceImage(e.target.value)}
              placeholder="Enter image URL for image-to-video conversion..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for text-to-video generation</p>
          </div>
        )}

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
                    disabled={loading || !prompt || !selectedModel}
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