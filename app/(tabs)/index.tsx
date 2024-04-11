import {
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  View,
  Text,
} from "react-native";
import auth from "@react-native-firebase/auth";
import React, { useState, useEffect } from "react";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

export default function TabOneScreen() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [user, setuser] = useState();
  const [error, seterror] = useState("");
  const [isLoginng, setisLoginng] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  async function onAuthStateChanged(user) {
    if (user) {
      const token = await user.getIdToken();
      console.log("User logged in: ", user);
      console.log("Token ID: ", token);
    } else {
      console.log("User logged out");
    }
    setuser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  const onSignUpWithPassword = () => {
    setisLoginng(true);
    seterror("");
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log("Account was created and logined");
        setisLoginng(false);
        setemail("");
        setpassword("");
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          console.log("Account exist");
        }
        if (error.code === "auth/invalid-email") {
          console.log("Email is not valid");
        }
        console.log(error);
        setisLoginng(false);
      });
  };

  async function onGoogleButtonPress() {
    setisLoginng(true);
    seterror("");
    try {
      // Configure Google Signin
      GoogleSignin.configure({
        webClientId:
          "619148008861-pvqi0b1cf108donng5eckk6ua5nmfmc3.apps.googleusercontent.com",
        scopes: ["profile", "email"],
        offlineAccess: true,
        profileImageSize: 120,
        hostedDomain: "",
        forceCodeForRefreshToken: true,
        accountName: "",
      });
      // Start the sign in process
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      if (error) {
        console.log({ error });
        setisLoginng(false);
        return;
      }
      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.log({ error });
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Operation (e.g. sign in) cancelled by the user.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Operation (e.g. sign in) is in progress already.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available or outdated.");
      } else {
        console.log("Unknown error.", error);
      }
    } finally {
      setisLoginng(false);
    }
  }

  useEffect(() => {
    const subcriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subcriber;
  }, []);

  if (initializing) {
    return null;
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {isLoginng && (
          <View>
            <Text>Loading...</Text>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View style={{ padding: 20, width: "80%" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Sign up</Text>
          <View style={{ marginTop: 20 }}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setemail}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setpassword}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
            />
          </View>
          <TouchableOpacity
            onPress={onSignUpWithPassword}
            style={{ backgroundColor: "#ccc", padding: 10, marginTop: 20 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Sign up</Text>
          </TouchableOpacity>
          <GoogleSigninButton
            style={{ width: 192, height: 48, marginTop: 20 }}
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Dark}
            onPress={onGoogleButtonPress}
            disabled={isLoginng}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome {user.email}</Text>
      <Text>Your email is verified: {user.emailVerified ? "yes" : "no"}</Text>
      <Image
        source={{
          uri: user.photoURL,
        }}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          marginTop: 20,
        }}
      />
      {user.emailVerified ? null : (
        <Button
          title={
            verificationEmailSent ? "Verification email sent" : "Verify email"
          }
          onPress={async () => {
            await auth().currentUser.sendEmailVerification();
            setVerificationEmailSent(true);
          }}
        />
      )}
      <Button
        title="Check verification status"
        onPress={() => onAuthStateChanged(user)}
      />
      <Button title="Sign out" onPress={() => auth().signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
