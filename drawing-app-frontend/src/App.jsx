import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Home";
import Room from "./pages/Room";
import DuelRoom from "./pages/DuelRoom";
import WaitingScreen from "./pages/WaitingPage";
import Result from "./pages/Result";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./components/AuthContext";
import OnboardingPage from "./pages/Onboarding";
import AchievementPage from "./pages/Achievements";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:code"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />
        <Route
          path="/duel/:code"
          element={
            <ProtectedRoute>
              <DuelRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiting/:code"
          element={
            <ProtectedRoute>
              <WaitingScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result/:code"
          element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <AchievementPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
