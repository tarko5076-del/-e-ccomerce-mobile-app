import React from 'react';
import {
  View, Text, FlatList, Image,
  TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { rf } from '../utils/responsive';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart();
  const { isLoggedIn } = useAuth();

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Cart</Text>

      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }} // Spacer for tab bar
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemPrice}>ETB {item.price.toLocaleString()}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.id, item.quantity - 1)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.id, item.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeFromCart(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.removeBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>ETB {cartTotal.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            if (!isLoggedIn) {
              navigation.navigate('Auth', { redirectTo: 'Address' });
            } else {
              navigation.navigate('Address');
            }
          }}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: {
    fontSize: rf(20), fontWeight: '800',
    color: '#111827', padding: 20, paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 40,
    backgroundColor: '#f9fafb',
  },
  emptyIcon: { fontSize: rf(50), marginBottom: 16 },
  emptyTitle: { fontSize: rf(18), fontWeight: '700', color: '#111827' },
  emptySubtitle: {
    fontSize: rf(13), color: '#6b7280',
    marginTop: 8, marginBottom: 24,
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
  item: {
    flexDirection: 'row', backgroundColor: '#ffffff',
    borderRadius: 14, marginBottom: 12, padding: 12,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  itemImage: {
    width: rf(74), height: rf(74),
    borderRadius: 10, backgroundColor: '#f3f4f6',
    resizeMode: 'contain',
  },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { fontSize: rf(12.5), fontWeight: '600', color: '#1f2937' },
  itemPrice: {
    fontSize: rf(14), fontWeight: '800',
    color: '#2563eb', marginTop: 4,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: {
    backgroundColor: '#f3f4f6', borderRadius: 6,
    width: rf(26), height: rf(26),
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { fontSize: rf(14), color: '#111827', fontWeight: '600' },
  qtyText: { fontSize: rf(14), fontWeight: '700', marginHorizontal: 12, color: '#111827' },
  removeBtn: { marginLeft: 'auto' },
  removeBtnText: { fontSize: rf(16), color: '#ef4444' },
  footer: {
    position: 'absolute',
    bottom: 80, // Positioned above the floating tab bar
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10,
  },
  totalLabel: { fontSize: rf(14), color: '#6b7280', fontWeight: '500' },
  totalAmount: { fontSize: rf(18), fontWeight: '800', color: '#111827' },
  checkoutBtn: {
    backgroundColor: '#2563eb', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  checkoutBtnText: { color: '#ffffff', fontSize: rf(14.5), fontWeight: '700' },
});