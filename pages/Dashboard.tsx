import React, { useEffect, useState } from 'react';
import { User, GenerationRequest, RequestStatus } from '../types';
import { getRequests } from '../services/mockBackend';
import { Card, Badge, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const Dashboard = ({ user }: { user: User }) => {
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRequests(getRequests(user.id));
  }, [user.id]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workspace</h1>
          <p className="text-gray-400">Manage your creations and credits.</p>
        </div>
        <Button onClick={() => navigate('/generate')}>Create New +</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-indigo-500">
          <div className="text-gray-400 text-sm mb-1">Available Credits</div>
          <div className="text-4xl font-bold text-white">{user.credits}</div>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="text-gray-400 text-sm mb-1">Total Creations</div>
          <div className="text-4xl font-bold text-white">{requests.length}</div>
        </Card>
        <Card className="p-6 border-l-4 border-l-pink-500">
          <div className="text-gray-400 text-sm mb-1">Active Files</div>
          <div className="text-4xl font-bold text-white">
            {requests.filter(r => r.status === RequestStatus.COMPLETED).length}
          </div>
        </Card>
      </div>

      {/* Notice */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
        <div className="text-yellow-500 mt-1">⚠️</div>
        <div>
          <h4 className="font-semibold text-yellow-500">Storage Policy</h4>
          <p className="text-sm text-yellow-200/70">Generated content is stored on our high-speed VPS for 7 days only. Please download your files before they expire.</p>
        </div>
      </div>

      {/* Recent History */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">History</h2>
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
            <p className="text-gray-400 mb-4">No content generated yet.</p>
            <Button variant="secondary" onClick={() => navigate('/generate')}>Start Creating</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <Card key={req.id} className="group relative">
                {/* Media Preview */}
                <div className="aspect-square bg-black/40 relative overflow-hidden">
                  {req.status === RequestStatus.COMPLETED && req.outputUrl ? (
                    req.type === 'VIDEO' ? (
                      <video src={req.outputUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={req.outputUrl} alt={req.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                      {req.status === RequestStatus.EXPIRED ? 'File Deleted' : 'Processing...'}
                    </div>
                  )}
                  
                  {/* Overlay for Completed Items */}
                  {req.status === RequestStatus.COMPLETED && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <a 
                         href={req.outputUrl} 
                         download={`aether-${req.id}.png`}
                         className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform"
                         target="_blank" rel="noreferrer"
                       >
                         Download
                       </a>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge status={req.status} />
                    <span className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2" title={req.prompt}>
                    {req.prompt}
                  </p>
                  
                  {req.status === RequestStatus.COMPLETED && (
                    <div className="text-xs text-gray-500 mt-2 border-t border-white/5 pt-2 flex justify-between">
                      <span>Expires: {new Date(req.expiresAt).toLocaleDateString()}</span>
                      <span className="font-mono text-[10px] opacity-50">VPS: {req.localPath?.split('/').pop()}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};