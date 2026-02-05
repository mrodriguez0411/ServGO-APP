import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listPending, approveUser, rejectUser, type PendingUser } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';

const AdminReviewScreen: React.FC = () => {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listPending();
      setPending(items);
    } catch (e) {
      console.warn('No se pudo cargar la lista de pendientes:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id: string) => {
    try {
      await approveUser(id);
      await load();
      Alert.alert('Aprobado', 'El usuario fue aprobado exitosamente.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo aprobar el usuario.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectUser(id);
      await load();
      Alert.alert('Rechazado', 'El usuario fue rechazado.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo rechazar el usuario.');
    }
  };

  const renderItem = ({ item }: { item: PendingUser }) => {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.userType === 'provider' ? 'Profesional' : 'Usuario'}</Text>
          </View>
        </View>
        <Text style={styles.subText}>{item.email}</Text>
        <Text style={styles.subText}>{item.phone}</Text>

        {item.documents && item.documents.length > 0 && (
          <View style={styles.docsRow}>
            {item.documents.map(doc => (
              <Image key={doc.id} source={{ uri: doc.url }} style={styles.docThumb} resizeMode="cover" />
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.approve]} onPress={() => handleApprove(item.id)}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.actionText}>Aprobar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.reject]} onPress={() => handleReject(item.id)}>
            <Ionicons name="close" size={18} color="#fff" />
            <Text style={styles.actionText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Revisión de cuentas</Text>
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pending}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-done-outline" size={36} color="#10b981" />
            <Text style={styles.emptyText}>No hay cuentas pendientes</Text>
          </View>
        ) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  logout: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoutText: { color: '#ef4444', fontWeight: '600' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  badge: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#1d4ed8', fontSize: 12, fontWeight: '700' },
  subText: { color: '#4b5563', fontSize: 13, marginTop: 4 },
  docsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  docThumb: { width: 80, height: 50, borderRadius: 6, backgroundColor: '#e5e7eb' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  approve: { backgroundColor: '#10b981' },
  reject: { backgroundColor: '#ef4444' },
  actionText: { color: '#fff', fontWeight: '700' },
  emptyBox: { alignItems: 'center', padding: 24 },
  emptyText: { marginTop: 8, color: '#6b7280' },
});

export default AdminReviewScreen;
