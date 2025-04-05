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
import { useUserContext } from "@/context/UserContext";

const signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUserData } = useUserContext();

  const handleSignup = async () => {
    try {
      const response = await fetch("https://serverpid.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store user data in context
        setUserData({
          email: data.user.email,
          userId: data.user.id, // Use the correct user ID from the response
        });

        Alert.alert("Success", "Account created successfully!");
        router.push("/(tabs)");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to create account.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.loginText}>SIGNUP TO CLASH</Text>
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
              placeholder="Enter your email"
              placeholderTextColor={COLORS.grey}
              style={styles.input}
              selectTextOnFocus={true}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <TextInput
              placeholder="Enter your password"
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
              Have an account?
              <Text
                onPress={() => {
                  router.push("/login");
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
                Login
              </Text>
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 20,
                  fontFamily: "Roboto-Bold",
                  fontWeight: "bold",
                }}
              >
                REGISTER
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default signup;

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
