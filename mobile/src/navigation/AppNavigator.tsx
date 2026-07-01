import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={styles.tabIcon}>
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
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" label="Occasions" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TryOn"
        component={TryOnScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🪞" label="Try-On" focused={focused} />,
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
    backgroundColor: '#0b1220',
    borderTopColor: '#2b3a55',
    height: 76,
    paddingBottom: 10,
    paddingTop: 4,
  },
  tabIcon: {
    alignItems: 'center',
    marginTop: 4,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: { fontSize: 10, color: '#94a3b8', marginTop: 2, letterSpacing: 0.5 },
  tabLabelActive: { color: '#f59e0b', fontWeight: '800' },
});
