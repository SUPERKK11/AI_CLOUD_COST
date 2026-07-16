import React, { useState } from 'react';

function App() {
  const [region, setRegion] = useState('us-east-1');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to scan');
      setResources(data.resources);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-sky-400">AWS Cloud Cost Detective 🔍</h1>
          <p className="text-slate-400 mt-2">Identify hidden costs and over-provisioned AWS assets instantly.</p>
        </header>

        {/* Configuration Panel */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Target Region</label>
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-sky-500"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
            </select>
          </div>
          
          <button
            onClick={handleScan}
            disabled={loading}
            className="mt-5 bg-sky-500 hover:bg-sky-600 text-slate-900 font-bold px-6 py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Scanning Infrastructure...' : 'Scan AWS Resources'}
          </button>
        </div>

        {/* Error Messaging */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-200 p-4 rounded-lg mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Resources Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-700/50 text-slate-300 border-b border-slate-700 text-sm">
                <th className="p-4">Type</th>
                <th className="p-4">Name / ID</th>
                <th className="p-4">State</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No infrastructure data loaded. Click "Scan AWS Resources" to start.
                  </td>
                </tr>
              ) : (
                resources.map((res) => (
                  <tr key={res.id} className="border-b border-slate-700/50 hover:bg-slate-750 transition-colors text-sm">
                    <td className="p-4 font-semibold text-sky-400">{res.type}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{res.name}</div>
                      <div className="text-xs text-slate-400">{res.id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        res.state.includes('Unattached') ? 'bg-amber-900/60 text-amber-300 border border-amber-600' : 'bg-emerald-900/65 text-emerald-300'
                      }`}>
                        {res.state}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{res.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;