import { createContext, useContext } from 'react';

const DrawerContext = createContext();

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider');
  }
  return context;
};

export const DrawerProvider = DrawerContext.Provider;
