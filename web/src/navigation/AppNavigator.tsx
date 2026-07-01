import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { WardrobeScreen } from '../screens/WardrobeScreen';
import { OccasionScreen } from '../screens/OccasionScreen';
import { SuggestionScreen } from '../screens/SuggestionScreen';
import { ColourScreen } from '../screens/ColourScreen';
import { TryOnScreen } from '../screens/TryOnScreen';

export type RootStackParamList = {
  Main: undefined;
  Camera: undefined;
  Suggestion: { occasion: string; culturalContext: string };
  Colour: undefined;
  TryOn: undefined;
};

export type TabParamList = {
  Home: undefined;
  Wardrobe: undefined;
  Occasion: undefined;
  TryOn: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wardrobe"
        component={WardrobeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👗" label="Wardrobe" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Occasion"
        component={OccasionScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" label="Occasion" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TryOn"
        component={TryOnScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🪞" label="Try On" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Suggestion" component={SuggestionScreen} />
        <Stack.Screen name="Colour" component={ColourScreen} />
        <Stack.Screen name="TryOn" component={TryOnScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#2a2247',
    borderTopColor: '#2244d4',
    borderTopWidth: 3,
    height: 80,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#2244d4',
    backgroundColor: '#1a1a2e',
    borderRadius: 0,
  },
  tabIconActive: {
    backgroundColor: '#2244d4',
    borderColor: '#fbbf24',
  },
  tabEmoji: { fontSize: 20, fontWeight: '900' },
  tabLabel: { fontSize: 9, color: '#7a8aaa', marginTop: 4, fontWeight: '900' },
  tabLabelActive: { color: '#fbbf24', fontWeight: '900' },
});
