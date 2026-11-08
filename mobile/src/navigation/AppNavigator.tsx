import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { WardrobeScreen } from '../screens/WardrobeScreen';
import { StudioScreen } from '../screens/StudioScreen';
import { TryOnScreen } from '../screens/TryOnScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ColourScreen } from '../screens/ColourScreen';
import { colors } from '../theme';

export type TabParamList = {
  Wardrobe: undefined;
  Studio: undefined;
  TryOn: undefined;
  Profile: undefined;
  Colours: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg } };

const ICONS: Record<keyof TabParamList, string[]> = {
  Wardrobe: ['M12 4a2 2 0 0 1 2 2c0 1-1 1.5-2 2v1', 'm3 18 9-7 9 7a1 1 0 0 1-.6 1.8H3.6A1 1 0 0 1 3 18Z'],
  Studio: ['M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z', 'M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15Z'],
  TryOn: ['M8.5 4 3 7l2 4 2-1v10h10V10l2 1 2-4-5.5-3a3.5 3.5 0 0 1-7 0Z'],
  Profile: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  Colours: ['M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10Z'],
};

const icon = (name: keyof TabParamList) => ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    {ICONS[name].map((d) => <Path key={d} d={d} />)}
  </Svg>
);

export function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accentStrong,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.label,
        }}
      >
        <Tab.Screen name="Wardrobe" component={WardrobeScreen} options={{ tabBarIcon: icon('Wardrobe') }} />
        <Tab.Screen name="Studio" component={StudioScreen} options={{ tabBarIcon: icon('Studio'), tabBarLabel: 'Studio' }} />
        <Tab.Screen name="TryOn" component={TryOnScreen} options={{ tabBarIcon: icon('TryOn'), tabBarLabel: 'Try on' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: icon('Profile') }} />
        <Tab.Screen name="Colours" component={ColourScreen} options={{ tabBarIcon: icon('Colours'), tabBarLabel: 'Colours' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 68, paddingTop: 8, paddingBottom: 10 },
  label: { fontSize: 11, fontWeight: '600' },
});
