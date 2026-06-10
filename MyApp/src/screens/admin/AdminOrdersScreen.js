import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { rf } from '../../utils/responsive';

const STATUS = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  shipped: { label: 'Shipped', color: '#3b82f6', bg: '#eff6ff' },
  delivered: { label: 'Delivered', color: '#10b981', bg: '#d1fae5' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
};

export default function AdminOrdersScreen({ navigation }) {
  const { ordersList, updateOrderStatus } = useCart();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? ordersList
    : ordersList.filter(o => o.status === filter);

  const updateStatus = (orderId, newStatus) => {
    Alert.alert(
      'Update Status',
      `Mark order ${orderId} as "${STATUS[newStatus].label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateOrderStatus(orderId, newStatus);
            Alert.alert('Success', `Order status updated to ${STATUS[newStatus].label}.`);
          },
        },
      ]
    );
  };

  const stats = {
    total: ordersList.length,
    pending: ordersList.filter(o => o.status === 'pending').length,
    shipped: ordersList.filter(o => o.status === 'shipped').length,
    delivered: ordersList.filter(o => o.status === 'delivered').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Dashboard</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Manage Orders</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          ['Total', stats.total, '#6366f1', '#eef2ff'],
          ['Pending', stats.pending, '#f59e0b', '#fef3c7'],
          ['Shipped', stats.shipped, '#3b82f6', '#eff6ff'],
          ['Delivered', stats.delivered, '#10b981', '#d1fae5'],
        ].map(([label, count, color, bg]) => (
          <View key={label} style={[styles.statCard, { backgroundColor: bg }]}>
            <Text style={[styles.statCount, { color }]}>{count}</Text>
            <Text style={[styles.statLabel, { color }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, filter === tab && styles.tabActive]}
              onPress={() => setFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        renderItem={({ item }) => {
          const s = STATUS[item.status] || STATUS.pending;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <Text style={styles.orderDate}>{item.date}</Text>
                </View>

                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.customer}>Customer: {item.customer}</Text>
              <Text style={styles.address}>Address: {item.address}</Text>
              <Text style={styles.items} numberOfLines={2}>Items: {item.items.join(', ')}</Text>
              <Text style={styles.total}>Total: ETB {(item.total * 55).toLocaleString()}</Text>

              <View style={styles.divider} />
              <Text style={styles.actionLabel}>Update Delivery Status:</Text>

              <View style={styles.actionRow}>
                {Object.entries(STATUS).map(([key, val]) => {
                  const isCurrent = key === item.status;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.actionBtn, 
                        { borderColor: val.color },
                        isCurrent && { backgroundColor: val.color }
                      ]}
                      disabled={isCurrent}
                      onPress={() => updateStatus(item.id, key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.actionBtnText, 
                        { color: isCurrent ? '#ffffff' : val.color }
                      ]}>
                        {val.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No orders found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: rf(11.5),
    fontWeight: '700',
    color: '#374151',
  },
  title: { fontSize: rf(20), fontWeight: '800', color: '#111827', paddingHorizontal: 20, marginVertical: 10 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginVertical: 8 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  statCount: { fontSize: rf(16), fontWeight: '850' },
  statLabel: { fontSize: rf(9.5), fontWeight: '600', marginTop: 2 },
  tabsWrapper: { height: 42, marginVertical: 10 },
  tabsScroll: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { fontSize: rf(11.5), color: '#374151', fontWeight: '700' },
  tabTextActive: { color: '#ffffff' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: rf(14), fontWeight: '800', color: '#111827', fontFamily: 'monospace' },
  orderDate: { fontSize: rf(11.5), color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: rf(11), fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
  customer: { fontSize: rf(12.5), color: '#111827', marginBottom: 4, fontWeight: '700' },
  address: { fontSize: rf(12), color: '#4b5563', marginBottom: 4 },
  items: { fontSize: rf(12), color: '#4b5563', marginBottom: 4 },
  total: { fontSize: rf(13.5), fontWeight: '850', color: '#2563eb' },
  actionLabel: { fontSize: rf(11.5), color: '#6b7280', fontWeight: '700', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  actionBtnText: { fontSize: rf(11), fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 60, color: '#9ca3af', fontSize: rf(14) },
});
