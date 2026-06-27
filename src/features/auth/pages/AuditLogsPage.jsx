import React, { useState, useEffect } from 'react';
import { 
  Terminal, Search, Shield, X, Copy, Check, Filter, 
  AlertCircle, CheckCircle, Globe, Cpu, Database, Calendar, Eye, Loader2 
} from 'lucide-react';
import { auditLogRepository } from '../../../repositories';
import { motion, AnimatePresence } from 'framer-motion';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState('ALL_TIME'); // ALL_TIME, TODAY, WEEK, MONTH
  
  // UI States
  const [copiedKey, setCopiedKey] = useState(null); // 'old' | 'new' | null

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditLogRepository.getLogs();
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Get unique list of modules for filter dropdown
  const modulesList = ['ALL', ...new Set(logs.map(log => log.module).filter(Boolean))];

  // Helper to parse date string for range check
  const isWithinDateRange = (timestampStr, range) => {
    if (range === 'ALL_TIME') return true;
    const logDate = new Date(timestampStr);
    const now = new Date();
    
    if (range === 'TODAY') {
      return logDate.toDateString() === now.toDateString();
    }
    
    if (range === 'WEEK') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return logDate >= sevenDaysAgo;
    }
    
    if (range === 'MONTH') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return logDate >= thirtyDaysAgo;
    }
    
    return true;
  };

  // Format JSON values cleanly in codeblocks
  const renderJSON = (valStr) => {
    if (!valStr || valStr === 'N/A') return <span className="text-slate-500 font-medium text-2xs italic">N/A</span>;
    try {
      const parsed = JSON.parse(valStr);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return valStr;
    }
  };

  // Check if string is parseable JSON
  const isJSON = (valStr) => {
    if (!valStr || valStr === 'N/A') return false;
    try {
      JSON.parse(valStr);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Simplify UserAgent into browser/device for cleaner drawer visualization
  const parseUserAgent = (ua) => {
    if (!ua) return 'Unknown Client';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS Mobile Device';
    if (ua.includes('Android')) return 'Android Mobile Device';
    if (ua.includes('Macintosh')) return 'Mac OS Desktop';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Linux')) return 'Linux Desktop';
    if (ua.includes('NodeJS') || ua.includes('Node.js')) return 'System Process / Backend API';
    return ua.substring(0, 35) + '...';
  };

  // Filter logs locally
  const filteredLogs = logs.filter(log => {
    // 1. Module filter
    if (selectedModule !== 'ALL' && log.module !== selectedModule) return false;
    
    // 2. Status filter
    if (selectedStatus !== 'ALL') {
      const isSuccess = log.success !== false;
      const targetSuccess = selectedStatus === 'SUCCESS';
      if (isSuccess !== targetSuccess) return false;
    }

    // 3. Date range filter
    if (!isWithinDateRange(log.timestamp, selectedDateRange)) return false;

    // 4. Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action?.toLowerCase().includes(q);
      const matchActor = log.performedBy?.toLowerCase().includes(q);
      const matchEntityId = log.entityId?.toLowerCase().includes(q);
      const matchEntityType = log.entityType?.toLowerCase().includes(q);
      const matchModule = log.module?.toLowerCase().includes(q);
      
      if (!matchAction && !matchActor && !matchEntityId && !matchEntityType && !matchModule) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 text-slate-350 pb-12 select-none relative overflow-x-hidden">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="text-emerald-500" size={24} />
            <span>Platform Audit Log Console</span>
          </h2>
          <p className="text-xs text-slate-450 mt-1">Review operational log events, telemetry data, configurations edits, and profile assignments.</p>
        </div>
        
        <button
          onClick={fetchLogs}
          className="bg-white border border-slate-200 hover:bg-slate-100 active:scale-97 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 self-start md:self-center"
        >
          <Database size={14} />
          <span>Reload Registry</span>
        </button>
      </div>

      {/* Filter Toolbar Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <label className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">Search Logs</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search action, actor, entity id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-2xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Module filter */}
        <div>
          <label className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">Module Section</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-350 text-2xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            {modulesList.map(mod => (
              <option key={mod} value={mod}>
                {mod === 'ALL' ? 'All Modules' : mod}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">Result Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-350 text-2xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
          </select>
        </div>

        {/* Date Range filter */}
        <div>
          <label className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">Time Interval</label>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-350 text-2xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="ALL_TIME">All Time</option>
            <option value="TODAY">Today (Last 24h)</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 size={36} className="animate-spin text-emerald-500" />
            <span className="text-xs font-semibold">Reading system audit registries...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-200 text-slate-500 rounded-xl space-y-1">
            <p className="text-xs font-bold text-slate-600">No matching audit trail records found.</p>
            <p className="text-2xs font-medium">Verify your query criteria or clear filter variables.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-white/30 text-3xs font-extrabold text-slate-600 uppercase tracking-widest select-none">
                  <th className="py-4 px-5">Timestamp</th>
                  <th className="py-4 px-5">Actor / Email</th>
                  <th className="py-4 px-5">Module</th>
                  <th className="py-4 px-5">Action Event</th>
                  <th className="py-4 px-5">Outcome</th>
                  <th className="py-4 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs">
                {filteredLogs.map((log) => {
                  const isSuccess = log.success !== false;
                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-white/30 transition-all cursor-pointer"
                    >
                      <td className="py-4 px-5 text-slate-500 font-medium text-2xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-600" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-350 tracking-wide">{log.performedBy || 'System'}</span>
                            <span className="text-3xs uppercase tracking-wider font-extrabold text-emerald-450">{log.role || 'System'}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-5 text-2xs font-bold uppercase tracking-wider text-slate-450">
                        {log.module}
                      </td>
                      
                      <td className="py-4 px-5 font-medium text-slate-700 text-xs max-w-xs truncate">
                        {log.action}
                      </td>
                      
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-widest ${
                          isSuccess 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' 
                            : 'bg-rose-950/60 text-rose-400 border border-rose-900/30'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{isSuccess ? 'Success' : 'Failure'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-500 transition-all active:scale-90"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Side Drawer using Framer Motion */}
      <AnimatePresence>
        {selectedLog && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[650px] bg-slate-50 border-l border-slate-200 shadow-2xl overflow-y-auto flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white/40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <Terminal className="text-emerald-500" size={18} />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Log Audit Telemetry</h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 text-slate-600 rounded-lg transition-all active:scale-95"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Banner */}
                <div className={`p-4 rounded-xl border flex gap-3.5 items-start ${
                  selectedLog.success !== false
                    ? 'bg-emerald-950/30 border-emerald-900/35 text-emerald-350'
                    : 'bg-rose-950/30 border-rose-900/35 text-rose-350'
                }`}>
                  {selectedLog.success !== false ? (
                    <CheckCircle className="shrink-0 mt-0.5" size={20} />
                  ) : (
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  )}
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {selectedLog.action}
                    </h4>
                    <p className="text-2xs font-medium text-slate-450 leading-relaxed">
                      Module component: <strong className="text-slate-700 font-semibold">{selectedLog.module}</strong>
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/40 border border-slate-200/60 rounded-xl p-3.5 space-y-1.5">
                    <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest block">Operator Profile</span>
                    <span className="text-2xs font-bold text-slate-900 block">{selectedLog.performedBy || 'System'}</span>
                    <span className="text-3xs font-extrabold text-emerald-450 uppercase tracking-wider block bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded-md self-start w-fit">
                      {selectedLog.role || 'System'}
                    </span>
                  </div>

                  <div className="bg-white/40 border border-slate-200/60 rounded-xl p-3.5 space-y-1.5">
                    <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest block">Registered Time</span>
                    <span className="text-2xs font-bold text-slate-900 block">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </span>
                    <span className="text-3xs font-semibold text-slate-500 block">
                      {new Date(selectedLog.timestamp).toISOString()}
                    </span>
                  </div>

                  <div className="bg-white/40 border border-slate-200/60 rounded-xl p-3.5 space-y-1.5 col-span-2">
                    <div className="flex justify-between items-center">
                      <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">Client Metadata</span>
                      <div className="flex gap-2.5 items-center">
                        <span className="text-3xs font-bold text-slate-600 flex items-center gap-1">
                          <Globe size={11} className="text-slate-500" />
                          <span>IP: {selectedLog.ipAddress || 'N/A'}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-2xs text-slate-350 font-medium">
                      <Cpu size={13} className="text-slate-500 shrink-0" />
                      <span>{parseUserAgent(selectedLog.device)}</span>
                    </div>
                    <span className="text-3xs text-slate-550 font-medium truncate block leading-none">
                      UA: {selectedLog.device || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-white/40 border border-slate-200/60 rounded-xl p-3.5 space-y-1.5 col-span-2">
                    <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest block">Affected Entity Reference</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-2xs text-slate-600 font-bold uppercase tracking-wider">
                        {selectedLog.entityType || 'N/A'}
                      </span>
                      <span className="text-2xs font-bold text-slate-900 font-mono break-all select-all">
                        ID: {selectedLog.entityId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diff Viewer (Old vs New Value Comparison) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Database State Comparison</h4>
                  
                  <div className="flex flex-col gap-4">
                    {/* Old Value */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">Previous Document State (Old)</span>
                        {selectedLog.oldValue && selectedLog.oldValue !== 'N/A' && (
                          <button
                            onClick={() => handleCopy(selectedLog.oldValue, 'old')}
                            className="text-3xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded transition-all active:scale-95"
                          >
                            {copiedKey === 'old' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            <span>{copiedKey === 'old' ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-white/60 border border-slate-200 p-4 rounded-xl max-h-56 overflow-y-auto font-mono">
                        {isJSON(selectedLog.oldValue) ? (
                          <pre className="text-2xs text-slate-600 leading-relaxed tab-size-2">
                            {renderJSON(selectedLog.oldValue)}
                          </pre>
                        ) : (
                          <span className="text-slate-350 text-2xs font-medium whitespace-pre-wrap">{selectedLog.oldValue || 'N/A'}</span>
                        )}
                      </div>
                    </div>

                    {/* New Value */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-3xs font-extrabold text-emerald-500 uppercase tracking-widest">Modified Document State (New)</span>
                        {selectedLog.newValue && selectedLog.newValue !== 'N/A' && (
                          <button
                            onClick={() => handleCopy(selectedLog.newValue, 'new')}
                            className="text-3xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded transition-all active:scale-95"
                          >
                            {copiedKey === 'new' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            <span>{copiedKey === 'new' ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-white/60 border border-slate-200 p-4 rounded-xl max-h-56 overflow-y-auto font-mono">
                        {isJSON(selectedLog.newValue) ? (
                          <pre className="text-2xs text-emerald-400/90 leading-relaxed tab-size-2">
                            {renderJSON(selectedLog.newValue)}
                          </pre>
                        ) : (
                          <span className="text-emerald-450/90 text-2xs font-medium whitespace-pre-wrap">{selectedLog.newValue || 'N/A'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AuditLogsPage;
