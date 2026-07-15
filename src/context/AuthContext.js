import { createContext, useContext, useState, useCallback } from 'react';
import { logoutUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('aniflix_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [myList, setMyList] = useState(() => {
    try {
      const l = localStorage.getItem('aniflix_list');
      return l ? JSON.parse(l) : [];
    } catch { return []; }
  });

  const login = useCallback((user, token) => {
    localStorage.setItem('aniflix_token', token);
    localStorage.setItem('aniflix_user', JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const updateUser = useCallback((patch) => {
    setCurrentUser(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('aniflix_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    localStorage.removeItem('aniflix_token');
    localStorage.removeItem('aniflix_user');
    setCurrentUser(null);
  }, []);

  const toggleList = useCallback((id) => {
    setMyList(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('aniflix_list', JSON.stringify(next));
      return next;
    });
  }, []);

  const isInList = useCallback((id) => myList.includes(id), [myList]);

  return (
    <AuthContext.Provider value={{ currentUser, myList, login, logout, updateUser, toggleList, isInList }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
