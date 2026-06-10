import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/productCard';
import { rf } from '../utils/responsive';

export default function WishlistScreen({ navigation }) {
  const { wishlist } = useCart();

  if (wishlist.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyTitle}>Your Wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>Tap the heart icon on any product to save it here.</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.shopBtnText}>Explore Products</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Wishlist ({wishlist.length})</Text>
      <FlatList
        data={wishlist}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <ProductCard product={item} navigation={navigation} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingBottom: 80 }, // Spacer for tab bar
  title: {
    fontSize: rf(20), fontWeight: '800',
    color: '#111827', padding: 20, paddingBottom: 8,
  },
  grid: { paddingHorizontal: 10, paddingBottom: 24 },
  emptyContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 40,
    backgroundColor: '#f9fafb',
  },
  emptyIcon: { fontSize: rf(50), marginBottom: 16 },
  emptyTitle: { fontSize: rf(18), fontWeight: '700', color: '#111827' },
  emptySubtitle: {
    fontSize: rf(13), color: '#6b7280',
    marginTop: 8, marginBottom: 24, textAlign: 'center', lineHeight: 20
  },
  shopBtn: {
    backgroundColor: '#2563eb', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  shopBtnText: { color: '#ffffff', fontWeight: '700', fontSize: rf(14) },
});