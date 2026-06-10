import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { rf } from '../utils/responsive';

export default function AuthScreen({ navigation, route }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipping, setFlipping] = useState(false);
  const redirectTo = route?.params?.redirectTo || 'MainTabs';

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [showPass, setShowPass] = useState(false);

  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    
    const toValue = isLogin ? 1 : 0;
    
    Animated.timing(flipAnim, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(!isLogin);
      setFlipping(false);
    });
  };

  // 3D rotations
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  // Opacities to prevent snap issues halfway through the flip
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const handleLogin = async () => {
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    
    const res = await login(loginForm.email.trim(), loginForm.password.trim());
    if (res.success) {
      Alert.alert('Welcome Back!', 'Logged in successfully.', [
        {
          text: 'Continue',
          onPress: () => {
            navigation.replace(redirectTo);
          }
        }
      ]);
    } else {
      Alert.alert('Login Failed', res.error);
    }
  };

  const handleRegister = async () => {
    if (!regForm.name.trim() || !regForm.email.trim() || !regForm.phone.trim() || !regForm.password.trim()) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    if (regForm.password !== regForm.confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    
    const res = await register(regForm.name.trim(), regForm.email.trim(), regForm.phone.trim(), regForm.password.trim());
    if (res.success) {
      Alert.alert('Welcome!', `Account created for ${regForm.name}.`, [
        {
          text: 'Continue',
          onPress: () => {
            navigation.replace(redirectTo);
          },
        },
      ]);
    } else {
      Alert.alert('Registration Failed', res.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🛍️</Text>
            </View>
            <Text style={styles.appName}>ElectroHub</Text>
            <Text style={styles.tagline}>Your premium electronics store</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Front Card (Login) */}
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
                  opacity: frontOpacity,
                  zIndex: isLogin ? 2 : 1,
                },
              ]}
              pointerEvents={isLogin ? 'auto' : 'none'}
            >
              <Text style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardSub}>Sign in to your account</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#4a6080"
                  value={loginForm.email}
                  onChangeText={v => setLoginForm(f => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>🔑</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#4a6080"
                  value={loginForm.password}
                  onChangeText={v => setLoginForm(f => ({ ...f, password: v }))}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
                <Text style={styles.primaryBtnText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchBtn} onPress={flip}>
                <Text style={styles.switchText}>
                  Don't have an account?{' '}
                  <Text style={styles.switchHighlight}>Register</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Back Card (Register) */}
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                {
                  transform: [{ perspective: 1000 }, { rotateY: backRotate }],
                  opacity: backOpacity,
                  zIndex: !isLogin ? 2 : 1,
                },
              ]}
              pointerEvents={!isLogin ? 'auto' : 'none'}
            >
              <Text style={styles.cardTitle}>Create account</Text>
              <Text style={styles.cardSub}>Join us today</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#4a6080"
                  value={regForm.name}
                  onChangeText={v => setRegForm(f => ({ ...f, name: v }))}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#4a6080"
                  value={regForm.email}
                  onChangeText={v => setRegForm(f => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>📞</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor="#4a6080"
                  value={regForm.phone}
                  onChangeText={v => setRegForm(f => ({ ...f, phone: v }))}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>🔑</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#4a6080"
                  value={regForm.password}
                  onChangeText={v => setRegForm(f => ({ ...f, password: v }))}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#4a6080"
                  value={regForm.confirm}
                  onChangeText={v => setRegForm(f => ({ ...f, confirm: v }))}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
                <Text style={styles.primaryBtnText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchBtn} onPress={flip}>
                <Text style={styles.switchText}>
                  Already have an account?{' '}
                  <Text style={styles.switchHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: rf(70),
    height: rf(70),
    borderRadius: rf(35),
    backgroundColor: '#1a2744',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  logoText: { fontSize: rf(30) },
  appName: {
    fontSize: rf(24),
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: rf(12),
    color: '#4a6080',
    marginTop: 4,
  },
  cardContainer: {
    position: 'relative',
    minHeight: 460,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#0f1c35',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e3a6e',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cardTitle: {
    fontSize: rf(20),
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: rf(12),
    color: '#4a6080',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2744',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e3a6e',
  },
  inputIcon: {
    fontSize: rf(14),
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: rf(13.5),
    color: '#c8d8f0',
  },
  eyeIcon: {
    fontSize: rf(14),
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -4,
  },
  forgotText: {
    color: '#3b82f6',
    fontSize: rf(11.5),
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: rf(14.5),
    fontWeight: '700',
  },
  switchBtn: { alignItems: 'center', paddingVertical: 4 },
  switchText: {
    color: '#4a6080',
    fontSize: rf(12.5),
  },
  switchHighlight: {
    color: '#3b82f6',
    fontWeight: '700',
  },
});