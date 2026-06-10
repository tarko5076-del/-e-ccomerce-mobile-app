import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { rf } from '../utils/responsive';

const { width } = Dimensions.get('window');

export default function SkeletonLoader() {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.75,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Product Image Skeleton */}
      <Animated.View style={[styles.imagePlaceholder, { opacity: pulseAnim, backgroundColor: colors.border }]} />
      
      <View style={styles.info}>
        {/* Category Skeleton */}
        <Animated.View style={[styles.categorySkeleton, { opacity: pulseAnim, backgroundColor: colors.border }]} />
        
        {/* Title Skeleton */}
        <Animated.View style={[styles.titleSkeleton, { opacity: pulseAnim, backgroundColor: colors.border }]} />
        
        <View style={styles.footer}>
          {/* Price Skeleton */}
          <Animated.View style={[styles.priceSkeleton, { opacity: pulseAnim, backgroundColor: colors.border }]} />
          {/* Rating Skeleton */}
          <Animated.View style={[styles.ratingSkeleton, { opacity: pulseAnim, backgroundColor: colors.border }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: (width - 32) / 2,
    margin: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  imagePlaceholder: {
    height: rf(110),
    width: '100%',
  },
  info: {
    padding: 12,
  },
  categorySkeleton: {
    height: rf(9),
    width: '40%',
    borderRadius: 4,
    marginBottom: 8,
  },
  titleSkeleton: {
    height: rf(12),
    width: '85%',
    borderRadius: 6,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceSkeleton: {
    height: rf(12),
    width: '45%',
    borderRadius: 6,
  },
  ratingSkeleton: {
    height: rf(10),
    width: '25%',
    borderRadius: 5,
  },
});
