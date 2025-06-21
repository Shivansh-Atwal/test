import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction
} from 'react';

// Define the shape of the context
interface FullscreenContextType {
  isInFullscreen: boolean;
  setIsInFullscreen: Dispatch<SetStateAction<boolean>>;
}

// Create the context with undefined as initial value
const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

// Custom hook to use the context
export const useFullscreen = (): FullscreenContextType => {
  const context = useContext(FullscreenContext);
  if (!context) {
    throw new Error('useFullscreen must be used within FullscreenProvider');
  }
  return context;
};

// Define the provider props
interface FullscreenProviderProps {
  children: ReactNode;
}

// Provider component
export const FullscreenProvider: React.FC<FullscreenProviderProps> = ({ children }) => {
  const [isInFullscreen, setIsInFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsInFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <FullscreenContext.Provider value={{ isInFullscreen, setIsInFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  );
};
