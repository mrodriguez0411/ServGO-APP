import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

const RegisterRoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const handleSelect = (role: 'client' | 'provider') => {
    navigation.navigate('Register', { initialRole: role });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[ '#0ea5a3', '#10b981', '#16a34a' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.bg}>
          <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
              <Ionicons name="construct" size={32} color="#ecfdf5" />
              <Text style={styles.title}>Crea tu cuenta en ServiGO</Text>
              <Text style={styles.subtitle}>Elige cómo quieres registrarte para personalizar tu experiencia</Text>
            </View>

            <View style={styles.cards}>
              <TouchableOpacity style={styles.card} onPress={() => handleSelect('client')}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="people" size={26} color="#065f46" />
                </View>
                <Text style={styles.cardTitle}>Registrarme como Usuario</Text>
                <Text style={styles.cardText}>
                  Encuentra profesionales verificados para tus necesidades del hogar y proyectos.
                </Text>
                <View style={styles.cardCta}>
                  <Text style={styles.cardCtaText}>Continuar</Text>
                  <Ionicons name="arrow-forward" size={18} color="#065f46" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.card} onPress={() => handleSelect('provider')}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="hammer" size={26} color="#065f46" />
                </View>
                <Text style={styles.cardTitle}>Registrarme como Profesional</Text>
                <Text style={styles.cardText}>
                  Ofrece tus servicios, gestiona trabajos y haz crecer tu cartera de clientes.
                </Text>
                <View style={styles.cardCta}>
                  <Text style={styles.cardCtaText}>Continuar</Text>
                  <Ionicons name="arrow-forward" size={18} color="#065f46" />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>Podrás cambiar esta configuración más adelante desde tu perfil.</Text>
          </SafeAreaView>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  bg: { flex: 1, padding: 20 },
  safe: { flex: 1, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 12 },
  title: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '800',
    color: '#ecfdf5',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#d1fae5',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  cards: { gap: 14 },
  card: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#065f46' },
  cardText: { marginTop: 6, color: '#064e3b' },
  cardCta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardCtaText: { color: '#065f46', fontWeight: '700' },
  footer: { textAlign: 'center', color: '#d1fae5', fontSize: 12, marginBottom: 8 },
});

export default RegisterRoleSelectionScreen;
