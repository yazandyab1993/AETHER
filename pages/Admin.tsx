import React, { useState, useEffect } from 'react';
import { User, UserRole, GenerationRequest, RequestStatus, AIModel } from '../types';
import { getUsers, getRequests, getConfig, updateConfig, updateUserCredits, getModels, createModel, updateModel, deleteModel } from '../services/mockBackend';
import { Button, Card, Input, Badge } from '../components/UI';

export const Admin = ({ currentUser }: { currentUser: User }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [config, setConfig] = useState(getConfig());
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'settings' | 'models'>('users');

  // Local state for editing credits
  const [editCreditId, setEditCreditId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);

  // Model management state
  const [showAddModel, setShowAddModel] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [modelForm, setModelForm] = useState<Omit<AIModel, 'id'>>({
    name: '',
    description: '',
    costPerGeneration: 5,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    defaultDuration: 5,
    defaultCfgScale: 0.5,
    isActive: true
  });

  useEffect(() => {
    setUsers(getUsers());
    setRequests(getRequests());
    setModels(getModels());
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

  const handleSaveModel = () => {
    if (editingModel) {
      // Update existing model
      updateModel(editingModel.id, modelForm);
    } else {
      // Create new model
      createModel(modelForm);
    }
    setModels(getModels()); // Refresh models
    setShowAddModel(false);
    setEditingModel(null);
    resetModelForm();
  };

  const handleEditModel = (model: AIModel) => {
    setEditingModel(model);
    setModelForm({
      name: model.name,
      description: model.description,
      costPerGeneration: model.costPerGeneration,
      maxDuration: model.maxDuration,
      supportsImageToVideo: model.supportsImageToVideo,
      supportsTextToVideo: model.supportsTextToVideo,
      defaultDuration: model.defaultDuration,
      defaultCfgScale: model.defaultCfgScale,
      isActive: model.isActive
    });
    setShowAddModel(true);
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm("Are you sure you want to delete this model? This action cannot be undone.")) {
      deleteModel(modelId);
      setModels(getModels()); // Refresh models
    }
  };

  const resetModelForm = () => {
    setModelForm({
      name: '',
      description: '',
      costPerGeneration: 5,
      maxDuration: 10,
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      defaultDuration: 5,
      defaultCfgScale: 0.5,
      isActive: true
    });
  };

  const handleAddUser = () => {
    const email = prompt("Enter new user's email:");
    if (email) {
      const password = prompt("Enter new user's password:");
      if (password) {
        // In a real app, you would call an API to create a user
        alert("User creation would be implemented in a real application");
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      // In a real app, you would call an API to delete a user
      alert("User deletion would be implemented in a real application");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Console</h1>
        <div className="bg-white/5 p-1 rounded-lg flex space-x-1">
          {['users', 'requests', 'models', 'settings'].map((tab) => (
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Manage Users</h3>
              <button 
                onClick={handleAddUser}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add User
              </button>
            </div>
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
                        className="text-gray-400 hover:text-white text-xs underline mr-3"
                       >
                         Manage Credits
                       </button>
                       <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-400 hover:text-red-300 text-xs underline"
                       >
                         Delete User
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

        {activeTab === 'models' && (
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Manage AI Models</h3>
              <button 
                onClick={() => {
                  setEditingModel(null);
                  resetModelForm();
                  setShowAddModel(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add Model
              </button>
            </div>
            
            {showAddModel && (
              <div className="mb-6 p-4 bg-black/20 rounded-lg">
                <h4 className="text-md font-bold mb-3">{editingModel ? 'Edit' : 'Add'} AI Model</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Model Name</label>
                    <Input 
                      type="text" 
                      value={modelForm.name} 
                      onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                      placeholder="e.g., Kling v2.5 Pro"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Cost Per Generation</label>
                    <Input 
                      type="number" 
                      value={modelForm.costPerGeneration} 
                      onChange={(e) => setModelForm({...modelForm, costPerGeneration: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Duration (seconds)</label>
                    <Input 
                      type="number" 
                      value={modelForm.maxDuration} 
                      onChange={(e) => setModelForm({...modelForm, maxDuration: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Default Duration (seconds)</label>
                    <Input 
                      type="number" 
                      value={modelForm.defaultDuration} 
                      onChange={(e) => setModelForm({...modelForm, defaultDuration: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Default CFG Scale</label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={modelForm.defaultCfgScale} 
                      onChange={(e) => setModelForm({...modelForm, defaultCfgScale: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <Input 
                      type="text" 
                      value={modelForm.description} 
                      onChange={(e) => setModelForm({...modelForm, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="supportsImageToVideo" 
                      checked={modelForm.supportsImageToVideo} 
                      onChange={(e) => setModelForm({...modelForm, supportsImageToVideo: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="supportsImageToVideo" className="text-sm text-gray-400">Supports Image-to-Video</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="supportsTextToVideo" 
                      checked={modelForm.supportsTextToVideo} 
                      onChange={(e) => setModelForm({...modelForm, supportsTextToVideo: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="supportsTextToVideo" className="text-sm text-gray-400">Supports Text-to-Video</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      checked={modelForm.isActive} 
                      onChange={(e) => setModelForm({...modelForm, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-400">Active</label>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSaveModel} className="bg-green-600 hover:bg-green-700">
                    {editingModel ? 'Update' : 'Add'} Model
                  </Button>
                  <Button 
                    onClick={() => { 
                      setShowAddModel(false); 
                      setEditingModel(null); 
                      resetModelForm(); 
                    }} 
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Cost</th>
                  <th className="pb-3">Max Duration</th>
                  <th className="pb-3">Capabilities</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {models.map(model => (
                  <tr key={model.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 pl-2 font-bold">{model.name}</td>
                    <td className="py-3 text-sm text-gray-400">{model.description}</td>
                    <td className="py-3"><span className="font-bold text-indigo-400">{model.costPerGeneration} credits</span></td>
                    <td className="py-3">{model.maxDuration}s</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {model.supportsImageToVideo && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Image-to-Video</span>}
                        {model.supportsTextToVideo && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Text-to-Video</span>}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded ${model.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {model.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleEditModel(model)}
                        className="text-gray-400 hover:text-white text-xs underline mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteModel(model.id)}
                        className="text-red-400 hover:text-red-300 text-xs underline"
                      >
                        Delete
                      </button>
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