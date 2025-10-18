import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

interface SplashScreenProps {
  onAnimationFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish }) => {

  // This function will be called when the Lottie animation completes.
  const handleAnimationComplete = () => {
    // We add a 500ms (half a second) delay here.
    // This will make the last frame of your animation (the "QuickBill" name)
    // stay on screen for a moment before the app transitions.
    setTimeout(() => {
      onAnimationFinish();
    }, 500); // You can increase this value for a longer pause
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/splash-animation.json')}
        autoPlay
        loop={false}
        resizeMode="cover"
        // The LottieView now calls our new handler function instead of transitioning immediately.
        onAnimationFinish={handleAnimationComplete}
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee', // Background color behind your animation
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;