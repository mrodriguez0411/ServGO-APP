import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onLogout?: () => void;
}

const PendingApprovalScreen: React.FC<Props> = ({ onLogout }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="time-outline" size={48} color="#f59e0b" />
      </View>
      <Text style={styles.title}>Cuenta en revisión</Text>
      <Text style={styles.message}>
        Hemos recibido tu información y documentos. Un administrador revisará tu cuenta y te notificaremos por correo electrónico cuando sea aprobada.
      </Text>

      <View style={styles.noteBox}>
        <Ionicons name="information-circle-outline" size={20} color="#2563eb" />
        <Text style={styles.noteText}>
          Este proceso puede demorar hasta 24-48 horas. Gracias por tu paciencia.
        </Text>
      </View>

      {onLogout && (
        <TouchableOpacity style={styles.button} onPress={onLogout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fffbeb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PendingApprovalScreen;
