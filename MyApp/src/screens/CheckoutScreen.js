import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';

export default function CheckoutScreen({ navigation }) {
  const { cart, cartTotal, clearCart } = useCart();
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', zip: '',
  });

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const placeOrder = () => {
    const required = ['name', 'email', 'address', 'city'];
    if (required.some(k => !form[k].trim())) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    // TODO: POST to your Node.js /api/orders endpoint
    clearCart();
    Alert.alert('Order placed! 🎉', 'Your order has been confirmed.', [
      { text: 'Back to Home', onPress: () => navigation.navigate('Home') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.section}>Shipping details</Text>

        {[['name', 'Full name *'], ['email', 'Email *'], ['phone', 'Phone'],
          ['address', 'Address *'], ['city', 'City *'], ['zip', 'ZIP / Postal code']].map(([key, label]) => (
          <View key={key} style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[key]}
              onChangeText={val => update(key, val)}
              placeholderTextColor="#aaa"
              placeholder={label.replace(' *', '')}
            />
          </View>
        ))}

        <Text style={[styles.section, { marginTop: 24 }]}>Order summary</Text>
        {cart.map(item => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.summaryName}>{item.name} × {item.quantity}</Text>
            <Text style={styles.summaryPrice}>ETB {(item.price * item.quantity).toLocaleString()}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>ETB {cartTotal.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.placeBtn} onPress={placeOrder}>
          <Text style={styles.placeBtnText}>Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, color: '#555', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1a1a1a', borderWidth: 1, borderColor: '#e5e7eb' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  summaryName: { fontSize: 13, color: '#555', flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 24 },
  totalLabel: { fontSize: 16, color: '#888' },
  totalAmount: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  placeBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 40 },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});