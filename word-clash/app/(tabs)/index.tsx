import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Alert } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { COLORS } from '@/constants/theme';
import History from '../components/History';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUserContext } from '@/context/UserContext';
import { router } from 'expo-router';

const index = () => {
  const [firstMatch, setFirstMatch] = React.useState(false);
  const { userData } = useUserContext();

  // Animation values for the left sword
  const leftSwordTranslateX = useRef(new Animated.Value(-50)).current;
  const leftSwordRotation = useRef(new Animated.Value(0)).current;

  // Animation values for the right sword
  const rightSwordTranslateX = useRef(new Animated.Value(50)).current;
  const rightSwordRotation = useRef(new Animated.Value(0)).current;

  const swordSize = 150;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(leftSwordTranslateX, {
        toValue: 65,
        duration: 500,
        easing: Easing.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(rightSwordTranslateX, {
        toValue: -65,
        duration: 500,
        easing: Easing.easeOut,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Slash animation after entry
      Animated.sequence([
        Animated.timing(leftSwordRotation, {
          toValue: -1,
          duration: 300,
          easing: Easing.easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(leftSwordRotation, {
          toValue: 0,
          duration: 300,
          easing: Easing.easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(rightSwordRotation, {
          toValue: -1,
          duration: 300,
          easing: Easing.easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(rightSwordRotation, {
          toValue: 0,
          duration: 300,
          easing: Easing.easeInOut,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleFindMatch = async () => {
    if (!userData || !userData.userId) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      console.log("Finding match for user:", userData.userId);
      const response = await fetch('https://serverpid.onrender.com/addplayertogamesession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userData.userId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Game session response:", data);
        
        if (data.gameSession && data.gameSession.id) {
          // Fix the path to the battle component
          router.push({
            pathname: '../components/battle',
            params: { gameSessionId: data.gameSession.id }
          });
        } else {
          Alert.alert('Error', 'Invalid game session data.');
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to find a match.');
      }
    } catch (error) {
      console.error('Error finding match:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const leftSwordStyle = {
    transform: [
      { translateX: leftSwordTranslateX },
      {
        rotate: leftSwordRotation.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['90deg', '0deg', '-90deg'],
        }),
      },
    ],
  };

  const rightSwordStyle = {
    transform: [
      { translateX: rightSwordTranslateX },
      {
        rotate: rightSwordRotation.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-90deg', '0deg', '90deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.swordsContainer}>
        <Animated.View style={leftSwordStyle}>
          <MaterialCommunityIcons
            name="sword"
            size={swordSize}
            color={COLORS.white}
            style={{ transform: [{ rotate: '90deg' }] }}
          />
        </Animated.View>
        <Animated.View style={rightSwordStyle}>
          <MaterialCommunityIcons name="sword" size={swordSize} color={COLORS.secondary} />
        </Animated.View>
      </View>
      <View style={styles.contentContainer}>
        {firstMatch ? (
          <Text style={styles.findMatch}>Let's find your first match</Text>
        ) : (
          <Text style={styles.findMatch}>Let's find you a match</Text>
        )}
        <Text style={styles.onevsone}>Play a 1v1 match</Text>
        <TouchableOpacity
          style={{ backgroundColor: COLORS.primary, padding: 10, borderRadius: 5, width: 200 }}
          onPress={handleFindMatch}
        >
          <Text style={{ color: COLORS.white, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
            Find match
          </Text>
        </TouchableOpacity>
        <History />
      </View>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: COLORS.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swordsContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-around',
      marginBottom: 20,
      paddingHorizontal: 50,
    },
    contentContainer: {
      alignItems: 'center',
    },
    findMatch: {
      fontSize: 30,
      fontWeight: "bold",
      color: COLORS.white,
      marginBottom: 10,
      textAlign: "center",
      width: 400,
    },
    onevsone: {
      fontSize: 20,
      color: COLORS.fade,
      marginBottom: 20,
      textAlign: "center",
    }
})