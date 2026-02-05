"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView } from "react-native"
import { Ionicons } from '@expo/vector-icons'
import { StarRating } from "../components/StarRating"
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'WriteReview'>;

export default function WriteReviewScreen({ route, navigation }: Props) {
  const { job } = route.params
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Por favor selecciona una calificación")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      Alert.alert("Reseña enviada", "Gracias por tu calificación. Ayuda a otros usuarios a tomar mejores decisiones.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la reseña. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escribir Reseña</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.providerName}>Proveedor: {job.providerName}</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>¿Cómo calificarías este servicio?</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={rating} onRatingChange={setRating} size={32} color="#FF6B35" />
            <Text style={styles.ratingText}>
              {rating === 0
                ? "Selecciona una calificación"
                : rating === 1
                  ? "Muy malo"
                  : rating === 2
                    ? "Malo"
                    : rating === 3
                      ? "Regular"
                      : rating === 4
                        ? "Bueno"
                        : "Excelente"}
            </Text>
          </View>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Comparte tu experiencia (opcional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Describe cómo fue el servicio, la puntualidad, la calidad del trabajo, etc."
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || isSubmitting}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? "Enviando..." : "Enviar Reseña"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  jobInfo: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  providerName: {
    fontSize: 14,
    color: "#666",
  },
  ratingSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  commentSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: "#2E8B57",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
