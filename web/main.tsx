import 'react-native-gesture-handler';
import React from 'react';
import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

function WebApp() {
  return (
    <GestureHandlerRootView style={{ flex: 1, minHeight: '100vh' as any }}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

AppRegistry.registerComponent('GayaApp', () => WebApp);
AppRegistry.runApplication('GayaApp', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
