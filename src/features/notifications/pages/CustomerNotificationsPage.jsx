// CustomerNotificationsPage Component
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { notificationRepository } from '../../../repositories';
import { Bell, Check, Trash2, Eye } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import { format, parseISO } from 'date-fns';

export const CustomerNotificationsPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Subscribe to notifications in real-time!
    const unsubscribe = notificationRepository.subscribeToNotifications(
      currentUser.uid,
      (list) => {
        setNotifications(list);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);

  const handleMarkAllRead = async () => {
    try {
      await notificationRepository.markAllAsRead(currentUser.uid);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationRepository.markAsRead(currentUser.uid, id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingCard message="Syncing notifications inbox..." />;

  const unread = notifications.filter(n => !n.isRead);

  return (
    <div className="space-y-6 select-none max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Notification Center</h2>
          <p className="text-xs text-neutral-500 mt-1">Review account alerts, upcoming slot reminders, and reviews alerts.</p>
        </div>

        {unread.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Check size={14} />}
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-neutral-200 rounded-xl text-neutral-400 font-medium">
          <Bell size={36} className="text-neutral-350 mb-3" />
          <p className="text-sm">Your inbox is empty.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead 
                  ? 'bg-white border-neutral-200 text-neutral-600' 
                  : 'bg-primary-light/10 border-primary/20 text-neutral-800 shadow-xs ring-1 ring-primary/5'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`h-2 w-2 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                  <h4 className="text-xs font-bold text-neutral-900 leading-tight">{n.title}</h4>
                </div>
                <p className="text-xs text-neutral-500 font-normal leading-relaxed">{n.message}</p>
                <span className="text-[9px] text-neutral-400 font-semibold block mt-2 uppercase">
                  {format(parseISO(n.createdAt), 'MMM dd, yyyy &bull; hh:mm a')}
                </span>
              </div>

              {!n.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkRead(n.id)}
                  className="!p-1 text-primary hover:bg-primary-light shrink-0"
                  aria-label="Mark as read"
                >
                  <Check size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerNotificationsPage;
