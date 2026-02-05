import type React from "../../node_modules/@types/react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from '@expo/vector-icons'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  size?: number
  readonly?: boolean
  color?: string
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 20,
  readonly = false,
  color = "#FF6B35",
}) => {
  const handleStarPress = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star, i) => (
        <TouchableOpacity key={star} onPress={() => handleStarPress(star)} disabled={readonly} style={styles.star}>
          <Ionicons
            key={i}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? color : "#E0E0E0"}
            style={i < 4 ? { marginRight: 2 } : {}}
          />
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 2,
  },
})
