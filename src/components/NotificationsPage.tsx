import { motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info, TrendingUp, Shield, Users, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";

interface NotificationsPageProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'transaction' | 'security' | 'system' | 'price' | 'social';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    text: string;
    href: string;
  };
}

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'transaction',
      title: 'Transaction Completed',
      message: 'Your conversion of $500 USD to 220,000 NGN has been successfully completed.',
      time: '2 minutes ago',
      read: false,
      priority: 'high',
      action: { text: 'View Details', href: '#' }
    },
    {
      id: '2',
      type: 'security',
      title: 'New Device Login',
      message: 'A new device logged into your account from Lagos, Nigeria. If this wasn\'t you, please secure your account.',
      time: '1 hour ago',
      read: false,
      priority: 'high',
      action: { text: 'Review Activity', href: '#' }
    },
    {
      id: '3',
      type: 'price',
      title: 'Price Alert',
      message: 'Bitcoin has increased by 5.2% in the last 24 hours. Current price: $45,230',
      time: '3 hours ago',
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'social',
      title: 'Referral Bonus',
      message: 'You earned $10 bonus! Sarah Johnson completed her first transaction using your referral link.',
      time: '1 day ago',
      read: false,
      priority: 'medium',
      action: { text: 'Claim Bonus', href: '#' }
    },
    {
      id: '5',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM - 4:00 AM UTC. Some services may be temporarily unavailable.',
      time: '2 days ago',
      read: true,
      priority: 'low'
    },
    {
      id: '6',
      type: 'transaction',
      title: 'Transaction Failed',
      message: 'Your transaction of 0.01 BTC could not be processed due to insufficient network fees.',
      time: '3 days ago',
      read: true,
      priority: 'high',
      action: { text: 'Retry Transaction', href: '#' }
    },
    {
      id: '7',
      type: 'security',
      title: 'Password Changed',
      message: 'Your account password was successfully updated.',
      time: '1 week ago',
      read: true,
      priority: 'medium'
    },
    {
      id: '8',
      type: 'system',
      title: 'New Feature Available',
      message: 'Cross-border instant transfers are now available in 15 new countries!',
      time: '1 week ago',
      read: true,
      priority: 'low',
      action: { text: 'Learn More', href: '#' }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'transaction' | 'security' | 'system' | 'price' | 'social'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'transaction': return TrendingUp;
      case 'security': return Shield;
      case 'system': return Info;
      case 'price': return TrendingUp;
      case 'social': return Users;
      default: return Bell;
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600';
    if (priority === 'medium') return 'text-yellow-600';
    
    switch (type) {
      case 'transaction': return 'text-green-600';
      case 'security': return 'text-red-600';
      case 'system': return 'text-blue-600';
      case 'price': return 'text-purple-600';
      case 'social': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                Stay updated with your AnyPay activity
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-100 text-red-800">
                    {unreadCount} unread
                  </Badge>
                )}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="transaction">Transactions</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? "You're all caught up!" : "No notifications found for this filter."}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type, notification.priority);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-6 transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-full bg-gray-100 ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <p className={`mt-1 text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-xs text-gray-500">{notification.time}</span>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {notification.priority} priority
                              </Badge>
                              {!notification.read && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {notification.action && (
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              {notification.action.text}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        {notifications.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notification Preferences
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Transaction History
              </Button>
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
}