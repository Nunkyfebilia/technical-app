import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {useAppTheme} from './theme/ThemeContext';
import {API_BASE, GOOGLE_WEB_CLIENT_ID} from './config/env';

export default function LoginScreen({navigation}) {
  const {isDark} = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  const palette = useMemo(
    () => ({
      inputBg: isDark ? '#1E293B' : '#F9FAFB',
      inputBorder: isDark ? '#334155' : '#E5E7EB',
      inputText: isDark ? '#E2E8F0' : '#374151',
      placeholder: isDark ? '#64748B' : '#9CA3AF',
      cardBg: isDark ? '#0F172AF2' : '#FFFFFFF2',
      cardBorder: isDark ? '#334155' : '#E5E7EB',
      title: isDark ? '#E2E8F0' : '#1F2937',
      subtitle: isDark ? '#94A3B8' : '#6B7280',
      dangerBg: isDark ? '#450A0A' : '#FEF2F2',
      dangerBorder: isDark ? '#7F1D1D' : '#FECACA',
      dangerText: isDark ? '#FECACA' : '#DC2626',
      icon: isDark ? '#94A3B8' : '#6B7280',
      googleBtnBg: isDark ? '#1E293B' : '#FFFFFF',
      googleBtnBorder: isDark ? '#334155' : '#D1D5DB',
      googleText: isDark ? '#E2E8F0' : '#374151',
      decoOrbA: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.3)',
      decoOrbB: isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(196, 181, 253, 0.45)',
      decoRing: isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(255, 255, 255, 0.45)',
      decoDots: isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(255, 255, 255, 0.48)',
    }),
    [isDark],
  );

  const validateInput = () => {
    if (!email || !password) {
      setError('Email and Password are required');
      return false;
    }
    if (!API_BASE) {
      setError('API base URL is missing in .env');
      return false;
    }
    setError('');
    return true;
  };

  const persistSession = async data => {
    await AsyncStorage.setItem('userToken', data.token);
    await AsyncStorage.setItem('userEmail', data.user?.email || email);
    if (data.user?.name) {
      await AsyncStorage.setItem('userName', data.user.name);
    }
  };

  const handleManualLogin = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/api/login/manual`, {
        email,
        password,
      });
      await persistSession(res.data);
      navigation.replace('Home', {userEmail: res.data.user?.email || email});
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!API_BASE || !GOOGLE_WEB_CLIENT_ID) {
      setError('API base URL or Google web client ID is missing in .env');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const {idToken} = await GoogleSignin.getTokens();

      if (!idToken) {
        throw new Error('Google ID token missing');
      }

      const res = await axios.post(`${API_BASE}/api/login/google`, {
        token: idToken,
      });

      await persistSession(res.data);
      navigation.replace('Home', {userEmail: res.data.user?.email || email});
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Google sign in was cancelled');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError('Google sign in is already in progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services are not available');
      } else {
        setError(err.response?.data?.error || err.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#111827', '#020617'] : ['#4F46E5', '#7C3AED']}
      style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerWrap}>
          <View
            pointerEvents="none"
            style={[styles.decoOrbLarge, {backgroundColor: palette.decoOrbA}]}
          />
          <View
            pointerEvents="none"
            style={[styles.decoOrbSmall, {backgroundColor: palette.decoOrbB}]}
          />
          <View
            pointerEvents="none"
            style={[styles.decoRing, {borderColor: palette.decoRing}]}
          />
          <View
            pointerEvents="none"
            style={[styles.decoDotOne, {backgroundColor: palette.decoDots}]}
          />
          <View
            pointerEvents="none"
            style={[styles.decoDotTwo, {backgroundColor: palette.decoDots}]}
          />
          <View
            style={[
              styles.card,
              {backgroundColor: palette.cardBg, borderColor: palette.cardBorder},
            ]}>
            <Text style={[styles.title, {color: palette.title}]}>Welcome Back</Text>
            <Text style={[styles.subtitle, {color: palette.subtitle}]}>
              Login to your account
            </Text>

            {!!error && (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: palette.dangerBg,
                    borderColor: palette.dangerBorder,
                  },
                ]}>
                <Text style={[styles.errorText, {color: palette.dangerText}]}>
                  {error}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.inputRow,
                {backgroundColor: palette.inputBg, borderColor: palette.inputBorder},
              ]}>
              <Icon name="person-outline" size={20} color={palette.icon} />
              <TextInput
                style={[styles.input, {color: palette.inputText}]}
                placeholder="Email"
                placeholderTextColor={palette.placeholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View
              style={[
                styles.inputRow,
                {backgroundColor: palette.inputBg, borderColor: palette.inputBorder},
              ]}>
              <Icon name="lock-closed-outline" size={20} color={palette.icon} />
              <TextInput
                style={[styles.input, {color: palette.inputText}]}
                placeholder="Password"
                placeholderTextColor={palette.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
              />
              <TouchableOpacity onPress={() => setSecure(v => !v)}>
                <Icon
                  name={secure ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={palette.icon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleManualLogin}
              disabled={loading}
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              disabled={loading}
              onPress={handleGoogleLogin}
              style={[
                styles.googleBtn,
                {
                  backgroundColor: palette.googleBtnBg,
                  borderColor: palette.googleBtnBorder,
                },
              ]}>
              <Image
                source={{
                  uri: 'https://developers.google.com/static/identity/images/g-logo.png',
                }}
                style={styles.googleLogo}
              />
              <Text style={[styles.googleBtnText, {color: palette.googleText}]}>
                Sign in with Google
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  decoOrbLarge: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    top: 40,
    right: -50,
  },
  decoOrbSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: 72,
    left: -42,
  },
  decoRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    top: 170,
    left: -58,
  },
  decoDotOne: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 118,
    left: 52,
  },
  decoDotTwo: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 118,
    right: 40,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    padding: 10,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#4F46E5',
    fontWeight: '500',
    fontSize: 12,
  },
  primaryBtn: {
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#818CF8',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    fontSize: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  googleBtnText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
