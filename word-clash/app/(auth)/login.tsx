import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "@/constants/theme";
import { router } from "expo-router";

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert("Success", "Logged in successfully!");
        router.push("/(tabs)");
        console.log("Succes");
      } else {
        Alert.alert("Error", "Invalid email or password.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.loginText}>LOGIN TO CLASH</Text>
        <Image
          source={require("@/assets/images/start.png")}
          style={{
            width: 200,
            height: 200,
            resizeMode: "contain",
            alignSelf: "center",
            marginTop: 17,
          }}
        />

        <View style={styles.formContainer}>
          <View style={{ marginTop: 20 }}>
            <TextInput
              placeholder="username"
              placeholderTextColor={COLORS.grey}
              style={styles.input}
              selectTextOnFocus={true}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <TextInput
              placeholder="Password"
              placeholderTextColor={COLORS.grey}
              secureTextEntry={true}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View>
            <Text
              style={{
                color: COLORS.fade,
                fontSize: 16,
                fontFamily: "Roboto-Regular",
                fontWeight: "bold",
                marginTop: 20,
                textAlign: "center",
              }}
            >
              Don't have an account yet?
              <Text
                onPress={() => {
                  router.push("/signup");
                }}
                style={{
                  color: COLORS.white,
                  fontSize: 16,
                  fontFamily: "Roboto-Bold",
                  fontWeight: "bold",
                  marginTop: 5,
                  paddingLeft: 5,
                  textDecorationLine: "underline",
                }}
              >
                Sign up
              </Text>
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 20,
                  fontFamily: "Roboto-Bold",
                  fontWeight: "bold",
                }}
              >
                LOGIN
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 40,
  },
  loginText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 35,
    fontFamily: "Bungee-Spice",
    textAlign: "center",
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 5,
  },
  formContainer: {},
  input: {
    width: 300,
    height: 50,
    borderColor: COLORS.fade,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: COLORS.grey,
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});
