import React, { useState, useEffect } from 'react';
import { User, UserRole, GenerationRequest, RequestStatus } from '../types';
import { getUsers, getRequests, getConfig, updateConfig, updateUserCredits } from '../services/mockBackend';
import { Button, Card, Input, Badge } from '../components/UI';

export const Admin = ({ currentUser }: { currentUser: User }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [config, setConfig] = useState(getConfig());
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'settings'>('users');

  // Local state for editing credits
  const [editCreditId, setEditCreditId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);

  useEffect(() => {
    setUsers(getUsers());
    setRequests(getRequests());
  }, [activeTab]); // simplistic refresh

  if (currentUser.role !== UserRole.ADMIN) {
    return <div className="text-center text-red-500 mt-20">Access Denied</div>;
  }

  const handleUpdateCredits = (userId: string) => {
    updateUserCredits(userId, creditAmount);
    setEditCreditId(null);
    setUsers(getUsers()); // refresh
  };

  const handleSaveConfig = () => {
    updateConfig(config);
    alert('System Configuration Updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Console</h1>
        <div className="bg-white/5 p-1 rounded-lg flex space-x-1">
          {['users', 'requests', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md text-sm capitalize transition-all ${
                activeTab === tab ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-6">
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 pl-2">User ID</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Credits</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 pl-2 font-mono text-gray-500">{u.id}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3"><span className="text-xs bg-white/10 px-2 py-1 rounded">{u.role}</span></td>
                    <td className="py-3">
                      {editCreditId === u.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-20 bg-black border border-white/20 rounded px-2 py-1"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(parseInt(e.target.value))}
                          />
                          <button onClick={() => handleUpdateCredits(u.id)} className="text-green-400">✓</button>
                          <button onClick={() => setEditCreditId(null)} className="text-red-400">✕</button>
                        </div>
                      ) : (
                        <span className="font-bold text-indigo-400">{u.credits}</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                       <button 
                        onClick={() => { setEditCreditId(u.id); setCreditAmount(u.credits); }}
                        className="text-gray-400 hover:text-white text-xs underline"
                       >
                         Manage Credits
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
             <div className="mb-4 text-xs text-gray-400">Total Requests: {requests.length} | Showing most recent</div>
             <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 pl-2">Time</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Storage Path (VPS)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {requests.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 pl-2 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-gray-400 text-xs">{r.userId}</td>
                    <td className="py-3">{r.type}</td>
                    <td className="py-3"><Badge status={r.status} /></td>
                    <td className="py-3 font-mono text-[10px] text-gray-500 truncate max-w-[150px]">
                      {r.localPath}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl">
            <h3 className="text-lg font-bold mb-4">System Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">File Retention Period (Days)</label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="number" 
                    value={config.retentionDays} 
                    onChange={(e) => setConfig({...config, retentionDays: parseInt(e.target.value)})}
                  />
                  <span className="text-xs text-gray-500">Files older than this are deleted by cron.</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cost per Image</label>
                  <Input 
                    type="number" 
                    value={config.costPerImage} 
                    onChange={(e) => setConfig({...config, costPerImage: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cost per Video</label>
                  <Input 
                    type="number" 
                    value={config.costPerVideo} 
                    onChange={(e) => setConfig({...config, costPerVideo: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button onClick={handleSaveConfig}>Save Configuration</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};