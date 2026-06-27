// Mock Notification Repository
import { dbMock } from './dbMock';

let notificationListeners = [];

const notifyListeners = (userId) => {
  const listeners = notificationListeners.filter(l => l.userId === userId);
  const notifications = dbMock.getTable('notifications')
    .filter(n => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  listeners.forEach(l => l.callback(notifications));
};

export const MockNotificationRepository = {
  getNotifications: async (userId, limitNum = 50) => {
    await new Promise(r => setTimeout(r, 100));
    return dbMock.getTable('notifications')
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limitNum);
  },

  sendNotification: async (userId, notificationData) => {
    const newNotif = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notificationData
    };
    dbMock.insert('notifications', newNotif);
    notifyListeners(userId);
    return newNotif;
  },

  markAsRead: async (userId, notificationId) => {
    const notifications = dbMock.getTable('notifications');
    const index = notifications.findIndex(n => n.id === notificationId && n.userId === userId);
    
    if (index !== -1) {
      notifications[index].isRead = true;
      dbMock.saveTable('notifications', notifications);
      notifyListeners(userId);
      return true;
    }
    return false;
  },

  markAllAsRead: async (userId) => {
    const notifications = dbMock.getTable('notifications');
    let changed = false;

    const updated = notifications.map(n => {
      if (n.userId === userId && !n.isRead) {
        changed = true;
        return { ...n, isRead: true };
      }
      return n;
    });

    if (changed) {
      dbMock.saveTable('notifications', updated);
      notifyListeners(userId);
    }
    return true;
  },

  subscribeToNotifications: (userId, callback) => {
    const listenerId = Math.random().toString(36).substring(2, 9);
    
    notificationListeners.push({
      id: listenerId,
      userId,
      callback
    });

    // Initial query trigger
    const initialNotifs = dbMock.getTable('notifications')
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(initialNotifs);

    // Return unsubscribe function
    return () => {
      notificationListeners = notificationListeners.filter(l => l.id !== listenerId);
    };
  }
};
