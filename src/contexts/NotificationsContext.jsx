// src/contexts/NotificationsContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // keep unread count in sync
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.is_read).length);
  }, [notifications]);

  useEffect(() => {
    let disposed = false;

    const teardownChannel = async () => {
      const ch = channelRef.current;
      if (ch) {
        try {
          await supabase.removeChannel(ch);
        } catch (e) {
          console.warn('removeChannel failed', e);
        }
        channelRef.current = null;
      }
    };

    const bootstrap = async () => {
      await teardownChannel();

      if (!user) {
        if (!disposed) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (disposed) return;

      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } else {
        setNotifications(Array.isArray(data) ? data : []);
      }
      setLoading(false);

      // realtime changes
      const channelName = `notifications_user_${user.id}`;
      const channel = supabase.channel(channelName);

      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          const row = payload.new;
          setNotifications((prev) => [row, ...prev]);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          const row = payload.new;
          setNotifications((prev) => prev.map((n) => (n.id === row.id ? { ...n, ...row } : n)));
        })
        .subscribe();

      channelRef.current = channel;
    };

    bootstrap();

    return () => {
      disposed = true;
      teardownChannel();
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)));
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        console.error('markAsRead failed:', error);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))); // rollback
      }
    } catch (e) {
      console.error('markAsRead error:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => (n.is_read ? n : ({ ...n, is_read: true, read_at: new Date().toISOString() }))));
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user?.id ?? '')
        .eq('is_read', false);
      if (error) console.error('markAllAsRead failed:', error);
    } catch (e) {
      console.error('markAllAsRead error:', e);
    }
  };

  const value = useMemo(
    () => ({ notifications, unreadCount, loading, markAsRead, markAllAsRead }),
    [notifications, unreadCount, loading]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
};
