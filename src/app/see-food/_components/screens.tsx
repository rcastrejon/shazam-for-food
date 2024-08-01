import { createContext, useContext, useState } from "react";

interface ScreensContextType {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

const ScreensContext = createContext<ScreensContextType | undefined>(undefined);

const useScreens = () => {
  const context = useContext(ScreensContext);
  if (!context) {
    throw new Error("useScreens must be used within a ScreensProvider");
  }
  return context;
};

type ScreensProviderProps = React.PropsWithChildren<{
  defaultValue: string;
  currentScreen?: string;
  onValueChange?: (screen: string) => void;
}>;

function ScreensProvider({
  defaultValue,
  currentScreen: controlledScreen,
  onValueChange,
  children,
}: ScreensProviderProps) {
  const [internalScreen, setInternalScreen] = useState(defaultValue);
  const isControlled = controlledScreen !== undefined;
  const currentScreen = isControlled ? controlledScreen : internalScreen;

  const setCurrentScreen = (screen: string) => {
    if (!isControlled) {
      setInternalScreen(screen);
    }
    if (onValueChange) {
      onValueChange(screen);
    }
  };

  return (
    <ScreensContext.Provider value={{ currentScreen, setCurrentScreen }}>
      {children}
    </ScreensContext.Provider>
  );
}

export type ScreensProps = React.PropsWithChildren<{
  defaultValue: string;
  currentScreen?: string;
  onValueChange?: (screen: string) => void;
}>;

export const Screens = ({
  defaultValue,
  currentScreen,
  onValueChange,
  children,
}: ScreensProps) => {
  return (
    <ScreensProvider
      defaultValue={defaultValue}
      currentScreen={currentScreen}
      onValueChange={onValueChange}
    >
      {children}
    </ScreensProvider>
  );
};

export type ScreensContentProps = React.PropsWithChildren<{
  value: string;
}>;

export const ScreensContent = ({ value, children }: ScreensContentProps) => {
  const { currentScreen } = useScreens();

  if (currentScreen !== value) {
    return null;
  }

  return <>{children}</>;
};
