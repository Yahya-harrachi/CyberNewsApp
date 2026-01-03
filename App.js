// App.js or your main navigation file
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen.js';
import DiscoverScreen from './src/screens/DiscoverScreen.js';
import BookmarkScreen from './src/screens/BookmarkScreen.js';
import ProfileScreen from './src/screens/ProfileScreen.js';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack Navigator (includes ArticleDetail)
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="ArticleDetail" 
        component={ArticleDetailScreen}
        options={{ 
          title: 'Article',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
  );
}

// Discover Stack Navigator
function DiscoverStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DiscoverMain" 
        component={DiscoverScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="ArticleDetail" 
        component={ArticleDetailScreen}
        options={{ 
          title: 'Article',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
  );
}

// Bookmark Stack Navigator
function BookmarkStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BookmarkMain" 
        component={BookmarkScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="ArticleDetail" 
        component={ArticleDetailScreen}
        options={{ 
          title: 'Article',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ 
          headerShown: false 
        }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Bookmark') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Discover" component={DiscoverStack} />
      <Tab.Screen name="Bookmark" component={BookmarkStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}