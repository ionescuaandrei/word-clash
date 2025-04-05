import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Button,
  Platform,
  Alert
} from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS } from "@/constants/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from 'expo-image-picker';

const profile = () => {
  const [profileImage, setProfileImage] = useState(null);

  const pickImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to the photo library in your settings.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
      });

      if (!result.canceled) {
          if (result.assets && result.assets.length > 0) {
               setProfileImage(result.assets[0].uri);
          } else {
               console.warn('Image picker result missing assets.');
          }
      }
  };

  return (
      <View style={styles.container}>
           <View
              style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
              <Text style={styles.titlePart1}>My</Text>
              <Text style={styles.titlePart2}> Profile</Text>
          </View>

          <View style={styles.profileSection}>
              <TouchableOpacity onPress={pickImage}>
                  {profileImage ? (
                      <Image
                          source={{ uri: profileImage }}
                          style={styles.profileImage}
                      />
                  ) : (
                      <FontAwesome name="user-circle-o" size={150} color={COLORS.white} />
                  )}
              </TouchableOpacity>

              <Text style={styles.user}>Ionescu Andrei</Text>

              <View style={styles.quickStats}>
                  <Text style={{ fontSize: 30, color: COLORS.white, marginBottom: 10 }}>Quick Stats:</Text>
                  <View style={styles.statRow}>
                      <Text style={styles.stats}>Total Wins/Loses:</Text>
                      <Text style={styles.data}>100/30</Text>
                  </View>
                  <View style={styles.statRow}>
                      <Text style={styles.stats}>Win rate:</Text>
                      <Text style={styles.data}>77%</Text>
                  </View>
                  <View style={styles.statRow}>
                      <Text style={styles.stats}>Most Used Word Type:</Text>
                      <Text style={styles.data}>Risky</Text>
                  </View>
              </View>
          </View>
      </View>
  );
};

export default profile;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: COLORS.background,
      paddingVertical: 40,
      paddingHorizontal: 20,
  },
   titlePart1: {
      color: COLORS.white,
      fontSize: 35,
      fontFamily: "Roboto-Bold",
  },
   titlePart2: {
      color: COLORS.secondary,
      fontSize: 35,
      fontFamily: "Roboto-Bold",
  },
  profileSection: {
      marginTop: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: '100%',
  },
  profileImage: {
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 2,
      borderColor: COLORS.secondary,
      backgroundColor: COLORS.white,
  },
  user: {
      color: COLORS.white,
      fontSize: 35,
      fontFamily: "Roboto-Bold",
      marginTop: 15,
      textAlign: "center",
  },
  quickStats: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 30,
      width: '100%',
  },
   statRow: {

      flexDirection: "row",
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      marginBottom: 5,
  },
  stats: {
      color: COLORS.white,
      fontSize: 20,
      fontFamily: "Roboto-Bold",
      
  },
  data: {
      color: COLORS.white,
      fontSize: 20,
      fontFamily: "Roboto-Regular",
  },
});
