/**
 * 根导航器 — Stack + Tab 组合
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ModelConfigScreen } from '../screens/ModelConfigScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SkillsScreen } from '../screens/SkillsScreen';
import { useColorScheme } from 'react-native';
import { getColors, resolveColorScheme } from '../theme/colors';

export type RootStackParamList = {
  Main: undefined;
  ModelConfig: undefined;
  Profile: undefined;
  Skills: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="ModelConfig"
          component={ModelConfigScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Skills"
          component={SkillsScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
