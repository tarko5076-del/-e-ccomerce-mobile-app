import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { rf } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MENU = [
  { icon: '📍', label: 'Saved Addresses' },
  { icon: '💳', label: 'Payment Methods' },
  { icon: '🔔', label: 'Notifications' },
  { icon: '❓', label: 'Help & Support' },
  { icon: '⚙️', label: 'Settings' },
];

const STATUS_STYLE = {
  pending: { label: 'Pending', color: '#f59e0b' },
  shipped: { label: 'Shipped', color: '#3b82f6' },
  delivered: { label: 'Delivered', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
};

export default function ProfileScreen({ navigation }) {
  const { user, logout, isLoggedIn } = useAuth();
  const { colors, isDark } = useTheme();

  const userOrders = user?.orders || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Profile Avatar & Header */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.cardBgLight, borderColor: colors.primary }]}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          {isLoggedIn ? (
            <>
              <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
              <Text style={[styles.email, { color: colors.subtext }]}>{user?.email}</Text>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => { logout(); navigation.replace('MainTabs'); }}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.name, { color: colors.text }]}>Guest User</Text>
              <Text style={[styles.email, { color: colors.subtext }]}>Sign in for a better experience</Text>
              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                onPress={() => navigation.navigate('Auth')}
                activeOpacity={0.8}
              >
                <Text style={styles.loginBtnText}>Sign In / Register</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Dynamic User Order History */}
        {isLoggedIn && (
          <View style={styles.ordersSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Orders ({userOrders.length})</Text>
            {userOrders.length === 0 ? (
              <View style={[styles.emptyOrders, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.emptyOrdersText, { color: colors.subtext }]}>You haven't placed any orders yet.</Text>
              </View>
            ) : (
              userOrders.map((order) => {
                const styleObj = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
                return (
                  <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.orderHeader}>
                      <Text style={[styles.orderId, { color: colors.text }]}>{order.id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: styleObj.color + '1a' }]}>
                        <Text style={[styles.statusText, { color: styleObj.color }]}>{styleObj.label}</Text>
                      </View>
                    </View>
                    <Text style={[styles.orderDate, { color: colors.subtext }]}>{order.date}</Text>
                    <Text style={[styles.orderItems, { color: colors.subtext }]} numberOfLines={1}>
                      Items: {order.items.join(', ')}
                    </Text>
                    <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
                      <Text style={[styles.orderTotalLabel, { color: colors.subtext }]}>Total Amount:</Text>
                      <Text style={[styles.orderTotal, { color: colors.text }]}>ETB {(order.total * 55).toLocaleString()}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Settings Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MENU.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem, 
                i < MENU.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.menuArrow, { color: colors.subtext }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Access Admin Panel */}
        <TouchableOpacity
          style={[styles.adminBtn, { backgroundColor: colors.cardBgActive }]}
          onPress={() => navigation.navigate('AdminLogin')}
          activeOpacity={0.8}
        >
          <Text style={[styles.adminBtnText, { color: colors.brandPillTextActive }]}>🔐 Admin Panel</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: rf(72), height: rf(72), borderRadius: rf(36),
    justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
    borderWidth: 1.5,
  },
  avatarText: { fontSize: rf(32) },
  name: { fontSize: rf(18), fontWeight: '800' },
  email: { fontSize: rf(12), marginTop: 4, marginBottom: 14 },
  loginBtn: {
    borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  loginBtnText: { color: '#ffffff', fontWeight: '700', fontSize: rf(13) },
  logoutBtn: {
    backgroundColor: '#fef2f2', borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 10,
    borderWidth: 1, borderColor: '#fecaca',
  },
  logoutBtnText: { color: '#ef4444', fontWeight: '700', fontSize: rf(13) },
  ordersSection: { marginBottom: 24 },
  sectionTitle: { fontSize: rf(14), fontWeight: '800', marginBottom: 10 },
  emptyOrders: {
    borderRadius: 16, padding: 16,
    alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5,
  },
  emptyOrdersText: { fontSize: rf(12) },
  orderCard: {
    borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: rf(12.5), fontWeight: '700', fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: rf(9.5), fontWeight: '800' },
  orderDate: { fontSize: rf(11), marginTop: 2, marginBottom: 6 },
  orderItems: { fontSize: rf(12), marginBottom: 8 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 8 },
  orderTotalLabel: { fontSize: rf(11.5) },
  orderTotal: { fontSize: rf(13), fontWeight: '800' },
  menuCard: {
    borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6, elevation: 2, marginBottom: 20, borderWidth: 1.5,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
  },
  menuIcon: { fontSize: rf(18), marginRight: 14 },
  menuLabel: { flex: 1, fontSize: rf(13.5), fontWeight: '500' },
  menuArrow: { fontSize: rf(18) },
  adminBtn: {
    borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
    marginBottom: 40,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3
  },
  adminBtnText: { fontWeight: '700', fontSize: rf(13.5) },
});