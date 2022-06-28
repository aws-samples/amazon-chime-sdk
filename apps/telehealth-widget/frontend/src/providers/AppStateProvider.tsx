import React, {useContext, useState, ReactNode} from 'react';

interface Props {
  children: ReactNode;
}

interface AppStateValue {
  theme: string;
  toggleTheme: () => void;
}

const AppStateContext = React.createContext<AppStateValue | undefined>(undefined);

export function useAppState(): AppStateValue {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return state;
}

export function AppStateProvider({children}: Props) {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });

  const toggleTheme = (): void => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const providerValue = {
    theme,
    toggleTheme,
  };

  return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
}
