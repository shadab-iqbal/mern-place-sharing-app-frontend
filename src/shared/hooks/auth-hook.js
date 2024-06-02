import { useState, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

let logoutTimer;

// this is a helper function to get the remaining time before the token expires
const getRemainingTokenTime = (token) => {
  if (!token) {
    return true; // No token means it's effectively "expired"
  }

  try {
    const tokenExpiryTime = jwtDecode(token).exp; // Expiry time in seconds
    const currentTime = Date.now() / 1000; // Current time in seconds

    return tokenExpiryTime - currentTime; // Remaining time in seconds
  } catch (error) {
    console.error("Invalid token", error);
    return -1; // If the token is invalid, consider it expired
  }
};

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid, token) => {
    setToken(token);
    setUserId(uid);

    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));

    if (storedData && storedData.token) {
      const remainingTime = getRemainingTokenTime(storedData.token);

      if (remainingTime > 0) login(storedData.userId, storedData.token);
    }
  }, [login]);

  useEffect(() => {
    if (token) {
      const remainingTime = getRemainingTokenTime(token);

      logoutTimer = setTimeout(() => {
        logout();
        alert("Session expired. Please login again.");
        window.location.reload();
      }, remainingTime * 1000);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout]);

  return { token, login, logout, userId };
};
