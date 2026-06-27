import React, { useState, useEffect } from 'react';
import { Shield, Users, Check, AlertTriangle, Search, Info, Loader2, Lock, RefreshCw } from 'lucide-react';
import { roleRepository, authRepository } from '../../../repositories';
import { useAuth } from '../hooks/useAuth';
import { Permissions } from '../permissions/permissions';
import { motion, AnimatePresence } from 'framer-motion';

const PERMISSION_GROUPS = {
  'Customer Actions': [
    { key: Permissions.VIEW_CUSTOMER_DASHBOARD, label: 'Access Customer Dashboard', desc: 'Allows access to the customer-facing booking panel.' },
    { key: Permissions.CREATE_BOOKING, label: 'Book Court Slots', desc: 'Allows making court slot reservations.' },
    { key: Permissions.CANCEL_OWN_BOOKING, label: 'Cancel Own Bookings', desc: 'Allows users to cancel reservations they made.' },
    { key: Permissions.SUBMIT_REVIEW, label: 'Submit Reviews', desc: 'Allows reviewing venues and courts after slot usage.' }
  ],
  'Staff Operations': [
    { key: Permissions.VIEW_STAFF_DASHBOARD, label: 'Access Staff Dashboard', desc: 'Allows gatekeeper check-ins and operational schedules.' },
    { key: Permissions.WALK_IN_BOOKING, label: 'Walk-In Booking Override', desc: 'Allows creation of manual bookings at the counter.' },
    { key: Permissions.OVERRIDE_SLOT, label: 'Block/Override Slots', desc: 'Allows operational blocking of slots for maintenance.' },
    { key: Permissions.LOOKUP_CUSTOMER, label: 'Lookup Customer Profiles', desc: 'Allows looking up customer phone, history, and email.' },
    { key: Permissions.CHECK_IN_CUSTOMER, label: 'Check-In Customers', desc: 'Allows checking in players when they arrive.' }
  ],
  'System Administration': [
    { key: Permissions.VIEW_ADMIN_DASHBOARD, label: 'Access Admin Dashboard', desc: 'Allows entry to the global overview charts and dashboards.' },
    { key: Permissions.MANAGE_VENUES, label: 'Manage Venue Configuration', desc: 'Allows creation, edits, and business hours of venues.' },
    { key: Permissions.MANAGE_COURTS, label: 'Manage Courts List', desc: 'Allows adding, editing, and deleting courts.' },
    { key: Permissions.MANAGE_SLOTS, label: 'Manage Slot Schedules', desc: 'Allows configuring slot times and pricing rules.' },
    { key: Permissions.MANAGE_BOOKINGS, label: 'Manage Bookings Registry', desc: 'Allows rescheduling, cancelling, and force refunds.' },
    { key: Permissions.INITIATE_REFUND, label: 'Initiate Booking Refunds', desc: 'Allows refunding payments via connected gateways.' },
    { key: Permissions.MANAGE_STAFF, label: 'Manage Personnel Tiers', desc: 'Allows promoting/demoting organizational staff.' },
    { key: Permissions.MANAGE_COUPONS, label: 'Manage Promotional Coupons', desc: 'Allows creating discount coupons.' },
    { key: Permissions.VIEW_REPORTS, label: 'Access Analytics & Reports', desc: 'Allows downloading operational reports.' },
    { key: Permissions.ADMIN_ANNOUNCEMENTS, label: 'Broadcast System Announcements', desc: 'Allows writing admin news/announcements.' },
    { key: Permissions.MANAGE_SETTINGS, label: 'Manage Global Settings', desc: 'Allows updating core platform features.' },
    { key: Permissions.MANAGE_PERMISSIONS, label: 'Configure Capabilities Matrix', desc: 'Allows modifying security permissions profiles.' },
    { key: Permissions.VIEW_AUDIT_LOGS, label: 'View Platform Audit Trail', desc: 'Allows tracking system-wide activity logs.' }
  ]
};

export const RolesPermissionsPage = () => {
  const { currentUser, refreshPermissions } = useAuth();
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'users'
  
  // Tab 1 (Matrix) States
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [savingMatrix, setSavingMatrix] = useState(false);
  
  // Tab 2 (Users) States
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUserRole, setUpdatingUserRole] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const triggerToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchRolesData = async () => {
    setLoadingRoles(true);
    try {
      const data = await roleRepository.getRoles();
      setRoles(data);
      if (data.length > 0) {
        // Default select admin or first role
        const defaultRole = data.find(r => r.id === 'admin') || data[0];
        setSelectedRole(defaultRole);
        setSelectedPermissions(defaultRole.permissions || []);
      }
    } catch (err) {
      triggerToast('Failed to load roles list', 'error');
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUsersData = async () => {
    setLoadingUsers(true);
    try {
      const data = await authRepository.getAllUsers();
      setUsers(data);
    } catch (err) {
      triggerToast('Failed to load users list', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsersData();
    }
  }, [activeTab]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
  };

  const handlePermissionToggle = (permKey) => {
    setSelectedPermissions(prev => 
      prev.includes(permKey)
        ? prev.filter(k => k !== permKey)
        : [...prev, permKey]
    );
  };

  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    setSavingMatrix(true);
    try {
      await roleRepository.updateRolePermissions(selectedRole.id, selectedPermissions);
      triggerToast(`Successfully updated permissions for ${selectedRole.name}!`);
      
      // Update local state roles
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: selectedPermissions } : r));
      
      // If we updated permissions of current user's role, refresh the cached permissions immediately
      if (currentUser && currentUser.role === selectedRole.id) {
        await refreshPermissions();
      }
    } catch (err) {
      triggerToast('Failed to update role permissions', 'error');
    } finally {
      setSavingMatrix(false);
    }
  };

  const handleUserRoleChange = async (userId, targetUserEmail, newRole) => {
    // Demote safety check: prevent self-demotion
    if (userId === currentUser?.uid) {
      triggerToast('Self-demotion protection: You cannot demote your own account.', 'error');
      return;
    }

    setUpdatingUserRole(userId);
    try {
      await roleRepository.assignRole(userId, newRole);
      triggerToast(`User role assigned successfully!`);
      // Update users list state
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      triggerToast('Failed to reassign user role', 'error');
    } finally {
      setUpdatingUserRole(null);
    }
  };

  // Filtered users for search query
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-350 pb-12 select-none">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-55 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 max-w-sm pointer-events-auto backdrop-blur-md ${
                toast.type === 'error' 
                  ? 'bg-rose-950/80 border-rose-800 text-rose-200' 
                  : 'bg-white/90 border-emerald-500/30 text-emerald-350'
              }`}
            >
              {toast.type === 'error' ? <AlertTriangle size={20} className="shrink-0" /> : <Check size={20} className="shrink-0" />}
              <div className="text-xs font-semibold">{toast.text}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="text-emerald-500" size={24} />
            <span>Roles & Permissions Security Center</span>
          </h2>
          <p className="text-xs text-slate-450 mt-1">Configure capability grids, action limits, and manage organizational profile tiers.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white border border-slate-200/80 rounded-xl p-1 shrink-0 self-start md:self-center">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'matrix' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950' 
                : 'text-slate-600 hover:text-slate-700'
            }`}
          >
            Capabilities Matrix
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'users' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950' 
                : 'text-slate-600 hover:text-slate-700'
            }`}
          >
            User Assignments
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'matrix' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Roles Selector Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Security Group</h3>
            {loadingRoles ? (
              <div className="flex items-center gap-2 text-xs py-4 text-slate-500">
                <Loader2 size={16} className="animate-spin text-emerald-500" />
                <span>Fetching security groups...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {roles.map((role) => {
                  const isSelected = selectedRole?.id === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border-emerald-500/50 shadow-md' 
                          : 'bg-white/50 border-slate-200/80 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-450' : 'text-slate-700'}`}>
                          {role.name}
                        </span>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow shadow-emerald-450" />}
                      </div>
                      <span className="text-2xs text-slate-450 leading-relaxed font-medium">
                        {role.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="bg-white/40 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex gap-2 text-emerald-450">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span className="text-2xs font-bold uppercase tracking-wider">Dynamic Matrix</span>
              </div>
              <p className="text-2xs text-slate-450 leading-relaxed font-medium">
                Permissions configured here are stored dynamically under the <code className="bg-slate-50 px-1 py-0.5 rounded text-slate-700">/roles</code> collection and evaluated instantly across route guards.
              </p>
            </div>
          </div>

          {/* Permissions Matrix Detail */}
          <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-white/70 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {selectedRole ? `${selectedRole.name} Permissions Matrix` : 'Permissions Matrix'}
                </h3>
                <p className="text-2xs text-slate-450 font-medium">Configure allowed actions and access bounds.</p>
              </div>

              <button
                onClick={handleSaveMatrix}
                disabled={savingMatrix || loadingRoles || !selectedRole}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow shadow-emerald-950 transition-all disabled:opacity-50"
              >
                {savingMatrix ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Apply Policy Matrix</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6 space-y-8">
              {Object.entries(PERMISSION_GROUPS).map(([groupName, permItems]) => (
                <div key={groupName} className="space-y-4">
                  <h4 className="text-2xs font-extrabold text-emerald-450 uppercase tracking-widest border-b border-slate-200 pb-1.5">
                    {groupName}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permItems.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => handlePermissionToggle(perm.key)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                            isChecked 
                              ? 'bg-white/60 border-slate-200 hover:bg-white' 
                              : 'bg-white/10 border-slate-200/40 hover:bg-white/30'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            isChecked 
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow shadow-emerald-900' 
                              : 'border-slate-200 bg-slate-50 text-transparent'
                          }`}>
                            <Check size={12} className="stroke-[3]" />
                          </div>
                          
                          <div className="space-y-0.5">
                            <div className={`text-2xs font-bold transition-all ${isChecked ? 'text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>
                              {perm.label}
                            </div>
                            <div className="text-2xs text-slate-500 leading-normal font-medium">
                              {perm.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: User Role Assignments Dashboard */
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Organizational Roles Registry</h3>
              <p className="text-2xs text-slate-450 mt-0.5">Assign administrative, cashier, or general guest access limits to users.</p>
            </div>
            
            {/* Search */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search user email or display name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* User List Table */}
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
              <span className="text-xs font-medium">Loading organizational directories...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl text-slate-500 space-y-1">
              <p className="text-xs font-semibold">No profile registers match your search query.</p>
              <p className="text-2xs font-medium">Try verifying spelling or clear query filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-2xs font-extrabold text-slate-600 uppercase tracking-widest">
                    <th className="pb-3 px-2">Member Profiles</th>
                    <th className="pb-3 px-2">Profile Email</th>
                    <th className="pb-3 px-2">Access Role Group</th>
                    <th className="pb-3 px-2">Account State</th>
                    <th className="pb-3 px-2">Enrollment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {filteredUsers.map((user) => {
                    const isSelf = user.uid === currentUser?.uid;
                    const isPendingUpdate = updatingUserRole === user.uid;
                    return (
                      <tr key={user.uid} className="hover:bg-white/30 transition-all text-xs">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.displayName || 'Default'}`}
                              alt={user.displayName}
                              className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm shrink-0"
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-900 tracking-wide flex items-center gap-1.5">
                                {user.displayName || 'System User'}
                                {isSelf && (
                                  <span className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-450 text-2xs px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase scale-90">
                                    You
                                  </span>
                                )}
                              </span>
                              <span className="text-2xs text-slate-500 font-medium">UID: {user.uid}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-2 text-slate-700 font-medium">
                          {user.email || 'N/A'}
                        </td>
                        
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            {isSelf ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-2xs font-bold uppercase tracking-wider cursor-not-allowed">
                                <Lock size={12} />
                                <span>{user.role || 'customer'}</span>
                              </div>
                            ) : (
                              <select
                                value={user.role || 'customer'}
                                disabled={isPendingUpdate}
                                onChange={(e) => handleUserRoleChange(user.uid, user.email, e.target.value)}
                                className="bg-white border border-slate-200 text-slate-350 text-2xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500/50 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                              >
                                <option value="customer">Customer</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}

                            {isPendingUpdate && (
                              <Loader2 size={14} className="animate-spin text-emerald-500" />
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase tracking-widest ${
                            user.isActive !== false 
                              ? 'bg-emerald-950/65 text-emerald-400 border border-emerald-900/30' 
                              : 'bg-rose-950/65 text-rose-400 border border-rose-900/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{user.isActive !== false ? 'Active' : 'Banned'}</span>
                          </span>
                        </td>
                        
                        <td className="py-4 px-2 text-slate-500 text-2xs font-medium">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'System Origin'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsPage;
