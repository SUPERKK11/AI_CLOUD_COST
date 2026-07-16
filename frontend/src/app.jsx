import React, { useState, useMemo } from 'react';
import { Search, Info, ArrowUp, ArrowDown, Download, Calendar, Activity, Server, HardDrive } from 'lucide-react';

function App() {
  const [region, setRegion] = useState('us-east-1');
  const [resources, setResources] = useState([]);
  const [aiReport, setAiReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setLoading(true);
    setError('');
    setAiReport('');
    try {
      const response = await fetch('http://localhost:8000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to scan');
      setResources(data.resources);
      setAiReport(data.ai_report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs based on resources
  const metrics = useMemo(() => {
    const total = resources.length;
    const unattached = resources.filter(r => r.state.includes('Unattached')).length;
    const active = total - unattached;
    const optimizationScore = total === 0 ? 0 : Math.round((active / total) * 100);
    const wasteRate = total === 0 ? 0 : Math.round((unattached / total) * 100);
    
    return { total, unattached, active, optimizationScore, wasteRate };
  }, [resources]);

  const getIcon = (type) => {
    if (type.includes('EC2')) return <Server className="w-4 h-4 text-indigo-500" />;
    return <HardDrive className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans p-4 md:p-6 flex flex-col md:flex-row gap-6">
      
      {/* LEFT PANEL: Sidebar Metrics */}
      <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex-grow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Cost Waste Rate <Info className="w-4 h-4 text-slate-400" />
            </h2>
          </div>
          
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-extrabold text-slate-900">{metrics.wasteRate}%</span>
            <span className="flex items-center text-sm font-semibold text-emerald-500">
              <ArrowUp className="w-4 h-4" /> 2%
            </span>
          </div>

          {/* CSS Mockup of a Gauge Chart Arch */}
          <div className="relative w-full aspect-[2/1] overflow-hidden mb-8 flex justify-center">
            <div className="absolute top-0 w-[200px] h-[200px] rounded-full border-[24px] border-slate-100 border-t-emerald-400 border-l-emerald-400 border-r-amber-400 rotate-45"></div>
            <div className="absolute bottom-0 w-2 h-2 bg-slate-800 rounded-full"></div>
            <div className="absolute bottom-1 w-[80px] h-1 bg-slate-400 origin-right -rotate-[30deg] right-1/2 rounded-full"></div>
            <div className="absolute bottom-0 left-0 text-xs font-bold text-slate-500">0%</div>
            <div className="absolute bottom-0 right-0 text-xs font-bold text-slate-500">100%</div>
          </div>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Highest Waste By Resource Type
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50">
              <span className="text-sm font-medium">EBS Volumes</span>
              <div className="flex gap-4">
                <span className="text-sm font-medium">{metrics.unattached}</span>
                <span className="text-xs text-amber-500 flex items-center"><ArrowUp className="w-3 h-3" /> High</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-50">
              <span className="text-sm font-medium">EC2 Instances</span>
              <div className="flex gap-4">
                <span className="text-sm font-medium">0</span>
                <span className="text-xs text-emerald-500 flex items-center"><ArrowDown className="w-3 h-3" /> Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Main Content */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">AWS Infrastructure Adoption</h1>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Ready to Scan
            </span>
            <div className="flex bg-white border border-slate-200 rounded-lg p-1">
               <select 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 cursor-pointer"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                </select>
            </div>
            <button 
              onClick={handleScan}
              disabled={loading}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? 'Scanning...' : <><Search className="w-4 h-4" /> Initialize Scan</>}
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-50">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium">
            Error: {error}
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#eef2ff] to-[#f5f3ff] rounded-xl p-5 border border-indigo-50 shadow-sm relative overflow-hidden">
            <h3 className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1.5">
              Infrastructure Score <Info className="w-3.5 h-3.5 text-indigo-400" />
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-indigo-950">{metrics.optimizationScore}</span>
              <span className="text-sm font-semibold text-emerald-600 flex items-center"><ArrowUp className="w-4 h-4" /> 4%</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              Total Assets Scanned <Info className="w-3.5 h-3.5 text-slate-300" />
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">{metrics.total}</span>
              <span className="text-sm font-semibold text-emerald-500 flex items-center"><ArrowUp className="w-4 h-4" /> 8%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              Active Resources <Info className="w-3.5 h-3.5 text-slate-300" />
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">{metrics.active}</span>
              <span className="text-sm font-semibold text-emerald-500 flex items-center"><ArrowUp className="w-4 h-4" /> 2%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              Unattached (Waste) <Info className="w-3.5 h-3.5 text-slate-300" />
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">{metrics.unattached}</span>
              <span className="text-sm font-semibold text-amber-500 flex items-center"><ArrowDown className="w-4 h-4" /> 12%</span>
            </div>
          </div>
        </div>

        {/* Heatmap/Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Resource Configuration Matrix <Info className="w-4 h-4 text-slate-400" />
              </h2>
              <p className="text-xs text-slate-500 mt-1">Measures infrastructure usage against active deployments | Data Period: Real-time</p>
            </div>
            <button className="text-sm font-medium text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Calendar className="w-4 h-4" /> View Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-2">Resource</th>
                  <th className="px-4 py-2">System ID</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Configuration</th>
                </tr>
              </thead>
              <tbody>
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl">
                      Click 'Initialize Scan' to populate matrix.
                    </td>
                  </tr>
                ) : (
                  resources.map((res, idx) => {
                    const isWasting = res.state.includes('Unattached');
                    // Simulating the purple pill look from the image for rows
                    const bgClass = isWasting ? 'bg-indigo-50 border-indigo-100' : 'bg-[#f4f7fb] border-slate-100';
                    return (
                      <tr key={idx} className={`${bgClass} border rounded-xl shadow-sm transition-transform hover:scale-[1.01]`}>
                        <td className="px-4 py-3 rounded-l-xl border-y border-l border-inherit">
                          <div className="flex items-center gap-2 font-semibold text-slate-700">
                            {getIcon(res.type)} {res.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 border-y border-inherit">{res.id}</td>
                        <td className="px-4 py-3 border-y border-inherit">
                           <span className={`text-xs font-bold ${isWasting ? 'text-indigo-600' : 'text-slate-600'}`}>
                             {res.state}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 rounded-r-xl border-y border-r border-inherit">
                          {res.details}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Report / Trends Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex-grow">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                AI Optimization Insights <Info className="w-4 h-4 text-slate-400" />
              </h2>
              <p className="text-xs text-slate-500 mt-1">Generated by Gemini Advanced Analysis</p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-6 min-h-[200px]">
             {loading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="flex gap-2"><div className="h-8 bg-indigo-100 rounded w-8"></div><div className="h-8 bg-slate-200 rounded w-full"></div></div>
                  <div className="flex gap-2"><div className="h-8 bg-indigo-100 rounded w-8"></div><div className="h-8 bg-slate-200 rounded w-5/6"></div></div>
                </div>
              )}

              {!loading && !aiReport && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                  <Activity className="w-8 h-8 mb-3 text-slate-300" />
                  <p className="text-sm font-medium">Awaiting infrastructure scan data...</p>
                </div>
              )}

              {aiReport && (
                <div className="prose prose-sm max-w-none text-slate-700">
                  {aiReport.split('\n').map((line, i) => {
                    if (line.startsWith('###')) return <h3 key={i} className="text-indigo-900 mt-4 mb-2 font-bold">{line.replace('###', '')}</h3>;
                    if (line.startsWith('-')) return <div key={i} className="flex gap-3 mb-3"><div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">{i}</div><p className="m-0 leading-relaxed pt-1">{line.replace('-', '').trim()}</p></div>;
                    return <p key={i} className="mb-3 leading-relaxed">{line}</p>;
                  })}
                </div>
              )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;