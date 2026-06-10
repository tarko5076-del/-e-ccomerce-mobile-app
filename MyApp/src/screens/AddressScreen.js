import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { rf } from '../utils/responsive';
import { useCart } from '../context/CartContext';

const CITIES = ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Mekelle', 'Adama', 'Hawassa'];

export default function AddressScreen({ navigation }) {
  const { cartTotal } = useCart();
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    street: '', city: 'Addis Ababa', subcity: '',
    woreda: '', landmark: '',
  });
  const [cityOpen, setCityOpen] = useState(false);
  
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const proceed = () => {
    const required = ['fullName', 'phone', 'street', 'city', 'subcity'];
    if (required.some(k => !form[k].trim())) {
      Alert.alert('Missing info', 'Please fill in all required fields (*).');
      return;
    }
    // Navigate to Payment screen (passing address details; cartTotal will be read from context in PaymentScreen)
    navigation.navigate('Payment', { address: form });
  };

  const Field = ({ label, field, placeholder, keyboardType, required }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        style={styles.input}
        value={form[field]}
        onChangeText={v => update(field, v)}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Progress bar (Cart -> Address -> Payment -> Done) */}
        <View style={styles.progressRow}>
          {['Cart', 'Address', 'Payment', 'Done'].map((step, i) => (
            <React.Fragment key={step}>
              <View style={[
                styles.progressStep,
                i === 1 && styles.progressStepActive,
                i < 1 && styles.progressStepDone
              ]}>
                <Text style={[
                  styles.progressText,
                  (i <= 1) && styles.progressTextActive
                ]}>{step}</Text>
              </View>
              {i < 3 && <View style={[styles.progressLine, i < 1 && styles.progressLineDone]} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.title}>Delivery Address</Text>
        <Text style={styles.subtitle}>Where should we deliver your order?</Text>

        <Field label="Full Name" field="fullName" placeholder="e.g. Aisha Mohammed" required />
        <Field label="Phone Number" field="phone" placeholder="e.g. +251 912 345 678" keyboardType="phone-pad" required />
        <Field label="Email" field="email" placeholder="e.g. customer@example.com" keyboardType="email-address" />

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>📍 Location Details</Text>

        {/* City dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>City *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCityOpen(o => !o)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>{form.city}</Text>
            <Text style={styles.dropdownArrow}>{cityOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {cityOpen && (
            <View style={styles.dropdownMenu}>
              {CITIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={styles.dropdownItem}
                  onPress={() => { update('city', c); setCityOpen(false); }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    form.city === c && styles.dropdownItemActive
                  ]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Field label="Subcity" field="subcity" placeholder="e.g. Bole" required />
        <Field label="Woreda" field="woreda" placeholder="e.g. 03" />
        <Field label="Street / House Number" field="street" placeholder="e.g. Bole Road, House 123" required />
        <Field label="Landmark (optional)" field="landmark" placeholder="e.g. Behind Dembel City Center" />

        <TouchableOpacity style={styles.continueBtn} onPress={proceed} activeOpacity={0.8}>
          <Text style={styles.continueBtnText}>Continue to Payment →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, justifyContent: 'space-between' },
  progressStep: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#e5e7eb', minWidth: 60, alignItems: 'center'
  },
  progressStepActive: { backgroundColor: '#2563eb' },
  progressStepDone: { backgroundColor: '#10b981' },
  progressText: { fontSize: rf(10.5), color: '#6b7280', fontWeight: '700' },
  progressTextActive: { color: '#ffffff' },
  progressLine: { flex: 1, height: 3, backgroundColor: '#e5e7eb', marginHorizontal: 4 },
  progressLineDone: { backgroundColor: '#10b981' },
  title: { fontSize: rf(20), fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: rf(12.5), color: '#6b7280', marginBottom: 20 },
  sectionLabel: { fontSize: rf(14), fontWeight: '800', color: '#111827', marginBottom: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: rf(11.5), fontWeight: '700', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: rf(13.5), color: '#111827',
    borderWidth: 1, borderColor: '#d1d5db'
  },
  dropdown: {
    backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, borderWidth: 1, borderColor: '#d1d5db',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  dropdownText: { fontSize: rf(13.5), color: '#111827', fontWeight: '500' },
  dropdownArrow: { fontSize: rf(11), color: '#6b7280' },
  dropdownMenu: {
    backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1,
    borderColor: '#d1d5db', marginTop: 4, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4
  },
  dropdownItem: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
  },
  dropdownItemText: { fontSize: rf(13.5), color: '#374151' },
  dropdownItemActive: { color: '#2563eb', fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#2563eb', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 16, marginBottom: 40,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3
  },
  continueBtnText: { color: '#ffffff', fontSize: rf(14.5), fontWeight: '700' },
});
