import { useState, useEffect } from 'react';
import { useNavigation, useLocation } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';


const ProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const navigation = useNavigation();
  const location = useLocation();

  useEffect(() => {
    if (navigation.state === 'loading') {
      setProgress(30); // Start loading
    }

    if (navigation.state === 'idle') {
      setProgress(100); // Finish loading
    }
  }, [navigation.state, location.pathname]);

  return (
    <div style={{ marginTop: '0px' }}>
      <LoadingBar
        color="#f11946"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
        height={4}
      />
    </div>
  );
};

export default ProgressBar;
