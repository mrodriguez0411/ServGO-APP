import type React from "../../node_modules/@types/react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from '@expo/vector-icons'
import type { ServiceProvider } from "../types"

interface ServiceProviderCardProps {
  provider: ServiceProvider
  onPress: () => void
}

export const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({ provider, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{provider.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.providerInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.providerName}>{provider.name}</Text>
              {provider.isVerified && <Ionicons name="checkmark-circle" size={16} color="#059669" />}
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.rating}>{provider.rating}</Text>
              <Text style={styles.reviewCount}>({provider.reviewCount})</Text>
            </View>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={12} color="#6b7280" /> {provider.location} • {provider.distance}
              km
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: provider.isAvailable ? "#f0fdf4" : "#fef2f2" }]}>
            <Text style={[styles.statusText, { color: provider.isAvailable ? "#16a34a" : "#dc2626" }]}>
              {provider.isAvailable ? "Disponible" : "Ocupado"}
            </Text>
          </View>
          <Text style={styles.responseTime}>{provider.responseTime}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {provider.description}
      </Text>

      <View style={styles.services}>
        {provider.services.map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.stats}>
          <Text style={styles.completedJobs}>{provider.completedJobs} trabajos completados</Text>
        </View>
        <Text style={styles.hourlyRate}>${provider.hourlyRate}/hora</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: "row",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#ffffff",
  },
  providerInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#475569",
    marginRight: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#475569",
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
  },
  location: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "DMSans-Medium",
  },
  responseTime: {
    fontSize: 10,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
  },
  description: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: "#475569",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stats: {
    flex: 1,
  },
  completedJobs: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
  },
  hourlyRate: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#059669",
  },
})
