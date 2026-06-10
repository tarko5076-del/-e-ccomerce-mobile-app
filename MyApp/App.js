import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

import MainTabs from './src/navigation/MainTabs';          // ✅ uncommented
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import AuthScreen from './src/screens/AuthScreen';
import AddressScreen from './src/screens/AddressScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import OrderConfirmScreen from './src/screens/OrderConfirmScreen';

import AdminLoginScreen from './src/screens/admin/AdminLoginScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import AdminProductsScreen from './src/screens/admin/AdminProductsScreen';
import AdminAddProductScreen from './src/screens/admin/AdminAddProductScreen';
import AdminOrdersScreen from './src/screens/admin/AdminOrdersScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>

            {/* ✅ MainTabs is FIRST — this is the home/entry screen */}
            <Stack.Screen name="MainTabs"        component={MainTabs} />

            {/* Screens that open on top of tabs */}
            <Stack.Screen name="ProductDetail"   component={ProductDetailScreen} />
            <Stack.Screen name="Cart"            component={CartScreen} />
            <Stack.Screen name="Checkout"        component={CheckoutScreen} />
            <Stack.Screen name="Auth"            component={AuthScreen} />
            <Stack.Screen name="Address"         component={AddressScreen} />
            <Stack.Screen name="Payment"         component={PaymentScreen} />
            <Stack.Screen name="OrderConfirm"    component={OrderConfirmScreen} />

            {/* Admin — protected */}
            <Stack.Screen name="AdminLogin"      component={AdminLoginScreen} />
            <Stack.Screen name="AdminDashboard"  component={AdminDashboardScreen} />
            <Stack.Screen name="AdminProducts"   component={AdminProductsScreen} />
            <Stack.Screen name="AdminAddProduct" component={AdminAddProductScreen} />
            <Stack.Screen name="AdminOrders"     component={AdminOrdersScreen} />

          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}