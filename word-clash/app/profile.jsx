import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUserContext } from '@/context/UserContext';
import { COLORS } from '@/constants/theme';

const Profile = () => {
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: '0%'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useUserContext();

  useEffect(() => {
    const fetchUserGameStats = async () => {
      if (!userData || !userData.userId) {
        console.log("No user logged in");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`https://serverpid.onrender.com/usergamesessions/${userData.userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("User game stats:", data);
          
          // Calculate stats from game sessions
          const gameSessions = data.gameSessions || [];
          const completedGames = gameSessions.filter(game => game.status === 'completed');
          const totalGames = completedGames.length;
          const wins = completedGames.filter(game => game.winner === userData.userId).length;
          const losses = totalGames - wins;
          const winRate = totalGames > 0 ? `${Math.round((wins / totalGames) * 100)}%` : '0%';
          
          setGameStats({
            totalGames,
            wins,
            losses,
            winRate
          });
        } else {
          console.error("Failed to fetch user stats");
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserGameStats();
  }, [userData]);

  const renderGameStats = () => {
    if (isLoading) {
      return <Text style={styles.loadingText}>Loading stats...</Text>;
    }
    
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Battle Statistics</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gameStats.totalGames}</Text>
            <Text style={styles.statLabel}>Total Games</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gameStats.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gameStats.losses}</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>
        </View>
        
        <View style={styles.winRateContainer}>
          <Text style={styles.winRateLabel}>Win Rate</Text>
          <Text style={styles.winRateValue}>{gameStats.winRate}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderGameStats()}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    width: '90%',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statsTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.secondary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.fade,
    fontSize: 14,
    marginTop: 5,
  },
  winRateContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 8,
  },
  winRateLabel: {
    color: COLORS.fade,
    fontSize: 16,
  },
  winRateValue: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
  },
  loadingText: {
    color: COLORS.fade,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
  },
});