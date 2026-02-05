import type React from "../../node_modules/@types/react"
import { View, ActivityIndicator, StyleSheet } from "react-native"

interface LoadingSpinnerProps {
  size?: "small" | "large"
  color?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "large", color = "#059669" }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
})
