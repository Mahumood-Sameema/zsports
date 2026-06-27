// StaffManagementPage Component
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { authRepository, venueRepository } from '../../../repositories';
import { Users, Mail, MapPin, UserPlus, ShieldAlert, KeyRound, Ban, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';

const inviteSchema = zod.object({
  displayName: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  role: zod.enum(['staff', 'admin']),
  venueId: zod.string().optional(),
}).refine((data) => {
  if (data.role === 'staff' && !data.venueId) {
    return false;
  }
  return true;
}, {
  message: 'Please assign a venue center for gate staff',
  path: ['venueId']
});

export const StaffManagementPage = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch all users
  const { data: users = [], isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => authRepository.getAllUsers()
  });

  // 2. Fetch all venues for assignment dropdowns
  const { data: venues = [], isLoading: venuesLoading, isError: venuesError } = useQuery({
    queryKey: ['all-venues-raw'],
    queryFn: () => venueRepository.getVenues()
  });

  // Display both staff and admins in list
  const memberList = users.filter(u => u.role === 'staff' || u.role === 'admin');

  // React hook form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { displayName: '', email: '', role: 'staff', venueId: '' }
  });

  const selectedRole = watch('role');

  const onInviteStaff = async (data) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      // Check if user email already exists
      const exists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email address already exists.');
      }

      // Generate standard default password depending on role
      const defaultPassword = data.role + '123';

      // Register account in auth repository
      const invited = await authRepository.registerWithEmail(
        data.email,
        defaultPassword,
        data.displayName
      );

      // Re-assign role (staff/admin) and attach venueId if staff
      await authRepository.updateUserProfile(invited.uid, {
        role: data.role,
        venueId: data.role === 'staff' ? data.venueId : null
      });

      queryClient.invalidateQueries(['admin-all-users']);
      setSuccessMsg(`Invitation dispatched: User ${data.displayName} has been added as ${data.role.toUpperCase()}.`);
      reset();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Invitation request failed.');
    }
  };

  const handleToggleStatus = async (uid, currentActive) => {
    try {
      await authRepository.updateUserProfile(uid, { isActive: !currentActive });
      queryClient.invalidateQueries(['admin-all-users']);
    } catch (err) {
      alert(err.message || 'Failed to update account status.');
    }
  };

  const handleReassignVenue = async (uid, newVenueId) => {
    try {
      await authRepository.updateUserProfile(uid, { venueId: newVenueId });
      queryClient.invalidateQueries(['admin-all-users']);
      alert('Reassign Venue: Venue reassigned successfully.');
    } catch (err) {
      alert(err.message || 'Failed to reassign venue.');
    }
  };

  if (usersLoading || venuesLoading) return <LoadingCard message="Loading staff rosters..." />;
  if (usersError || venuesError) return <ErrorState message="Could not compile staff records." />;

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Staff & Admin Management Console</h2>
        <p className="text-xs text-slate-600 mt-1">
          Invite operational staff, delegate admin permissions, and assign assistant nodes to sport venues.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500 rounded flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-accent-red rounded">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invitation Panel Form */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-5 h-fit shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <UserPlus size={15} className="text-primary" /> Invite Team Member
            </h3>
            <p className="text-3xs text-slate-500 mt-1">
              Default password will be set to: <code>{selectedRole}123</code>
            </p>
          </div>

          <form onSubmit={handleSubmit(onInviteStaff)} className="space-y-4 text-neutral-600">
            <Input
              label="Display Name"
              type="text"
              placeholder="e.g. Rohan Sharma"
              error={errors.displayName}
              className="!text-slate-700"
              {...register('displayName')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. rohan@zsports.com"
              error={errors.email}
              className="!text-slate-700"
              {...register('email')}
            />

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Assign Role
              </label>
              <select
                className="block w-full rounded border py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-700 bg-slate-50 border-slate-200 transition-colors"
                {...register('role')}
              >
                <option value="staff">Staff (Venue Gatekeeper)</option>
                <option value="admin">Admin (System Console Operator)</option>
              </select>
            </div>

            {selectedRole === 'staff' && (
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Assigned Turf Venue
                </label>
                <select
                  className={`block w-full rounded border py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-700 bg-slate-50 border-slate-200 transition-colors ${
                    errors.venueId ? 'border-accent-red' : ''
                  }`}
                  {...register('venueId')}
                >
                  <option value="">-- Choose Venue Center --</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                {errors.venueId && (
                  <p className="mt-1 text-xs text-accent-red font-medium">{errors.venueId.message}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              fullWidth
            >
              Add Team Member
            </Button>
          </form>
        </div>

        {/* Staff Members List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
            <Users size={15} className="text-primary" /> Core Team Roster ({memberList.length})
          </h3>

          {memberList.length === 0 ? (
            <p className="text-xs font-semibold text-slate-500 py-8 text-center">No team accounts registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-350">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Member Details</th>
                    <th className="px-5 py-3 text-left">Venue Center</th>
                    <th className="px-5 py-3 text-left">Account Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {memberList.map((member) => {
                    return (
                      <tr key={member.uid} className="hover:bg-slate-50/20 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 block">{member.displayName}</span>
                          <span className="text-[10px] text-slate-550 block mt-0.5">{member.email}</span>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300/50 mt-1.5 uppercase select-none">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {member.role === 'admin' ? (
                            <span className="text-2xs text-slate-500 font-semibold italic">Platform Scope</span>
                          ) : (
                            <select
                              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-3xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
                              value={member.venueId || ''}
                              onChange={(e) => handleReassignVenue(member.uid, e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {venues.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {member.isActive ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                              Active
                            </span>
                          ) : (
                            <span className="text-[9px] bg-red-500/10 text-accent-red border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(member.uid, member.isActive)}
                            className={`!p-1 ${
                              member.isActive ? 'text-accent-red hover:bg-red-950/20' : 'text-emerald-500 hover:bg-emerald-950/20'
                            }`}
                            aria-label={member.isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {member.isActive ? <Ban size={13} /> : <KeyRound size={13} />}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManagementPage;
