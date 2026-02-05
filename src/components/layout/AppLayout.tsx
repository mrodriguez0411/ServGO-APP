import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, StatusBarStyle, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

interface AppLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  statusBarStyle?: StatusBarStyle;
  showHeader?: boolean;
  headerTitle?: string;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  style,
  contentStyle,
  statusBarStyle = 'light-content',
  showHeader = false,
  headerTitle,
  headerRight,
  headerLeft,
}) => {
  return (
    <View style={[styles.container, style]}>
      <StatusBar barStyle={statusBarStyle} />
      
      <SafeAreaView style={[styles.safeArea, contentStyle]}>
        {/* Header */}
        {showHeader && (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {headerLeft || <View style={{ width: 40 }} />}
            </View>
            <View style={styles.headerCenter}>
              {headerTitle && (
                <BlurView intensity={80} tint="light" style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {headerTitle}
                  </Text>
                </BlurView>
              )}
            </View>
            <View style={styles.headerRight}>
              {headerRight || <View style={{ width: 40 }} />}
            </View>
          </View>
        )}
        
        {/* Contenido */}
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default AppLayout;
