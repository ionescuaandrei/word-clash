import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated, // Import Animated
  Easing, // Import Easing for animation curves
} from "react-native";
import React, { useEffect, useRef } from "react"; // Import useEffect and useRef
import { COLORS } from "@/constants/theme";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from "expo-router";

const Start = () => { // Renamed component to follow convention (PascalCase)

  // Create animated values using useRef. Initialize them for the starting state.
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current; // Initial scale: 0.8
  const slideUpAnim = useRef(new Animated.Value(50)).current; // Initial position: 50 pixels down
  const buttonScaleAnim = useRef(new Animated.Value(1)).current; // Initial scale for button press: 1

  // Use useEffect to run the animation when the component mounts
  useEffect(() => {
    // Sequence or stagger animations for a nice effect
    Animated.stagger(200, [ // Start animations 200ms apart
      Animated.timing(fadeAnim, {
        toValue: 1, // Target opacity: 1
        duration: 800, // Animation duration: 800ms
        useNativeDriver: true, // Use native driver for better performance
      }),
      Animated.spring(logoScaleAnim, { // Use spring for a slight bounce effect
        toValue: 1, // Target scale: 1
        friction: 5, // Controls "bounciness"
        tension: 40, // Controls speed
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0, // Target position: 0 (original position)
        duration: 600,
        easing: Easing.out(Easing.ease), // Add an easing function
        useNativeDriver: true,
      }),
    ]).start(); // Start the animation sequence
  }, [fadeAnim, logoScaleAnim, slideUpAnim]); // Dependency array

  // --- Button Press Animation Handlers ---
  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95, // Scale down slightly
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1, // Scale back to normal
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigate = () => {
     router.push("/(auth)/login");
  }

  return (
    // Use Animated.View for the container if you want to animate the background (optional)
    <View style={styles.container}>

      {/* Apply animation to the "WELCOME TO" text */}
      <Animated.Text style={[styles.welcome, { opacity: fadeAnim }]}>
        WELCOME TO
      </Animated.Text>

      {/* Apply animation to the Image */}
      <Animated.Image
        source={require("@/assets/images/logo.png")}
        style={[
          styles.logo, // Use a separate style for the logo
          {
            opacity: fadeAnim, // Fade in
            transform: [{ scale: logoScaleAnim }], // Scale up
          },
        ]}
      />

      {/* Apply animation to the button container */}
      <Animated.View
        style={[
          styles.startContainer, // Use a separate style for the button container
          {
            opacity: fadeAnim, // Fade in
            transform: [{ translateY: slideUpAnim }], // Slide up
          },
        ]}
      >
        {/* Apply press animation to the TouchableOpacity */}
        <TouchableOpacity
          style={[styles.button]}
          activeOpacity={0.9} // Reduce default opacity feedback since we have scale
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleNavigate} // Use the combined handler
        >
          {/* Wrap button content in Animated.View for scaling */}
          <Animated.View style={[styles.buttonContent, { transform: [{ scale: buttonScaleAnim }] }]}>
            <Text style={styles.getStarted}>
              LET'S CLASH
            </Text>
            <FontAwesome5 name="long-arrow-alt-right" size={24} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Apply fade animation to the footer text */}
      <Animated.Text style={[styles.footerText, { opacity: fadeAnim }]}>
        This app was created by PID SOFT
      </Animated.Text>
    </View>
  );
};

export default Start; // Export with the new name

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    // color: COLORS.white, // color prop is not valid on View
  },
  welcome: {
    color: COLORS.white,
    fontSize: 30,
    fontFamily: "Roboto-Bold",
    letterSpacing: 3,
    marginBottom: 20, // Add some spacing
  },
  logo: { // Added specific style for the logo
    width: 400, // Slightly smaller for better scaling effect visibility
    height: 400,
    resizeMode: 'contain', // Good practice for logos
    marginBottom: 40, // Add some spacing
  },
  startContainer: { // Style for the button's animated container
    // Removed background color and padding from here, moved to button
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    // Removed flex properties, handled by buttonContent
    overflow: 'hidden',
    paddingHorizontal: 20, // Added padding for better touch area
  },
  buttonContent: { // New style for the content inside the TouchableOpacity
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15, // Slightly more padding
    gap: 15, // Slightly more gap
  },
  getStarted: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: "Roboto-Black",
    letterSpacing: 3,
    textAlign: 'center', // Center text if needed depending on layout
    // Removed fixed width, let it be flexible
  },
  footerText: { // Added specific style for footer
    color: COLORS.white,
    fontSize: 10,
    fontFamily: "Roboto-Italic",
    letterSpacing: 3,
    marginTop: 50,
    position: 'absolute', // Position absolutely at the bottom if desired
    bottom: 30,         // Adjust as needed
  },
});