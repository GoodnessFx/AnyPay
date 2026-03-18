import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WalletPage } from "./pages/WalletPage";
import { SwapPage } from "./pages/SwapPage";
import { AddFundsPage } from "./pages/AddFundsPage";
import { WithdrawPage } from "./pages/WithdrawPage";
import { HistoryPage } from "./pages/HistoryPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { RateAlertsPage } from "./pages/RateAlertsPage";
import { GroupPoolsPage } from "./pages/GroupPoolsPage";
import { PaymentPage } from "./pages/PaymentPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/swap" element={<SwapPage />} />
        <Route path="/add-funds" element={<AddFundsPage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/trader" element={<RateAlertsPage />} />
        <Route path="/pools" element={<GroupPoolsPage />} />
        <Route path="/u/:username" element={<PaymentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}