import React, { useState, useEffect } from 'react';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000); // Show the splash screen for 3 seconds

    return () => clearTimeout(timer); // Clear the timer if the component is unmounted
  }, []);

  return showSplash ? <SplashScreen /> : <HomeScreen />;
};

export default App;
