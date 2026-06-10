import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { rf } from '../utils/responsive';

export default function OrderConfirmScreen({ navigation, route }) {
  const { orderId, address, total, method, items } = route.params;
  const { ordersList } = useCart();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Retrieve current order status from global state for live tracking
  const currentOrder = ordersList.find(o => o.id === orderId);
  const status = currentOrder ? currentOrder.status : 'pending';

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStepStatus = (index) => {
    if (status === 'cancelled') return false;
    if (status === 'delivered') return true;
    if (status === 'shipped') return index <= 2; // Placed, Packaged, Out for delivery
    return index === 0; // pending: only Placed
  };

  const STEPS = [
    { icon: '✅', label: 'Order placed',      done: getStepStatus(0) },
    { icon: '📦', label: 'Being packaged',    done: getStepStatus(1) },
    { icon: '🚚', label: 'Out for delivery',  done: getStepStatus(2) },
    { icon: '🏠', label: 'Delivered',          done: getStepStatus(3) },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>

        {/* Animated checkmark */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.successIcon}>✓</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.orderId}>{orderId}</Text>
          <Text style={styles.subtitle}>
            Thank you! Your order has been received and is being processed.
          </Text>
        </Animated.View>

        {status === 'cancelled' && (
          <View style={styles.cancelBanner}>
            <Text style={styles.cancelBannerText}>⚠️ This order has been Cancelled.</Text>
          </View>
        )}

        {/* Order details card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Amount Paid</Text>
            <Text style={styles.cardValue}>ETB {(total * 55).toLocaleString()}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Payment via</Text>
            <Text style={styles.cardValue}>{method}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Deliver to</Text>
            <Text style={styles.cardValue}>{address.subcity}, {address.city}</Text>
          </View>
          <View style={[styles.cardRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.cardLabel}>Items</Text>
            <Text style={styles.cardValue}>{items.length} product(s)</Text>
          </View>
        </View>

        {/* Delivery tracking steps */}
        <View style={styles.trackCard}>
          <Text style={styles.trackTitle}>Delivery Tracker</Text>
          {STEPS.map((step, i) => (
            <View key={step.label} style={styles.trackRow}>
              <View style={[styles.trackDot, step.done && styles.trackDotActive]}>
                <Text style={styles.trackDotText}>{step.icon}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.trackLine, step.done && styles.trackLineDone]} />
              )}
              <Text style={[styles.trackLabel, step.done && styles.trackLabelActive]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.replace('MainTabs')}
          activeOpacity={0.8}
        >
          <Text style={styles.homeBtnText}>Continue Shopping</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  successCircle: {
    width: rf(80), height: rf(80), borderRadius: rf(40),
    backgroundColor: '#10b981', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20, marginTop: 20,
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  successIcon: { fontSize: rf(40), color: '#ffffff', fontWeight: '800' },
  title: { fontSize: rf(22), fontWeight: '800', color: '#111827', marginBottom: 4 },
  orderId: { fontSize: rf(12.5), color: '#2563eb', fontWeight: '700',
    fontFamily: 'monospace', marginBottom: 10 },
  subtitle: { fontSize: rf(12.5), color: '#6b7280', textAlign: 'center',
    lineHeight: 20, marginBottom: 24, paddingHorizontal: 16 },
  cancelBanner: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 12, padding: 12, width: '100%', marginBottom: 16, alignItems: 'center'
  },
  cancelBannerText: { color: '#ef4444', fontWeight: '700', fontSize: rf(12.5) },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    width: '100%', marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cardLabel: { fontSize: rf(12.5), color: '#6b7280', fontWeight: '500' },
  cardValue: { fontSize: rf(12.5), fontWeight: '700', color: '#111827' },
  trackCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    width: '100%', marginBottom: 24, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6 },
  trackTitle: { fontSize: rf(14), fontWeight: '800', color: '#111827', marginBottom: 16 },
  trackRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, height: 42, position: 'relative' },
  trackDot: { width: rf(30), height: rf(30), borderRadius: rf(15),
    backgroundColor: '#f3f4f6', justifyContent: 'center',
    alignItems: 'center', marginRight: 12, zIndex: 2 },
  trackDotActive: { backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#10b981' },
  trackDotText: { fontSize: rf(13) },
  trackLine: { position: 'absolute', left: rf(15), top: rf(30),
    width: 2, height: 20, backgroundColor: '#e5e7eb', zIndex: 1 },
  trackLineDone: { backgroundColor: '#10b981' },
  trackLabel: { fontSize: rf(12.5), color: '#9ca3af', fontWeight: '500' },
  trackLabelActive: { color: '#10b981', fontWeight: '700' },
  homeBtn: { backgroundColor: '#2563eb', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', width: '100%',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  homeBtnText: { color: '#ffffff', fontSize: rf(14.5), fontWeight: '700' },
});
