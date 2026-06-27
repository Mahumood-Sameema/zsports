// CustomersPage Component
import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authRepository } from '../../../repositories';
import { Search, UserCheck, UserX, Download, ExternalLink, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import { format, parseISO } from 'date-fns';

export const CustomersPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all users
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => authRepository.getAllUsers()
  });

  // Filter for customers only, and match search query
  const customers = useMemo(() => {
    return users
      .filter(u => u.role === 'customer')
      .filter(u => 
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery))
      );
  }, [users, searchQuery]);

  const handleToggleStatus = async (uid, currentActive) => {
    try {
      await authRepository.updateUserProfile(uid, { isActive: !currentActive });
      queryClient.invalidateQueries(['admin-all-users']);
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = 'Customer ID,Name,Email,Phone,Active Status,Joined Date\n';
    const rows = customers.map(c => 
      `"${c.uid}","${c.displayName}","${c.email}","${c.phone || 'N/A'}",${c.isActive ? 'Active' : 'Disabled'},"${c.createdAt || 'N/A'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ZSports_Customers_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <LoadingCard message="Loading customer index..." />;
  if (isError) return <ErrorState message="Failed to load customer list." />;

  return (
    <div className="space-y-6 text-slate-700 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Database</h2>
          <p className="text-xs text-slate-600 mt-1">Monitor user account statuses, inspect profiles, and download user statements.</p>
        </div>

        {customers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportCSV}
            className="text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            Export CSV
          </Button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md bg-slate-50/20">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full rounded border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 transition-colors"
        />
      </div>

      {/* Table */}
      {customers.length === 0 ? (
        <div className="p-8 bg-slate-50/10 border border-dashed border-slate-200 text-slate-500 font-medium text-center rounded-xl">
          <p className="text-sm">No customers match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/20">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-350 font-medium">
            <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3.5 text-left">Customer</th>
                <th className="px-6 py-3.5 text-left">Email</th>
                <th className="px-6 py-3.5 text-left">Phone</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-left">Member Since</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-855 bg-white/30">
              {customers.map((c) => (
                <tr key={c.uid} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 truncate font-bold text-slate-900 max-w-[150px]">{c.displayName}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <Mail size={12} className="text-slate-500" /> {c.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-500" /> {c.phone}
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.isActive ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 border border-emerald-500/20 rounded font-semibold uppercase">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] bg-red-500/10 text-accent-red px-2 py-0.5 border border-red-500/20 rounded font-semibold uppercase">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.createdAt ? (
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Calendar size={12} className="text-slate-500" />
                        {format(parseISO(c.createdAt), 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span className="text-slate-550 italic">Legacy</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Enable/Disable account */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(c.uid, c.isActive)}
                        className={`!p-1.5 ${
                          c.isActive ? 'text-accent-red hover:bg-red-950/20' : 'text-emerald-500 hover:bg-emerald-950/20'
                        }`}
                        aria-label={c.isActive ? 'Disable User' : 'Enable User'}
                      >
                        {c.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
