import { StyleSheet, Text, View, Alert, TouchableOpacity, Animated, Easing, Dimensions, TextInput } from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { COLORS } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUserContext } from '@/context/UserContext';

const { width } = Dimensions.get('window');

const Battle = () => {
  const router = useRouter(); // Add router for navigation
  const params = useLocalSearchParams();
  const gameSessionId = params.gameSessionId;
  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemWord, setSystemWord] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [wordInputTimer, setWordInputTimer] = useState(null);
  const [playerWord, setPlayerWord] = useState('');
  const [submittedWord, setSubmittedWord] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [pollingActive, setPollingActive] = useState(true);
  const [currentRound, setCurrentRound] = useState(1); // Always 1 since we only have one round
  const { userData } = useUserContext();
  
  // Animation values for the swords
  const leftSwordTranslateX = useRef(new Animated.Value(-50)).current;
  const leftSwordRotation = useRef(new Animated.Value(0)).current;
  const rightSwordTranslateX = useRef(new Animated.Value(50)).current;
  const rightSwordRotation = useRef(new Animated.Value(0)).current;
  const swordSize = 100;

  // Animate swords on component mount
  useEffect(() => {
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

  // Fetch game session function that can be called multiple times
  const fetchGameSession = useCallback(async () => {
    if (!gameSessionId) {
      setError('Game session ID is missing');
      setLoading(false);
      return null;
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
          return data.gameSession;
        } else {
          console.log("Full response data:", JSON.stringify(data));
          // If gameSession is not in the expected location, try to use the data directly
          setGameSession(data);
          return data;
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
    return null;
  }, [gameSessionId]);

  // Fetch system word for the current round
  const fetchSystemWord = useCallback(async () => {
    if (!gameSession || gameSession.status !== 'active') {
      console.log("Game session is not active. Skipping system word fetch.");
      return;
    }

    try {
      console.log("Fetching system word for game session:", gameSession._id || gameSession.id);
      const response = await fetch('https://serverpid.onrender.com/generate-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameSessionId: gameSession._id || gameSession.id }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Received system word data:", data);

        // Extract the system word for round 1 (since we only have one round now)
        const roundData = data.rounds.find(round => round.round === 1);
        if (roundData && roundData.system_word) {
          setSystemWord(roundData.system_word);
          console.log("System word for round 1:", roundData.system_word);

          // Start the word input timer once we have the system word
          startWordInputTimer();
        } else {
          console.error("System word not found for round 1");
          setError('System word not found for the round.');
        }
      } else {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        setError('Failed to fetch system word.');
      }
    } catch (error) {
      console.error('Error fetching system word:', error);
      setError('Something went wrong while fetching the system word.');
    }
  }, [gameSession]);

  // Start the timer for word submission
  const startWordInputTimer = useCallback(() => {
    setSubmittedWord(false);
    setPlayerWord('');
    let timer = 15; // 15 seconds to input a word
    setWordInputTimer(timer);
  
    const interval = setInterval(() => {
      timer -= 1;
      setWordInputTimer(timer);
  
      if (timer <= 0) {
        clearInterval(interval);
        
        // Auto-submit when time runs out, regardless of input
        if (!submittedWord) {
          handleWordSubmit();
        }
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [submittedWord]);

  // Submit the player's word
  const handleWordSubmit = useCallback(async () => {
    if (submittedWord) return;

    if (!userData || !userData.userId) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    if (!gameSession) {
      Alert.alert('Error', 'Game session not found.');
      return;
    }

    const wordToSubmit = playerWord.trim() || 'gigel'; ;

    try {
      setSubmittedWord(true);
      const sessionId = gameSession._id || gameSession.id;

      console.log(`Submitting word "${wordToSubmit}" for player ${userData.userId} in game ${sessionId}`);

      const response = await fetch(`https://serverpid.onrender.com/evaluate-round/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.userId,
          word: wordToSubmit,
          systemWord: systemWord,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Submitting payload:', {
          userId: userData.userId,
          word: wordToSubmit,
          systemword: systemWord,
        });
        console.log("Word submission response:", data);

        setRoundResult(data);

        if (data.bothPlayersSubmitted) {
          console.log("Both players have submitted their words.");
          // Since we only have one round, mark the game as completed once both players submit
          setGameSession({
            ...gameSession,
            status: 'completed',
            winner: determineWinner(data.scores)
          });
        } else {
          console.log("Waiting for the opponent's response...");
          startPollingForRoundResult(sessionId);
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to submit word.');
        setSubmittedWord(false);
      }
    } catch (error) {
      console.error('Error submitting word:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setSubmittedWord(false);
    }
  }, [playerWord, gameSession, userData, systemWord, submittedWord]);

  // Helper function to determine the winner based on scores
  const determineWinner = (scores) => {
    if (scores.player1 > scores.player2) {
      return gameSession.player1._id || gameSession.player1.id;
    } else if (scores.player2 > scores.player1) {
      return gameSession.player2._id || gameSession.player2.id;
    }
    return null; // Tie
  };

  // Poll for round results after submitting
  const startPollingForRoundResult = useCallback((sessionId) => {
    let pollCount = 0;
    const maxPolls = 30; // 30 seconds max waiting time
    
    const poll = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(poll);
        Alert.alert('Timeout', 'The other player did not respond in time.');
        return;
      }
      
      try {
        const response = await fetch(`https://serverpid.onrender.com/gamesessions/${sessionId}`, {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Round status poll response:", data);
          
          if (data.bothPlayersSubmitted) {
            clearInterval(poll);
            setRoundResult(data);
            
            // Since we only have one round, mark the game as completed
            const winner = determineWinner(data.scores);
            setGameSession({
              ...gameSession,
              status: 'completed',
              winner: winner
            });
          }
        }
      } catch (error) {
        console.error("Error polling for round status:", error);
      }
    }, 1000); // Poll every second
    
    return () => clearInterval(poll);
  }, [gameSession]);

  // Define startCountdown at component level
  const startCountdown = useCallback(() => {
    let timer = 3; // Start countdown from 3
    setCountdown(timer);

    const interval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);

      if (timer <= 0) {
        clearInterval(interval);
        setCountdown(null); // Clear countdown
        fetchSystemWord(); // Fetch system word after countdown ends
      }
    }, 1000);
  }, [fetchSystemWord]);

  // Initial game session fetch
  useEffect(() => {
    fetchGameSession();
  }, [gameSessionId, fetchGameSession]);

  // Set up polling to check for game session updates
  useEffect(() => {
    let pollInterval;
    
    // Only set up polling if needed (when waiting for opponent)
    if (pollingActive && gameSession?.status === 'waiting') {
      console.log("Setting up polling for game session updates...");
      
      pollInterval = setInterval(async () => {
        console.log("Polling for game session update...");
        const updatedSession = await fetchGameSession();
        
        // If status changed to active, stop polling
        if (updatedSession && updatedSession.status === 'active') {
          console.log("Game session is now active! Stopping polling.");
          setPollingActive(false);
          clearInterval(pollInterval);
        }
      }, 3000); // Poll every 3 seconds
    }
    
    // Clean up interval on component unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [gameSession?.status, fetchGameSession, pollingActive]);

  // Start countdown when game session becomes active
  useEffect(() => {
    if (gameSession?.status === 'active') {
      console.log("Game session is active, starting countdown...");
      startCountdown(); // Start countdown when the game session becomes active
    } else if (gameSession) {
      console.log("Game session status:", gameSession.status);
    }
  }, [gameSession, startCountdown]);

  // Replace getOpponentName with a function to get both players' names
  const getPlayersDisplay = () => {
    if (!gameSession) return "Waiting for game session...";
    
    // Extract player1 info
    let player1Name = "Player 1";
    if (gameSession.player1) {
      if (typeof gameSession.player1 === 'object') {
        player1Name = gameSession.player1.email || "Player 1";
        // Get username from email if available
        if (player1Name.includes('@')) {
          player1Name = player1Name.split('@')[0];
        }
      } else {
        player1Name = "Player 1";
      }
    }
    
    // Extract player2 info
    let player2Name = "Waiting for opponent...";
    if (gameSession.player2) {
      if (typeof gameSession.player2 === 'object') {
        player2Name = gameSession.player2.email || "Player 2";
        // Get username from email if available
        if (player2Name.includes('@')) {
          player2Name = player2Name.split('@')[0];
        }
      } else {
        player2Name = "Player 2";
      }
    }
    
    return { player1Name, player2Name };
  };

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

    // Get both player names
    const { player1Name, player2Name } = getPlayersDisplay();

    return (
      <View style={styles.playerInfo}>
        <View style={styles.versusContainer}>
          <Text style={styles.playerName}>{player1Name}</Text>
          <Text style={styles.vsText}>VS</Text>
          <Text style={[
            styles.playerName, 
            !gameSession.player2 && styles.waitingText
          ]}>
            {player2Name}
          </Text>
        </View>
        
        <Text style={styles.statusText}>
          {gameSession.status === 'waiting' 
            ? '(Waiting for opponent to join...)'
            : gameSession.status === 'active' 
              ? '(Game in progress)'
              : `(Game ${gameSession.status})`
          }
        </Text>
      </View>
    );
  };

  const renderCountdown = () => {
    if (countdown !== null) {
      return <Text style={styles.countdown}>Game starts in... {countdown}</Text>;
    }
    return null;
  };

  const renderWordInputArea = () => {
    if (!systemWord) {
      return <Text style={styles.text}>Waiting for system word...</Text>;
    }

    return (
      <View style={styles.wordInputContainer}>
        <Text style={styles.systemWord}>System Word: {systemWord}</Text>
        <Text style={styles.roundInfo}>Single Round Battle</Text>
        
        {wordInputTimer !== null && !submittedWord && (
          <Text style={styles.timer}>Time remaining: {wordInputTimer}s</Text>
        )}
        
        {!submittedWord ? (
          <>
            <Text style={styles.instruction}>
              Type a word that can effectively counter the system word:
            </Text>
            <TextInput
              style={styles.wordInput}
              placeholder="Enter your word..."
              placeholderTextColor={COLORS.fade}
              value={playerWord}
              onChangeText={setPlayerWord}
              maxLength={20}
              autoCapitalize="none"
              editable={!submittedWord && wordInputTimer > 0}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!playerWord.trim() || submittedWord) && styles.disabledButton
              ]}
              onPress={handleWordSubmit}
              disabled={!playerWord.trim() || submittedWord}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.submittedContainer}>
            <Text style={styles.submittedText}>Word submitted: {playerWord}</Text>
            <Text style={styles.waitingText}>
              {roundResult ? 'Game complete!' : 'Waiting for opponent...'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderRoundResult = () => {
    if (!roundResult) return null;

    const { message, explanation, roundResult: result, scores } = roundResult;

    // Determine winner based on scores
    let winnerText = "It's a tie!";
    if (scores.player1 > scores.player2) {
      winnerText = userData.userId === (gameSession.player1._id || gameSession.player1.id) ? 
        "You won the battle!" : "Player 1 won the battle!";
    } else if (scores.player2 > scores.player1) {
      winnerText = userData.userId === (gameSession.player2._id || gameSession.player2.id) ? 
        "You won the battle!" : "Player 2 won the battle!";
    }

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Game Over</Text>
        <Text style={styles.resultText}>{message}</Text>
        <Text style={styles.resultExplanation}>{explanation}</Text>

        <View style={styles.scoresContainer}>
          <Text style={styles.scoreText}>Player 1 Score: {scores.player1}</Text>
          <Text style={styles.scoreText}>Player 2 Score: {scores.player2}</Text>
        </View>

        <Text style={styles.finalWinnerText}>{winnerText}</Text>
      </View>
    );
  };

  const animateSwordClash = useCallback(() => {
    // Animate swords to clash when word is submitted
    Animated.parallel([
      Animated.timing(leftSwordTranslateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.easeIn,
        useNativeDriver: true,
      }),
      Animated.timing(rightSwordTranslateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.easeIn,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(leftSwordTranslateX, {
            toValue: 65,
            duration: 300,
            easing: Easing.easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(rightSwordTranslateX, {
            toValue: -65,
            duration: 300,
            easing: Easing.easeOut,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);
    });
  }, [leftSwordTranslateX, rightSwordTranslateX]);

  // Function to handle return to index
  const handleReturnToHome = () => {
    router.replace('/');
  };

  // Animation styles for swords
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
          <MaterialCommunityIcons 
            name="sword" 
            size={swordSize} 
            color={COLORS.secondary} 
          />
        </Animated.View>
      </View>

      <Text style={styles.title}>Word Clash Battle!</Text>
      {renderSessionData()}
      
      {gameSession?.status === 'waiting' && (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>Waiting for opponent to join...</Text>
          <View style={styles.loadingDots}>
            <Animated.View style={styles.dot} />
            <Animated.View style={[styles.dot, { marginHorizontal: 8 }]} />
            <Animated.View style={styles.dot} />
          </View>
        </View>
      )}
      
      {renderCountdown()}
      
      {!countdown && gameSession?.status === 'active' && (
        roundResult ? renderRoundResult() : renderWordInputArea()
      )}

      {gameSession?.status === 'completed' && (
        <View style={styles.completedContainer}>
          {renderRoundResult()}
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={handleReturnToHome}
          >
            <Text style={styles.returnButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  swordsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 50,
    height: 120,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  versusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 5,
  },
  playerName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: 120,
  },
  vsText: {
    color: COLORS.secondary,
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  statusText: {
    color: COLORS.fade,
    fontSize: 16,
    fontStyle: 'italic',
  },
  waitingText: {
    color: COLORS.fade,
    borderColor: COLORS.fade,
  },
  countdown: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingBar: {
    width: width * 0.7,
    height: 10,
    backgroundColor: COLORS.fade,
    borderRadius: 5,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '70%', // Simulating progress
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  wordsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  systemWord: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chooseWordText: {
    color: COLORS.fade,
    fontSize: 18,
    marginBottom: 15,
  },
  wordButton: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    width: width - 40,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedWordButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    borderColor: COLORS.secondary,
    borderWidth: 3,
  },
  wordText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  wordDetails: {
    alignItems: 'flex-end',
  },
  wordType: {
    color: COLORS.fade,
    fontSize: 16,
  },
  wordCost: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.fade,
    opacity: 0.7,
  },
  debugButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
    padding: 8,
    borderRadius: 5,
  },
  debugButtonText: {
    color: COLORS.white,
    fontSize: 12,
  },
  wordInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  roundInfo: {
    color: COLORS.secondary,
    fontSize: 18,
    marginBottom: 10,
  },
  timer: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  instruction: {
    color: COLORS.fade,
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  wordInput: {
    width: width - 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    fontSize: 20,
    color: COLORS.white,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.fade,
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  submittedContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  submittedText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultContainer: {
    width: width - 40,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  resultTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    color: COLORS.secondary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  wordsComparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  playerWordContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  winnerContainer: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  playerLabel: {
    color: COLORS.fade,
    fontSize: 14,
    marginBottom: 5,
  },
  playerWordText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  wordScore: {
    color: COLORS.primary,
    fontSize: 16,
  },
  nextRoundText: {
    color: COLORS.primary,
    fontSize: 18,
    marginTop: 15,
  },
  gameOverText: {
    color: COLORS.secondary,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
  },
  finalWinnerText: {
    color: COLORS.secondary,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  scoresContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    width: '100%',
  },
  scoreText: {
    color: COLORS.white,
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
  resultExplanation: {
    color: COLORS.fade,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  returnButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  returnButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedContainer: {
    alignItems: 'center',
  },
});
