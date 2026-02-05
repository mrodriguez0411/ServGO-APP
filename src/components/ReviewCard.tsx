import type React from "../../node_modules/@types/react"
import { View, Text, StyleSheet, Image } from "react-native"
import type { Review } from "../types"
import { StarRating } from "./StarRating"

interface ReviewCardProps {
  review: Review
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{review.clientName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.nameAndDate}>
            <Text style={styles.clientName}>{review.clientName}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        <StarRating rating={review.rating} readonly size={16} />
      </View>

      {review.comment && <Text style={styles.comment}>{review.comment}</Text>}

      {review.images && review.images.length > 0 && (
        <View style={styles.imagesContainer}>
          {review.images.slice(0, 3).map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E8B57",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  nameAndDate: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  comment: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
})
