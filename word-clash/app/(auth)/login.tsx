import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS } from "@/constants/theme";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from "expo-router";

const login = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>WELCOME TO</Text>
      <Image
        source={require("@/assets/images/logo.png")}
        style={{ width: 400, height: 400 }}
      />
      <TouchableOpacity style={styles.start} onPress={() => {
        router.push("/(tabs)/tournament");
      }}>
        <Text style={styles.getStarted}>
          LET'S CLASH
        </Text>
        <FontAwesome5 name="long-arrow-alt-right" size={24} color="white" />      
        </TouchableOpacity>
        <Text style={{ color: COLORS.white, fontSize: 10, fontFamily: "Roboto-Italic", letterSpacing: 3, marginTop: 50 }}>
            This app was created by PID SOFT
        </Text>
    </View>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    color: COLORS.white,
  },
  welcome: { color: COLORS.white, fontSize: 30, fontFamily: "Roboto-Bold", letterSpacing: 3 },
  getStarted: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: "Roboto-Black",
    letterSpacing: 3,
    width: 250,
    padding: 10,
  },
  start: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 10,
    gap: 10,
  }
  
});
