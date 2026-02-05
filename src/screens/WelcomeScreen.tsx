import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from 'expo-status-bar'
import * as Haptics from 'expo-haptics'

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[ '#0ea5a3', '#10b981', '#16a34a' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <StatusBar style="light" />
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Conectamos profesionales con quienes necesitan sus servicios</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={async () => { if (Platform.OS !== 'web') { try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) } catch {} } navigation.navigate("RegisterRoleSelection"); }}>
              <Text style={styles.primaryButtonText}>Comenzar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={async () => { if (Platform.OS !== 'web') { try { await Haptics.selectionAsync() } catch {} } navigation.navigate("RoleSelection"); }}>
              <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  logoImage: {
    width: 320,
    height: 320,
    marginBottom: 24,
    
  },
  tagline: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#ecfdf5",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#065f46",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#d1fae5",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#ecfdf5",
  },
})
