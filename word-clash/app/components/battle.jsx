import { StyleSheet, Text, View, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';

const Battle = () => {
  const params = useLocalSearchParams();
  const gameSessionId = params.gameSessionId;
  const [gameSession, setGameSession] = useState(null);
  
  useEffect(() => {
    const fetchGameSession = async () => {
      if (!gameSessionId) {
        Alert.alert('Error', 'Game session ID is missing');
        return;
      }

      try {
        console.log("Fetching game session with ID:", gameSessionId);
        const response = await fetch(`https://serverpid.onrender.com/getgamesession/${gameSessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Received game session:", data);
          setGameSession(data.gameSession);
        } else {
          Alert.alert('Error', 'Failed to fetch game session.');
        }
      } catch (error) {
        console.error('Error fetching game session:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    };

    fetchGameSession();
  }, [gameSessionId]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Battle!</Text>
      {gameSession ? (
        <>
          <Text style={styles.text}>Game ID: {gameSession.id}</Text>
          <Text style={styles.text}>Player 1: {gameSession.player1}</Text>
          <Text style={styles.text}>Player 2: {gameSession.player2 || "Waiting for opponent..."}</Text>
        </>
      ) : (
        <Text style={styles.text}>Loading game session...</Text>
      )}
    </View>
  );
};

export default Battle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
