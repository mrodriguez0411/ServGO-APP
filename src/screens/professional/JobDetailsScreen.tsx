"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from "../../contexts/AuthContext"
import type { Job } from "../../types"

interface JobDetailsScreenProps {
  route: {
    params: {
      job: Job
    }
  }
  navigation: any
}

export default function JobDetailsScreen({ route, navigation }: JobDetailsScreenProps) {
  const { job } = route.params
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStatusUpdate = async (newStatus: Job["status"]) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      Alert.alert("Éxito", `Estado actualizado a ${getStatusText(newStatus)}`)
    } catch (error) {
      Alert.alert("Error", "Error al actualizar el estado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactUser = () => {
    // TODO: Navigate to chat screen
    const contactName = user?.userType === "client" ? job.providerName : job.clientName
    Alert.alert("Contactar", `Función de chat con ${contactName} próximamente`)
  }

  const handleWriteReview = () => {
    navigation.navigate("WriteReview", { job })
  }

  const canUpdateStatus = () => {
    if (user?.userType === "provider") {
      return job.status === "pending" || job.status === "accepted"
    }
    return false
  }

  const getAvailableActions = () => {
    const actions = []

    if (user?.userType === "provider" && job.status === "pending") {
      actions.push({ title: "Aceptar Trabajo", action: () => handleStatusUpdate("accepted"), color: "#059669" })
    }

    if (user?.userType === "provider" && job.status === "accepted") {
      actions.push({ title: "Iniciar Trabajo", action: () => handleStatusUpdate("in-progress"), color: "#8b5cf6" })
    }

    if (user?.userType === "provider" && job.status === "in-progress") {
      actions.push({ title: "Marcar Completado", action: () => handleStatusUpdate("completed"), color: "#10b981" })
    }

    if (job.status !== "completed" && job.status !== "cancelled") {
      actions.push({ title: "Cancelar", action: () => handleStatusUpdate("cancelled"), color: "#ef4444" })
    }

    if (user?.userType === "client" && job.status === "completed") {
      actions.push({ title: "Escribir Reseña", action: handleWriteReview, color: "#FF6B35" })
    }

    return actions
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#475569" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Trabajo</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + "20" }]}>
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>{getStatusText(job.status)}</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.category}>{job.category}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{user?.userType === "client" ? "Proveedor" : "Cliente"}</Text>
              <Text style={styles.infoValue}>{user?.userType === "client" ? job.providerName : job.clientName}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ubicación</Text>
              <Text style={styles.infoValue}>{job.location}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha programada</Text>
              <Text style={styles.infoValue}>{formatDate(job.scheduledDate)}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Presupuesto</Text>
              <Text style={styles.infoValue}>
                {job.budget.final ? `$${job.budget.final} USD` : `$${job.budget.min}-${job.budget.max} USD`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {job.completedDate && (
          <View style={styles.completionSection}>
            <Text style={styles.sectionTitle}>Completado</Text>
            <Text style={styles.completionDate}>{formatDate(job.completedDate)}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactUser}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6b7280" />
          <Text style={styles.contactButtonText}>Contactar</Text>
        </TouchableOpacity>

        {getAvailableActions().map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={action.action}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>{isLoading ? "Procesando..." : action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#475569",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  statusSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#475569",
    textAlign: "center",
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#059669",
  },
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#475569",
  },
  descriptionSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#475569",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
    lineHeight: 24,
  },
  completionSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  completionDate: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#10b981",
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#059669",
    backgroundColor: "#ffffff",
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#059669",
    marginLeft: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#ffffff",
  },
})
