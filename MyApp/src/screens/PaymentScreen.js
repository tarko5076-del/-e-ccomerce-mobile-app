import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { rf } from '../utils/responsive';

const METHODS = [
  { id: 'telebirr', label: 'Telebirr',    icon: '📱', color: '#FF6B00', bg: '#fff7f0' },
  { id: 'cbebirr',  label: 'CBE Birr',    icon: '🏦', color: '#1B4F8A', bg: '#eff6ff' },
  { id: 'chapa',    label: 'Chapa (Card)', icon: '💳', color: '#2EB67D', bg: '#f0fdf4' },
  { id: 'mpesa',    label: 'M-Pesa',       icon: '📲', color: '#00A651', bg: '#f0fdf4' },
];

export default function PaymentScreen({ navigation, route }) {
  const { address } = route.params;
  const { cart, clearCart, cartTotal, addOrder } = useCart();
  const { user, addOrderToUser } = useAuth();
  const [method, setMethod] = useState('telebirr');
  const [loading, setLoading] = useState(false);

  const tax = cartTotal * 0.15;
  const total = cartTotal + tax;

  const initiateChapa = async () => {
    setLoading(true);
    try {
      // Mock payment API delay
      await new Promise(r => setTimeout(r, 1500));

      const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        customer: address.fullName,
        customerEmail: address.email || user?.email || 'guest@example.com',
        total: Math.round(total),
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        items: cart.map(i => i.name),
        address: `${address.street}, ${address.subcity}, ${address.city}`,
        method: METHODS.find(m => m.id === method)?.label,
      };

      // Save order globally and to user account
      const savedOrder = await addOrder(newOrder, user?.id);
      if (savedOrder) {
        addOrderToUser(savedOrder);
      } else {
        addOrderToUser(newOrder);
      }
      
      // Clear shopping cart
      clearCart();

      // Redirect to Order Confirmation
      navigation.replace('OrderConfirm', {
        orderId: newOrder.id,
        address,
        total,
        method: newOrder.method,
        items: cart,
      });
    } catch (err) {
      Alert.alert('Payment failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          {['Cart', 'Address', 'Payment', 'Done'].map((step, i) => (
            <React.Fragment key={step}>
              <View style={[
                styles.progressStep,
                i === 2 && styles.progressStepActive,
                i < 2 && styles.progressStepDone,
              ]}>
                <Text style={[
                  styles.progressText,
                  i <= 2 && styles.progressTextActive,
                ]}>
                  {step}
                </Text>
              </View>
              {i < 3 && (
                <View style={[
                  styles.progressLine,
                  i < 2 && styles.progressLineDone,
                ]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.title}>Payment Details</Text>

        {/* Order summary with ETB conversion */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          {cart.map(item => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryItem} numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.summaryPrice}>
                ETB {(item.price * item.quantity * 55).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryPrice}>
              ETB {(cartTotal * 55).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (15%)</Text>
            <Text style={styles.summaryPrice}>
              ETB {(tax * 55).toLocaleString()}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              ETB {(total * 55).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Delivery address brief */}
        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>📍 Delivering to:</Text>
          <Text style={styles.addressText}>{address.fullName}</Text>
          <Text style={styles.addressText}>
            {address.street}, {address.subcity}, {address.city}
          </Text>
          <Text style={styles.addressText}>{address.phone}</Text>
        </View>

        {/* Payment methods */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {METHODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.methodCard,
              method === m.id && { borderColor: m.color, borderWidth: 2 },
            ]}
            onPress={() => setMethod(m.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIcon, { backgroundColor: m.bg }]}>
              <Text style={{ fontSize: rf(20) }}>{m.icon}</Text>
            </View>
            <Text style={styles.methodLabel}>{m.label}</Text>
            <View style={[
              styles.radio,
              method === m.id && { backgroundColor: m.color, borderColor: m.color },
            ]}>
              {method === m.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Pay button */}
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnLoading]}
          onPress={initiateChapa}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.payBtnText}>
              Pay ETB {(total * 55).toLocaleString()} via {METHODS.find(m2 => m2.id === method)?.label}
            </Text>
          )}
        </TouchableOpacity>

        {/* Footer Secured by Chapa */}
        <View style={styles.secureRow}>
          <Text style={styles.secureText}>
            🔐 Secured by Chapa · 256-bit SSL encryption
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' },
  progressStep: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#e5e7eb', minWidth: 60, alignItems: 'center'
  },
  progressStepActive: { backgroundColor: '#2563eb' },
  progressStepDone: { backgroundColor: '#10b981' },
  progressText: { fontSize: rf(10.5), color: '#6b7280', fontWeight: '700' },
  progressTextActive: { color: '#ffffff' },
  progressLine: { flex: 1, height: 3, backgroundColor: '#e5e7eb', marginHorizontal: 4 },
  progressLineDone: { backgroundColor: '#10b981' },
  title: { fontSize: rf(20), fontWeight: '800', color: '#111827', marginBottom: 16 },
  summaryCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  summaryTitle: { fontSize: rf(14), fontWeight: '800', color: '#111827', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryItem: { fontSize: rf(12), color: '#4b5563', flex: 1, marginRight: 8 },
  summaryLabel: { fontSize: rf(12), color: '#6b7280' },
  summaryPrice: { fontSize: rf(12.5), fontWeight: '600', color: '#111827' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 },
  totalRow: { marginTop: 4 },
  totalLabel: { fontSize: rf(14), fontWeight: '800', color: '#111827' },
  totalAmount: { fontSize: rf(16.5), fontWeight: '800', color: '#2563eb' },
  addressCard: {
    backgroundColor: '#eff6ff', borderRadius: 14, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe',
  },
  addressTitle: { fontSize: rf(12.5), fontWeight: '800', color: '#1e40af', marginBottom: 6 },
  addressText: { fontSize: rf(12), color: '#1e3a8a', marginBottom: 2 },
  sectionTitle: { fontSize: rf(14), fontWeight: '800', color: '#111827', marginBottom: 10 },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#e5e7eb', elevation: 1,
  },
  methodIcon: {
    width: rf(40), height: rf(40), borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  methodLabel: { flex: 1, fontSize: rf(13.5), fontWeight: '700', color: '#1f2937' },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#d1d5db',
    justifyContent: 'center', alignItems: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' },
  payBtn: {
    backgroundColor: '#10b981', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3
  },
  payBtnLoading: { backgroundColor: '#9ca3af' },
  payBtnText: { color: '#ffffff', fontSize: rf(14.5), fontWeight: '700' },
  secureRow: { alignItems: 'center', marginTop: 12, marginBottom: 40 },
  secureText: { fontSize: rf(11), color: '#9ca3af' },
});