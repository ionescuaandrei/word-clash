import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS } from '@/constants/theme';
import { useUserContext } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const History = () => {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    // Fetch game history for the user
    const fetchGameHistory = async () => {
      if (!userData || !userData.userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://serverpid.onrender.com/usergamesessions/${userData.userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Game history data:", data);
          
          // Transform the data to include win/loss status
          const transformedData = (data.gameSessions || []).map(game => {
            // Determine if the current user won this game
            const userWon = game.winner === userData.userId;
            const gameStatus = game.status === 'completed' 
              ? (userWon ? 'won' : 'lost') 
              : game.status;
            
            // Format the date
            const gameDate = new Date(game.createdAt);
            const formattedDate = `${gameDate.toLocaleDateString()} ${gameDate.toLocaleTimeString()}`;
            
            // Get opponent name
            let opponentName = "Unknown";
            if (game.player1 && game.player2) {
              if (typeof game.player1 === 'object' && typeof game.player2 === 'object') {
                if (game.player1._id === userData.userId) {
                  opponentName = game.player2.email ? game.player2.email.split('@')[0] : "Player 2";
                } else {
                  opponentName = game.player1.email ? game.player1.email.split('@')[0] : "Player 1";
                }
              }
            }
            
            return {
              ...game,
              userWon,
              gameStatus,
              formattedDate,
              opponentName
            };
          });
          
          setGameHistory(transformedData);
        } else {
          setError('Failed to fetch game history');
        }
      } catch (error) {
        console.error('Error fetching game history:', error);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
  }, [userData]);

  const renderGameItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.gameItem,
          item.userWon ? styles.wonGame : (item.gameStatus === 'lost' ? styles.lostGame : styles.pendingGame)
        ]}
        onPress={() => {
          // If you want to navigate to game details
          // router.push(`/game-details/${item._id}`);
        }}
      >
        <View style={styles.gameDetails}>
          <Text style={styles.opponentName}>vs {item.opponentName}</Text>
          <Text style={styles.dateText}>{item.formattedDate}</Text>
        </View>

        <View style={styles.gameStatus}>
          {item.gameStatus === 'completed' ? (
            <View style={styles.outcomeContainer}>
              <MaterialCommunityIcons 
                name={item.userWon ? "trophy" : "close-circle"} 
                size={24} 
                color={item.userWon ? COLORS.secondary : COLORS.error} 
              />
              <Text style={[
                styles.outcomeText,
                { color: item.userWon ? COLORS.secondary : COLORS.error }
              ]}>
                {item.userWon ? "Victory" : "Defeat"}
              </Text>
            </View>
          ) : (
            <Text style={styles.pendingText}>
              {item.gameStatus === 'active' ? 'In Progress' : 'Pending'}
            </Text>
          )}
          
          {/* Display final score if game is completed */}
          {item.gameStatus === 'won' || item.gameStatus === 'lost' ? (
            <Text style={styles.scoreText}>
              {item.scores?.player1 || 0} - {item.scores?.player2 || 0}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading game history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (gameHistory.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialCommunityIcons name="sword-cross" size={50} color={COLORS.fade} />
        <Text style={styles.noGamesText}>No game history found</Text>
        <Text style={styles.subText}>Start playing to build your battle record!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battle History</Text>
      
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{gameHistory.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {gameHistory.filter(game => game.userWon).length}
          </Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {gameHistory.filter(game => game.gameStatus === 'lost').length}
          </Text>
          <Text style={styles.statLabel}>Losses</Text>
        </View>
      </View>
      
      <FlatList
        data={gameHistory}
        renderItem={renderGameItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 15,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  gameItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderLeftWidth: 5,
  },
  wonGame: {
    borderLeftColor: COLORS.secondary,
  },
  lostGame: {
    borderLeftColor: COLORS.error,
  },
  pendingGame: {
    borderLeftColor: COLORS.fade,
  },
  gameDetails: {
    flex: 1,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.fade,
  },
  gameStatus: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  outcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  pendingText: {
    fontSize: 16,
    color: COLORS.fade,
  },
  scoreText: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: 5,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
  },
  noGamesText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  subText: {
    color: COLORS.fade,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.fade,
    marginTop: 5,
  },
});
