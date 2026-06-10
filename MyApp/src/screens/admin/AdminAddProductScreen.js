import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { rf } from '../../utils/responsive';

const CATEGORIES = ['Phones', 'Laptops', 'Audio', 'Cameras'];

export default function AdminAddProductScreen({ route, navigation }) {
  const { addProduct, updateProduct } = useCart();
  const existing = route.params?.product;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name || '',
    category: existing?.category || 'Phones',
    price: existing?.price?.toString() || '',
    rating: existing?.rating?.toString() || '',
    image: existing?.image || '',
    description: existing?.description || '',
  });

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = () => {
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert('Required', 'Name and price are required.');
      return;
    }

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum)) {
      Alert.alert('Invalid price', 'Please enter a valid numeric price.');
      return;
    }

    const ratingNum = parseFloat(form.rating) || 4.5;

    const product = {
      ...(isEdit ? existing : {}),
      id: existing?.id || 'PROD-' + Date.now().toString(),
      name: form.name.trim(),
      category: form.category,
      price: priceNum,
      rating: Math.min(5, Math.max(1, ratingNum)),
      image: form.image.trim() || 'https://via.placeholder.com/150',
      description: form.description.trim(),
    };

    if (isEdit) {
      updateProduct(existing.id, product);
    } else {
      addProduct(product);
    }

    Alert.alert('Saved!', `${product.name} has been ${isEdit ? 'updated' : 'added'}.`, [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{isEdit ? 'Edit Product' : 'Add Product'}</Text>

        <Text style={styles.label}>Category</Text>
        <View style={styles.categories}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, form.category === cat && styles.catBtnActive]}
              onPress={() => update('category', cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.catBtnText, form.category === cat && styles.catBtnTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {[
          ['name', 'Product Name *', 'e.g. Sony A7 V', false],
          ['price', 'Price ($) *', 'e.g. 1999', true],
          ['rating', 'Rating (1-5)', 'e.g. 4.8', true],
          ['image', 'Image URL', 'e.g. https://images.unsplash.com/...', false],
          ['description', 'Description', 'Enter detailed product specifications...', false],
        ].map(([key, label, placeholder, numeric]) => (
          <View key={key} style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, key === 'description' && styles.textarea]}
              value={form[key]}
              onChangeText={val => update(key, val)}
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              keyboardType={numeric ? 'decimal-pad' : 'default'}
              multiline={key === 'description'}
              numberOfLines={key === 'description' ? 4 : 1}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{isEdit ? 'Update Product' : 'Add Product'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  header: { marginBottom: 14 },
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
  title: { fontSize: rf(20), fontWeight: '800', color: '#111827', marginBottom: 20 },
  label: { fontSize: rf(11.5), fontWeight: '700', color: '#374151', marginBottom: 6 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  catBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  catBtnText: { fontSize: rf(12.5), color: '#4b5563', fontWeight: '700' },
  catBtnTextActive: { color: '#ffffff' },
  inputGroup: { marginBottom: 16 },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: rf(13.5),
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: { color: '#ffffff', fontSize: rf(14.5), fontWeight: '700' },
  cancelBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: { color: '#6b7280', fontSize: rf(13.5), fontWeight: '600' },
});
