import React, { useRef, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { rf } from '../utils/responsive';

export default function ProductCard({ product, navigation }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { colors } = useTheme();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [addedFeedback, setAddedFeedback] = useState(false);
  
  const wishlisted = isWishlisted(product.id);
  const isLowStock = product.stock > 0 && product.stock < 4;

  const showAddedFeedback = () => {
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleAddToCart = () => {
    addToCart(product);
    showAddedFeedback();
  };

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card, 
          { backgroundColor: colors.card, borderColor: colors.border },
          addedFeedback && styles.cardAdded
        ]}
        onPress={() => navigation.navigate('ProductDetail', { product })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={handleAddToCart}
        delayLongPress={450}
        activeOpacity={1}
      >
        {/* Heart wishlist button */}
        <TouchableOpacity
          style={[styles.heartBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={(event) => {
            event.stopPropagation();
            toggleWishlist(product);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.8}
        >
          <Text style={styles.heartIcon}>{wishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Product Image */}
        <Image source={{ uri: product.image }} style={[styles.image, { backgroundColor: colors.border }]} />

        {/* Green feedback banner */}
        {addedFeedback && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>✓ Added to cart!</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={[styles.category, { color: colors.primary }]} numberOfLines={1}>
            {product.category}
          </Text>
          
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {product.name}
          </Text>

          {/* Rating and Low Stock indicator */}
          <View style={styles.metaRow}>
            <Text style={[styles.rating, { color: colors.subtext }]}>⭐ {product.rating}</Text>
            {isLowStock && (
              <View style={[styles.stockAlertBadge, { backgroundColor: colors.warning + '1a' }]}>
                <Text style={[styles.stockAlertText, { color: colors.warning }]}>
                  Only {product.stock} left
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>ETB {product.price.toLocaleString()}</Text>
            
            {/* Mini Cart Button */}
            <TouchableOpacity
              style={[styles.cartMiniBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={(event) => {
                event.stopPropagation();
                handleAddToCart();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cartMiniIcon}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: 6,
    maxWidth: '48%',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
  },
  cardAdded: {
    borderColor: '#22c55e',
    borderWidth: 1.5,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    borderRadius: 20,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heartIcon: {
    fontSize: rf(12.5),
  },
  feedbackBanner: {
    position: 'absolute',
    top: 86,
    left: 0,
    right: 0,
    backgroundColor: '#22c55e',
    paddingVertical: 5,
    alignItems: 'center',
    zIndex: 5,
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: rf(10.5),
    fontWeight: '800',
  },
  info: {
    padding: 10,
  },
  category: {
    fontSize: rf(8.5),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: rf(12),
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    height: 20,
  },
  rating: {
    fontSize: rf(10.5),
    fontWeight: '600',
  },
  stockAlertBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockAlertText: {
    fontSize: rf(8.5),
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: rf(14),
    fontWeight: '800',
  },
  cartMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cartMiniIcon: {
    fontSize: rf(13),
    color: '#ffffff',
  },
});
