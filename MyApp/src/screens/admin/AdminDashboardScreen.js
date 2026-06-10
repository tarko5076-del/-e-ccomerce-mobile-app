import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { rf } from '../../utils/responsive';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../utils/api';

const STATUS_COLORS = {
  pending:   { color: '#f59e0b', bg: '#fef3c7' },
  shipped:   { color: '#3b82f6', bg: '#eff6ff' },
  delivered: { color: '#10b981', bg: '#d1fae5' },
  cancelled: { color: '#ef4444', bg: '#fef2f2' },
};

export default function AdminDashboardScreen({ navigation }) {
  const { productsList, ordersList } = useCart();
  const { adminToken, adminLogout } = useAuth();
  const { colors, theme } = useTheme();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/users`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.warn('Failed to fetch users:', err);
      }
    };
    if (adminToken) {
      fetchUsers();
    }
  }, [adminToken, ordersList.length]);

  const logout = () => {
    Alert.alert('Logout', 'Exit admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          adminLogout();
          navigation.replace('MainTabs');
        },
      },
    ]);
  };

  // Metrics
  const totalOrders = ordersList.length;
  const totalProducts = productsList.length;
  const activeUsers = users.length; 

  const totalRevenueETB = ordersList
    .filter(o => o.status === 'delivered' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.total, 0);

  // Low Stock Detection
  const lowStockProducts = productsList.filter(p => p.stock >= 0 && p.stock < 4);

  // Group orders by month to display inside our bar chart
  const monthlySales = {};
  ordersList.forEach(o => {
    if (o.status === 'delivered' || o.status === 'shipped') {
      const month = o.date ? o.date.split('-')[1] : null;
      if (month) {
        const label = {
          '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
          '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
        }[month] || 'Other';
        monthlySales[label] = (monthlySales[label] || 0) + o.total;
      }
    }
  });

  const MONTHS = ['Mar', 'Apr', 'May', 'Jun'];
  const chartData = MONTHS.map(m => {
    let val = monthlySales[m] || 0;
    // Add default mock stats if orders list is empty to show a beautiful chart
    if (ordersList.length === 0) {
      if (m === 'Mar') val = 12500;
      if (m === 'Apr') val = 28000;
      if (m === 'May') val = 19500;
      if (m === 'Jun') val = 9000;
    }
    return { label: m, value: val };
  });

  const maxVal = Math.max(...chartData.map(d => d.value), 5000);

  const CARDS = [
    {
      icon: '📦',
      label: 'Products',
      sub: `${totalProducts} registered`,
      screen: 'AdminProducts',
      color: theme === 'dark' ? '#1e293b' : '#eff6ff',
      border: '#2563eb',
      iconBg: '#dbeafe',
    },
    {
      icon: '🛒',
      label: 'Orders',
      sub: `${ordersList.filter(o => o.status === 'pending').length} pending`,
      screen: 'AdminOrders',
      color: theme === 'dark' ? '#1e293b' : '#f0fdf4',
      border: '#10b981',
      iconBg: '#d1fae5',
    },
    {
      icon: '👥',
      label: 'Customers',
      sub: `${activeUsers} registered`,
      screen: null,
      color: theme === 'dark' ? '#1e293b' : '#fef3c7',
      border: '#f59e0b',
      iconBg: '#fde68a',
    },
    {
      icon: '🔔',
      label: 'Low Stock',
      sub: `${lowStockProducts.length} items warning`,
      screen: 'AdminProducts',
      color: theme === 'dark' ? '#1e293b' : '#fef2f2',
      border: '#ef4444',
      iconBg: '#fecaca',
    },
  ];

  const recentOrders = ordersList.slice(0, 3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>Welcome back, Admin 👋</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { value: `ETB ${totalRevenueETB >= 1000 ? (totalRevenueETB / 1000).toFixed(1) + 'k' : totalRevenueETB}`, label: 'Revenue',  color: '#2563eb' },
            { value: `${totalOrders}`,      label: 'Orders',   color: '#10b981' },
            { value: `${totalProducts}`,    label: 'Products', color: '#f59e0b' },
            { value: `${activeUsers}`,      label: 'Users',    color: '#a855f7' },
          ].map(stat => (
            <View key={stat.label} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <View style={[styles.alertBanner, { borderColor: colors.danger, backgroundColor: colors.danger + '10' }]}>
            <Text style={[styles.alertTitle, { color: colors.danger }]}>⚠️ Low Stock Warning</Text>
            <Text style={[styles.alertText, { color: colors.text }]}>
              {lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(', ')}
            </Text>
          </View>
        )}

        {/* Revenue custom bar chart */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Revenue Performance (ETB)</Text>
        <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartYAxis}>
            <Text style={[styles.chartYText, { color: colors.subtext }]}>{Math.round(maxVal).toLocaleString()}</Text>
            <Text style={[styles.chartYText, { color: colors.subtext }]}>{Math.round(maxVal / 2).toLocaleString()}</Text>
            <Text style={[styles.chartYText, { color: colors.subtext }]}>0</Text>
          </View>

          <View style={styles.chartBarArea}>
            {chartData.map((item, index) => {
              const heightPct = (item.value / maxVal) * 100;
              return (
                <View key={item.label} style={styles.chartCol}>
                  <View style={styles.chartValContainer}>
                    <Text style={[styles.chartValText, { color: colors.text }]}>
                      {item.value >= 1000 ? (item.value / 1000).toFixed(0) + 'k' : item.value}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          height: `${heightPct}%`, 
                          backgroundColor: colors.primary,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.chartLabel, { color: colors.text }]}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Management cards */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Sections</Text>
        <View style={styles.cardGrid}>
          {CARDS.map(card => (
            <TouchableOpacity
              key={card.label}
              style={[styles.card, {
                backgroundColor: colors.card,
                borderColor: colors.border,
              }]}
              onPress={() =>
                card.screen
                  ? navigation.navigate(card.screen)
                  : Alert.alert('Information', `${card.label} section loaded automatically.`)
              }
              activeOpacity={0.8}
            >
              <View style={[styles.cardIconCircle, { backgroundColor: card.iconBg }]}>
                <Text style={styles.cardIcon}>{card.icon}</Text>
              </View>
              <Text style={[styles.cardLabel, { color: colors.text }]}>{card.label}</Text>
              <Text style={[styles.cardSub, { color: colors.subtext }]}>{card.sub}</Text>
              <Text style={[styles.cardArrow, { color: card.border }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent orders */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Orders</Text>
        <View style={[styles.ordersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {recentOrders.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.subtext, fontSize: rf(12.5) }}>No recent orders placed.</Text>
            </View>
          ) : (
            recentOrders.map((order, i) => {
              const s = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              return (
                <View
                  key={order.id}
                  style={[
                    styles.orderRow,
                    i < recentOrders.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={styles.orderInfo}>
                    <Text style={[styles.orderId, { color: colors.text }]}>{order.id}</Text>
                    <Text style={[styles.orderCustomer, { color: colors.subtext }]}>{order.customer}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={[styles.orderAmount, { color: colors.text }]}>ETB {order.total.toLocaleString()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: s.color + '1a' }]}>
                      <Text style={[styles.statusText, { color: s.color }]}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {ordersList.length > 0 && (
            <TouchableOpacity
              style={[styles.viewAllBtn, { borderTopColor: colors.border }]}
              onPress={() => navigation.navigate('AdminOrders')}
            >
              <Text style={styles.viewAllText}>View all orders ({totalOrders}) →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('AdminAddProduct')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickBtnIcon}>➕</Text>
            <Text style={[styles.quickBtnText, { color: colors.text }]}>Add Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.cardBgActive, borderColor: colors.cardBgActive }]}
            onPress={() => navigation.navigate('AdminOrders')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickBtnIcon}>🚚</Text>
            <Text style={[styles.quickBtnText, { color: colors.brandPillTextActive }]}>
              Orders Queue
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: { fontSize: rf(22), fontWeight: '800' },
  subtitle: { fontSize: rf(12.5), marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: rf(12.5) },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: { fontSize: rf(13.5), fontWeight: '800' },
  statLabel: { fontSize: rf(9.5), marginTop: 2 },
  
  // Alert Banner
  alertBanner: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: rf(12.5),
    fontWeight: '800',
    marginBottom: 4,
  },
  alertText: {
    fontSize: rf(11.5),
    lineHeight: 16,
  },

  // Chart Styling
  chartContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    height: rf(170),
    alignItems: 'center',
  },
  chartYAxis: {
    height: '80%',
    justifyContent: 'space-between',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    alignItems: 'flex-end',
    width: rf(45),
  },
  chartYText: {
    fontSize: rf(9),
    fontWeight: '600',
  },
  chartBarArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingLeft: 8,
  },
  chartCol: {
    alignItems: 'center',
    width: '20%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartValContainer: {
    marginBottom: 4,
  },
  chartValText: {
    fontSize: rf(8.5),
    fontWeight: '800',
  },
  barTrack: {
    height: '60%',
    width: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  chartLabel: {
    fontSize: rf(10),
    fontWeight: '700',
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: rf(13.5),
    fontWeight: '800',
    marginBottom: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  cardIconCircle: {
    width: rf(40),
    height: rf(40),
    borderRadius: rf(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: { fontSize: rf(20) },
  cardLabel: {
    fontSize: rf(13.5),
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSub: { fontSize: rf(11.5) },
  cardArrow: { fontSize: rf(16), marginTop: 8, fontWeight: '700' },
  ordersCard: {
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  orderInfo: { flex: 1 },
  orderId: {
    fontSize: rf(12),
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  orderCustomer: { fontSize: rf(11.5), marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderAmount: { fontSize: rf(12.5), fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: rf(9.5), fontWeight: '800' },
  viewAllBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  viewAllText: { color: '#2563eb', fontSize: rf(12.5), fontWeight: '700' },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  quickBtnIcon: { fontSize: rf(20), marginBottom: 6 },
  quickBtnText: {
    fontSize: rf(12),
    fontWeight: '700',
    textAlign: 'center',
  },
});