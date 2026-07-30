/**
 * 底部 Tab 导航器
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, useColorScheme, View, Text } from 'react-native';
import { ChatScreen } from '../screens/ChatScreen';
import { SessionsScreen } from '../screens/SessionsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { getColors, resolveColorScheme } from '../theme/colors';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    'Chat': '💬',
    'Sessions': '📋',
    'Settings': '⚙️',
  };
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.5 }]}>
        {icons[label] ?? '•'}
      </Text>
    </View>
  );
}

export const TabNavigator: React.FC = () => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon label={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: '聊天' }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{ tabBarLabel: '对话' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: '设置' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
  },
});
