import type React from "../../node_modules/@types/react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from '@expo/vector-icons'
import type { Job } from "../types"

interface JobCardProps {
  job: Job
  onPress: () => void
  userType: "client" | "provider"
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress, userType }) => {
  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "pending":
        return "#f59e0b"
      case "accepted":
        return "#3b82f6"
      case "in-progress":
        return "#8b5cf6"
      case "completed":
        return "#10b981"
      case "cancelled":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = (status: Job["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "accepted":
        return "Aceptado"
      case "in-progress":
        return "En Progreso"
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getUrgencyColor = (urgency: Job["urgency"]) => {
    switch (urgency) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {job.title}
          </Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{job.category}</Text>
            <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(job.urgency) }]} />
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>{getStatusText(job.status)}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={14} color="#6b7280" />
          <Text style={styles.detailText}>{userType === "client" ? job.providerName : job.clientName}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text style={styles.detailText}>{formatDate(job.scheduledDate)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.budget}>
          ${job.budget.final || `${job.budget.min}-${job.budget.max}`}
          {job.budget.final ? "" : " USD"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#475569",
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: "#6b7280",
    marginRight: 6,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "DMSans-Medium",
  },
  description: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budget: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#059669",
  },
})
