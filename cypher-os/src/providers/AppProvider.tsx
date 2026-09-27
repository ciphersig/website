import React, { createContext, useContext } from 'react';

interface AppContextType {
  bootCompleted: boolean;
  restartBoot: () => void;
}

const AppContext = createContext<AppContextType>({
  bootCompleted: true,
  restartBoot: () => {},
});

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppContext.Provider
      value={{
        bootCompleted: true,
        restartBoot: () => {},
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
