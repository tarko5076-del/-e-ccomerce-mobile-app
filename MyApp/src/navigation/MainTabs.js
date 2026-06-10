import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { rf } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { cartCount } = useCart();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // Clean floating pill look
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.card,
            shadowColor: colors.shadowColor,
          }
        ],
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home:     focused ? 'home'        : 'home-outline',
            Cart:     focused ? 'bag'         : 'bag-outline',
            Wishlist: focused ? 'heart'       : 'heart-outline',
            Profile:  focused ? 'person'      : 'person-outline',
          };
          return (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={icons[route.name]}
                size={rf(24)}
                color={color}
              />
              {/* Cart badge */}
              {route.name === 'Cart' && cartCount > 0 && (
                <View style={[styles.badge, { borderColor: colors.card }]}>
                  <Text style={styles.badgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              )}
              {/* Active dot under icon */}
              {focused && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Cart"     component={CartScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    borderRadius: 24,
    height: 68,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderTopWidth: 0, // No top border
    borderTopColor: 'transparent',
    paddingBottom: 0,
    paddingTop: 0,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 50,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: rf(8.5),
    fontWeight: '800',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
    marginTop: 4,
    position: 'absolute',
    bottom: 2,
  },
});