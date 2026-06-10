import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated, Alert,
} from 'react-native';
import { rf } from '../../utils/responsive';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const { adminLogin } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter username and password.');
      return;
    }
    setLoading(true);
    const result = await adminLogin(username.trim(), password.trim());
    setLoading(false);
    if (result.success) {
      navigation.replace('AdminDashboard');
    } else {
      shake();
      Alert.alert('Access Denied', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>

        {/* Lock icon */}
        <View style={styles.lockCircle}>
          <Text style={styles.lockIcon}>🔐</Text>
        </View>

        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.subtitle}>Authorized personnel only</Text>

        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter admin username"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🔑</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter admin password"
              placeholderTextColor="#64748b"
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnLoading]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>
            {loading ? 'Verifying...' : 'Access Admin Panel'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to app</Text>
        </TouchableOpacity>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Deep slate dark background
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1e293b', // Dark card
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
  },
  lockCircle: {
    width: rf(64), height: rf(64),
    borderRadius: rf(32),
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockIcon: { fontSize: rf(26) },
  title: {
    fontSize: rf(22), fontWeight: '800',
    color: '#ffffff', marginBottom: 4,
  },
  subtitle: {
    fontSize: rf(12.5), color: '#f87171', // soft red
    fontWeight: '600', marginBottom: 24,
  },
  inputGroup: { width: '100%', marginBottom: 16 },
  label: {
    fontSize: rf(11.5), fontWeight: '700',
    color: '#94a3b8', marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f172a', borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#334155',
  },
  inputIcon: { fontSize: rf(14), marginRight: 8 },
  input: {
    flex: 1, paddingVertical: 12,
    fontSize: rf(13.5), color: '#f8fafc',
  },
  eyeIcon: { fontSize: rf(14), padding: 4 },
  loginBtn: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  loginBtnLoading: { backgroundColor: '#475569' },
  loginBtnText: {
    color: '#ffffff', fontSize: rf(14), fontWeight: '700',
  },
  backBtn: { paddingVertical: 6 },
  backText: { fontSize: rf(12.5), color: '#64748b', fontWeight: '500' },
});