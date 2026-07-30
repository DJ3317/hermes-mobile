/**
 * 设置屏幕 — 网关连接和应用配置
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useConnectionStore } from '../stores/connectionStore';
import { useConfigStore } from '../stores/configStore';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { getColors, resolveColorScheme, spacing, typography, borderRadius } from '../theme/colors';
import * as api from '../services/api';
import { GatewayClient } from '../services/gateway';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);

  const connectionStatus = useConnectionStore((s) => s.status);
  const setStatus = useConnectionStore((s) => s.setStatus);
  const backendReachable = useConnectionStore((s) => s.backendReachable);
  const setBackendReachable = useConnectionStore((s) => s.setBackendReachable);
  const version = useConnectionStore((s) => s.version);
  const setVersion = useConnectionStore((s) => s.setVersion);
  const setError = useConnectionStore((s) => s.setError);

  const colorScheme = useConfigStore((s) => s.colorScheme);
  const setColorScheme = useConfigStore((s) => s.setColorScheme);
  const useSystemTheme = useConfigStore((s) => s.useSystemTheme);
  const setUseSystemTheme = useConfigStore((s) => s.setUseSystemTheme);

  const [host, setHost] = useState('http://192.168.31.250:9191');
  const [token, setToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const gatewayRef = useRef<GatewayClient | null>(null);

  // 加载已保存的配置
  useEffect(() => {
    api.loadApiConfig().then((cfg) => {
      if (cfg) {
        setHost(cfg.host);
        setToken(cfg.token ?? '');
      }
    });
  }, []);

  // 用户名密码登录
  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('提示', '请输入用户名和密码');
      return;
    }
    setLoggingIn(true);
    try {
      const config = { host };
      await api.saveApiConfig(config);
      const result = await api.login(username.trim(), password.trim());
      setToken(result.token);
      setPassword('');
      Alert.alert('登录成功', '已获取认证 Token');
    } catch (err) {
      // 避免向后端泄漏内部错误详情
      const message = err instanceof Error ? err.message : '';
      if (message.includes('timeout') || message.includes('connect')) {
        Alert.alert('登录失败', '无法连接到服务器，请检查地址和网络');
      } else if (message.includes('401') || message.includes('403')) {
        Alert.alert('登录失败', '用户名或密码错误');
      } else {
        Alert.alert('登录失败', '请检查用户名密码和服务器状态');
      }
    } finally {
      setLoggingIn(false);
    }
  }, [host, username, password]);

  // 退出登录
  const handleLogout = useCallback(async () => {
    await api.logout();
    setToken('');
    Alert.alert('已退出', '认证 Token 已清除');
  }, []);

  // 测试连接
  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    try {
      const config = { host, token: token || undefined };
      const ok = await api.testConnection(config);
      if (ok) {
        await api.saveApiConfig(config);
        const status = await api.getStatus();
        setBackendReachable(true);
        setVersion(status.version ?? null);
        setError(null);
        Alert.alert('成功', '后端连接正常！');
      } else {
        Alert.alert('失败', '无法连接到后端服务');
      }
    } catch (err) {
      Alert.alert('错误', (err as Error).message);
    } finally {
      setTesting(false);
    }
  }, [host, token, setBackendReachable, setVersion, setError]);

  // 连接 WebSocket
  const handleConnectWS = useCallback(async () => {
    // 使用 ref 持久化 GatewayClient 实例
    if (connectionStatus === 'connecting' || connectionStatus === 'open') {
      Alert.alert('提示', '已经连接');
      return;
    }

    if (gatewayRef.current) {
      gatewayRef.current.close();
    }
    const gw = new GatewayClient();
    gatewayRef.current = gw;
    gw.onStateChange = (state) => {
      setStatus(state);
    };

    try {
      const wsUrl = api.buildWsUrl();
      const token = api.getWsAuthToken();
      await gw.connect(wsUrl, token ?? undefined);
      setConnected(true);
      Alert.alert('成功', 'WebSocket 连接已建立');
    } catch (err) {
      setStatus('error');
      Alert.alert('连接失败', (err as Error).message);
    }
  }, [connectionStatus, setStatus]);

  // 组件卸载时清理 WebSocket 连接，防止泄漏
  useEffect(() => {
    return () => {
      if (gatewayRef.current) {
        gatewayRef.current.close();
        gatewayRef.current = null;
      }
    };
  }, []);

  const handleDisconnect = useCallback(() => {
    if (gatewayRef.current) {
      gatewayRef.current.close();
      gatewayRef.current = null;
    }
    setStatus('closed');
    setConnected(false);
  }, [setStatus]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>设置</Text>
        <ConnectionBadge />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── 网关连接 ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          后端连接
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>服务器地址</Text>
          <TextInput
            value={host}
            onChangeText={setHost}
            placeholder="http://192.168.31.250:9191"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[styles.input, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.background }]}
          />

          <Text style={[styles.label, { color: colors.text }]}>认证 Token (可选)</Text>
          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="输入 API token..."
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={[styles.input, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.background }]}
          />

          {/* ── 用户名密码登录 ── */}
          <View style={[styles.loginDivider, { borderColor: colors.borderLight }]} />
          <Text style={[styles.label, { color: colors.text }]}>或使用用户名密码登录</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="用户名"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.background }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="密码"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={[styles.input, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.background }]}
          />
          <View style={styles.buttonRow}>
            {token ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.error }]}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>退出登录</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleLogin}
                disabled={loggingIn}
              >
                {loggingIn ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>登录</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>测试连接</Text>
              )}
            </TouchableOpacity>

            {connected ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.error }]}
                onPress={handleDisconnect}
              >
                <Text style={styles.buttonText}>断开</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.success }]}
                onPress={handleConnectWS}
              >
                <Text style={styles.buttonText}>连接</Text>
              </TouchableOpacity>
            )}
          </View>

          {version && (
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              版本: {version}
            </Text>
          )}
        </View>

        {/* ── 外观 ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          外观
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>跟随系统主题</Text>
            <Switch
              value={useSystemTheme}
              onValueChange={setUseSystemTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={useSystemTheme ? colors.primary : colors.textTertiary}
            />
          </View>
          {!useSystemTheme && (
            <View style={styles.themeButtons}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  colorScheme === 'light' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  { borderColor: colors.borderLight },
                ]}
                onPress={() => setColorScheme('light')}
              >
                <Text style={[styles.themeButtonText, { color: colorScheme === 'light' ? colors.primary : colors.text }]}>
                  ☀️ 浅色
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  colorScheme === 'dark' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  { borderColor: colors.borderLight },
                ]}
                onPress={() => setColorScheme('dark')}
              >
                <Text style={[styles.themeButtonText, { color: colorScheme === 'dark' ? colors.primary : colors.text }]}>
                  🌙 深色
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 快速导航 ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          功能
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsNavItem
            label="模型配置"
            icon="🤖"
            onPress={() => navigation.navigate('ModelConfig')}
            colors={colors}
          />
          <SettingsNavItem
            label="Profile 管理"
            icon="👤"
            onPress={() => navigation.navigate('Profile')}
            colors={colors}
          />
          <SettingsNavItem
            label="技能管理"
            icon="🧠"
            onPress={() => navigation.navigate('Skills')}
            colors={colors}
            last
          />
        </View>

        {/* ── 关于 ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          关于
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Hermes Mobile v1.0.0
          </Text>
          <Text style={[styles.aboutText, { color: colors.textTertiary }]}>
            基于 NousResearch/hermes-agent 构建
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

interface SettingsNavItemProps {
  label: string;
  icon: string;
  onPress: () => void;
  colors: ReturnType<typeof getColors>;
  last?: boolean;
}

const SettingsNavItem: React.FC<SettingsNavItemProps> = ({ label, icon, onPress, colors, last }) => (
  <TouchableOpacity
    style={[styles.navItem, !last && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.navIcon}>{icon}</Text>
    <Text style={[styles.navLabel, { color: colors.text }]}>{label}</Text>
    <Text style={[styles.navArrow, { color: colors.textTertiary }]}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.subtitle,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  label: {
    ...typography.bodyBold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  versionText: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loginDivider: {
    borderTopWidth: 1,
    marginVertical: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    ...typography.body,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  themeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonText: {
    ...typography.body,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  navIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  navLabel: {
    ...typography.body,
    flex: 1,
  },
  navArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  aboutText: {
    ...typography.caption,
    textAlign: 'center',
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});
