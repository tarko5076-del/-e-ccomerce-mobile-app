import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CategoryFilter({ categories, selected, onSelect }) {
  const { colors } = useTheme();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.container}
    >
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.pill, 
            { backgroundColor: colors.cardBgLight },
            selected === cat.name && { backgroundColor: colors.primary }
          ]}
          onPress={() => onSelect(cat.name)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.pillText, 
            { color: colors.brandPillText },
            selected === cat.name && { color: colors.brandPillTextActive, fontWeight: '700' }
          ]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
});