import { useState } from "react";
import { Header } from "./Header";
import { SettingsPage } from "./SettingsPage";
import { ProfilePage } from "./ProfilePage";
import { NotificationsPage } from "./NotificationsPage";
import { Footer } from "./Footer";

type Page = 'home' | 'settings' | 'profile' | 'notifications';

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'settings':
        return <SettingsPage onBack={() => setCurrentPage('home')} />;
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('home')} />;
      case 'notifications':
        return <NotificationsPage onBack={() => setCurrentPage('home')} />;
      default:
        return (
          <>
            <Header 
              onSettingsClick={() => setCurrentPage('settings')}
              onProfileClick={() => setCurrentPage('profile')}
              onNotificationsClick={() => setCurrentPage('notifications')}
            />
            {children}
            <Footer />
          </>
        );
    }
  };

  return <>{renderPage()}</>;
}