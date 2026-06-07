

// import { Tabs } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { View } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor="#1D9E75"
      //indicatorColor="#1D9E75" 
      rippleColor="rgba(29, 158, 177, 0.15)"
      labelVisibilityMode="labeled"
      backBehavior="history">

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon md="grid_view" />
        <NativeTabs.Trigger.Label>
          Tracker
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="about">
        <NativeTabs.Trigger.Icon md="info" />
        <NativeTabs.Trigger.Label>
          About
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

    </NativeTabs>
    // <Tabs
    //   screenOptions={{
    //     tabBarActiveTintColor: '#EAEAEA',
    //     tabBarInactiveTintColor: '#8E9E93',
    //     headerStyle: {
    //       backgroundColor: '#121212',
    //     },
    //     headerShadowVisible: false,
    //     headerTintColor: '#EAEAEA',
    //     tabBarStyle: {
    //       backgroundColor: '#121212',
    //       borderTopWidth: 1,
    //       borderTopColor: '#8E9E93',
    //       elevation: 0,
    //     }
    //   }}
    // >
    //   <Tabs.Screen 
    //     name="index" 
    //     options={{
    //       headerTitle: 'DAILYS',
    //       tabBarLabel: 'Tracker',
    //       tabBarIcon: ({ color, focused }) => (
    //         <View style={{
    //           width: '100%',
    //           alignItems: 'center',
    //           justifyContent: 'center',
    //           borderTopWidth: focused ? 3 : 0,
    //           borderTopColor: '#121212',
    //           paddingTop: focused ? 4 : 7,
    //           marginTop: -11,
    //         }}>
    //           <Ionicons name={focused ? 'grid' : 'grid-outline'} color={color} size={24} />
    //         </View>
    //       ),
    //     }} />
    //   <Tabs.Screen
    //   name="about"
    //   options={{ 
    //     title: 'About',
    //     tabBarIcon: ({ color, focused }) => (
    //         <View style={{
    //           width: '100%',
    //           alignItems: 'center',
    //           justifyContent: 'center',
    //           borderTopWidth: focused ? 3 : 0,
    //           borderTopColor: '#121212',
    //           paddingTop: focused ? 4 : 7,
    //           marginTop: -11,
    //         }}>
    //           <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24} />
    //         </View>
    //     ),
    //   }}
    // />
    // </Tabs>
  );
}
