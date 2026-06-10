import { Platform } from 'react-native';

// Default host for local backend API.
// 10.0.2.2 is the Android emulator loopback IP address representing the host machine.
// localhost/127.0.0.1 works directly for iOS simulators and web browsers.
// If testing on a physical mobile device, replace this with your machine's local network IP.
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
