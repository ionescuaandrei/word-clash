// Removed unused imports
import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import React from 'react'
import { COLORS } from '@/constants/theme';

const TabLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: true,
                headerShown: false,
                tabBarActiveTintColor: COLORS.secondary,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopWidth: 0,
                    position: 'absolute',
                    elevation: 0,
                    height: 60,
                    paddingBottom: 10,
                },
            }}>
                <Tabs.Screen 
                    name="index" 
                    options={{ 
                        headerShown: false, 
                        tabBarIcon: ({size,color}: {size: number, color: string}) => <MaterialCommunityIcons name="sword-cross" size={size} color={color} />, 
                        tabBarLabel: "Battle",
                    }} 
                />
                <Tabs.Screen 
                    name="tournament" 
                    options={{ 
                        headerShown: false, 
                        tabBarIcon: ({size, color}: {size: number; color: string}) => <MaterialCommunityIcons name="tournament" size={size} color={color} />,
                        tabBarLabel: "Tournament", 
                    }} 
                />
                <Tabs.Screen 
                    name="profile" 
                    options={{ 
                        headerShown: false ,
                        tabBarIcon: ({size, color}: {size: number; color: string}) => <FontAwesome6 name="user-shield" size={size} color={color} />,
                        tabBarLabel: "Profile",
                    }} 
                />
        </Tabs>
    )
}

export default TabLayout