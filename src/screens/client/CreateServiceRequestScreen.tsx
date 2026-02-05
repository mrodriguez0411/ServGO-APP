"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { serviceCategories } from "../../data/mockData"

export default function CreateServiceRequestScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    minBudget: "",
    maxBudget: "",
    urgency: "medium" as "low" | "medium" | "high",
    scheduledDate: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    if (!formData.minBudget || !formData.maxBudget) {
      Alert.alert("Error", "Por favor especifica un rango de presupuesto")
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      Alert.alert("Éxito", "Tu solicitud de servicio ha sido creada exitosamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      Alert.alert("Error", "Error al crear la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (urgency: "low" | "medium" | "high") => {
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.title}>Solicitar Servicio</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Título del servicio *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => updateFormData("title", value)}
                placeholder="Ej: Reparación de grifo de cocina"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripción detallada *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                placeholder="Describe el trabajo que necesitas..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Categoría *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {serviceCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.category === category.name && styles.categoryOptionSelected,
                    ]}
                    onPress={() => updateFormData("category", category.name)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color={formData.category === category.name ? "#ffffff" : category.color}
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formData.category === category.name && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ubicación *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => updateFormData("location", value)}
                placeholder="Dirección o zona donde necesitas el servicio"
              />
            </View>

            <View style={styles.budgetContainer}>
              <Text style={styles.label}>Presupuesto estimado (USD) *</Text>
              <View style={styles.budgetInputs}>
                <View style={styles.budgetInput}>
                  <Text style={styles.budgetLabel}>Mínimo</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.minBudget}
                    onChangeText={(value) => updateFormData("minBudget", value)}
                    placeholder="50"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.budgetInput}>
                  <Text style={styles.budgetLabel}>Máximo</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.maxBudget}
                    onChangeText={(value) => updateFormData("maxBudget", value)}
                    placeholder="100"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Urgencia</Text>
              <View style={styles.urgencyOptions}>
                {(["low", "medium", "high"] as const).map((urgency) => (
                  <TouchableOpacity
                    key={urgency}
                    style={[
                      styles.urgencyOption,
                      formData.urgency === urgency && styles.urgencyOptionSelected,
                      { borderColor: getUrgencyColor(urgency) },
                    ]}
                    onPress={() => updateFormData("urgency", urgency)}
                  >
                    <View
                      style={[
                        styles.urgencyDot,
                        { backgroundColor: getUrgencyColor(urgency) },
                        formData.urgency === urgency && styles.urgencyDotSelected,
                      ]}
                    />
                    <Text style={[styles.urgencyText, formData.urgency === urgency && styles.urgencyTextSelected]}>
                      {urgency === "low" ? "Baja" : urgency === "medium" ? "Media" : "Alta"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha preferida</Text>
              <TextInput
                style={styles.input}
                value={formData.scheduledDate}
                onChangeText={(value) => updateFormData("scheduledDate", value)}
                placeholder="Ej: Mañana por la tarde, Este fin de semana"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.submitButtonText}>{isLoading ? "Creando solicitud..." : "Crear Solicitud"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
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
  title: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#475569",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  categoriesScroll: {
    marginTop: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    marginRight: 12,
  },
  categoryOptionSelected: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  categoryOptionText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#475569",
    marginLeft: 8,
  },
  categoryOptionTextSelected: {
    color: "#ffffff",
  },
  budgetContainer: {
    marginBottom: 24,
  },
  budgetInputs: {
    flexDirection: "row",
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: "#6b7280",
    marginBottom: 8,
  },
  urgencyOptions: {
    flexDirection: "row",
    gap: 12,
  },
  urgencyOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#ffffff",
  },
  urgencyOptionSelected: {
    backgroundColor: "#f8fafc",
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  urgencyDotSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  urgencyText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#6b7280",
  },
  urgencyTextSelected: {
    color: "#475569",
  },
  submitButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#ffffff",
  },
})
