import { useEffect, useState } from "react";
import OrganizerDashBoard from "./OrganizerDashBoard";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setIsAuthenticated(false);
  };

  const handleGoToRegister = () => {
    setShowRegister(true);
  };

  const handleGoToLogin = () => {
    setShowRegister(false);
  };

  const handleRegister = () => {
    // After successful registration, go to login page
    setShowRegister(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <OrganizerDashBoard onLogout={handleLogout} />
      ) : showRegister ? (
        <RegisterPage onRegister={handleRegister} goToLogin={handleGoToLogin} />
      ) : (
        <LoginPage onLogin={handleLogin} goToRegister={handleGoToRegister} />
      )}
    </>
  );
}

export default App;
