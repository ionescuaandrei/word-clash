import { StyleSheet, Text, View, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';

const Battle = () => {
  const params = useLocalSearchParams();
  const gameSessionId = params.gameSessionId;
  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchGameSession = async () => {
      if (!gameSessionId) {
        setError('Game session ID is missing');
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching game session with ID:", gameSessionId);
        const response = await fetch(`https://serverpid.onrender.com/gamesessions/${gameSessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Received game session data:", data);
          
          // Log the specific structure to debug
          if (data.gameSession) {
            console.log("Game session structure:", JSON.stringify(data.gameSession));
            setGameSession(data.gameSession);
          } else {
            console.log("Full response data:", JSON.stringify(data));
            // If gameSession is not in the expected location, try to use the data directly
            setGameSession(data);
          }
        } else {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          setError('Failed to fetch game session.');
        }
      } catch (error) {
        console.error('Error fetching game session:', error);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGameSession();
  }, [gameSessionId]);

  // Function to safely display data
  const renderSessionData = () => {
    if (loading) {
      return <Text style={styles.text}>Loading game session...</Text>;
    }
    
    if (error) {
      return <Text style={styles.text}>Error: {error}</Text>;
    }
    
    if (!gameSession) {
      return <Text style={styles.text}>No game session data available.</Text>;
    }

    // Debug what we have
    console.log("Rendering session data:", typeof gameSession);
    
    // Determine what fields are available
    const sessionId = gameSession._id || gameSession.id || 'Unknown';
    
    // Handle player1 which might be an object or a string ID
    let player1Text = 'Unknown';
    if (gameSession.player1) {
      if (typeof gameSession.player1 === 'object') {
        player1Text = gameSession.player1.email || gameSession.player1._id || 'Unknown';
      } else {
        player1Text = gameSession.player1.toString();
      }
    }
    
    // Handle player2 which might be an object, a string ID, or null
    let player2Text = 'Waiting for opponent...';
    if (gameSession.player2) {
      if (typeof gameSession.player2 === 'object') {
        player2Text = gameSession.player2.email || gameSession.player2._id || 'Unknown';
      } else {
        player2Text = gameSession.player2.toString();
      }
    }

    return (
      <View>
        <Text style={styles.text}>Session ID: {sessionId.toString()}</Text>
        <Text style={styles.text}>Player 1: {player1Text}</Text>
        <Text style={styles.text}>Player 2: {player2Text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Battle!</Text>
      {renderSessionData()}
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
    padding: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  debug: {
    color: COLORS.grey,
    fontSize: 12,
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.fade,
    borderRadius: 5,
    maxWidth: '100%',
  },
});
