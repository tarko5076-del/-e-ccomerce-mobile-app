import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Image, TextInput,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { rf } from '../../utils/responsive';

export default function AdminProductsScreen({ navigation }) {
  const { productsList, deleteProduct } = useCart();
  const [search, setSearch] = useState('');

  const filtered = productsList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProduct(id);
          Alert.alert('Deleted', 'Product has been deleted successfully.');
        },
      },
    ]);
  };

  const addProduct = () => {
    navigation.navigate('AdminAddProduct');
  };

  const editProduct = (item) => {
    navigation.navigate('AdminAddProduct', {
      product: item,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Dashboard</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addBtn} onPress={addProduct} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>Manage Products</Text>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.thumb} />

            <View style={styles.rowInfo}>
              <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.rowMeta}>{item.category} · ${item.price}</Text>
              <Text style={styles.rowRating}>⭐ {item.rating}</Text>
            </View>

            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => editProduct(item)} activeOpacity={0.7}>
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
                <Text style={styles.actionIcon}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  backBtnText: {
    fontSize: rf(11.5),
    fontWeight: '700',
    color: '#374151',
  },
  title: { fontSize: rf(20), fontWeight: '800', color: '#111827', paddingHorizontal: 20, marginVertical: 10 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  addBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: { color: '#ffffff', fontWeight: '700', fontSize: rf(12.5) },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: rf(13), marginRight: 8 },
  searchInput: { flex: 1, fontSize: rf(13.5), color: '#1f2937' },
  row: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#f3f4f6', resizeMode: 'contain' },
  rowInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  rowName: { fontSize: rf(13.5), fontWeight: '700', color: '#1f2937' },
  rowMeta: { fontSize: rf(12), color: '#4b5563', marginTop: 2, fontWeight: '500' },
  rowRating: { fontSize: rf(11.5), color: '#6b7280', marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#eff6ff', borderRadius: 8, width: 34, height: 34, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' },
  deleteBtn: { backgroundColor: '#fef2f2', borderRadius: 8, width: 34, height: 34, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' },
  actionIcon: { fontSize: rf(13.5) },
  empty: { textAlign: 'center', marginTop: 60, color: '#9ca3af', fontSize: rf(14) },
});
