import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Alert, TextInput, FlatList
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { rf } from '../utils/responsive';
import { API_URL } from '../utils/api';
import ProductCard from '../components/productCard';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const { colors, theme } = useTheme();
  
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  // Review submission state
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    performance: 5,
    durability: 5,
    batteryLife: 5,
    buildQuality: 5
  });

  const fetchProductDetails = async () => {
    try {
      const prodRes = await fetch(`${API_URL}/api/products/${product.id}`);
      if (prodRes.ok) {
        const data = await prodRes.json();
        setDetailedProduct(data);
      } else {
        setDetailedProduct(product);
      }
      
      const recsRes = await fetch(`${API_URL}/api/products/${product.id}/recommendations`);
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        setRecommendations(recsData);
      }
    } catch (err) {
      console.warn('Failed fetching detailed product/recommendations', err);
      setDetailedProduct(product);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [product.id]);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(detailedProduct || product);
    }
    Alert.alert('Added to cart', `${product.name} × ${qty} added.`, [
      { text: 'Keep shopping', style: 'cancel' },
      { text: 'View cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const submitReview = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to leave a review.');
      return;
    }
    if (!reviewForm.comment.trim()) {
      Alert.alert('Error', 'Please enter a review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
          performance: reviewForm.performance,
          durability: reviewForm.durability,
          batteryLife: reviewForm.batteryLife,
          buildQuality: reviewForm.buildQuality
        })
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Thank you for your review!');
        setReviewForm({
          rating: 5,
          comment: '',
          performance: 5,
          durability: 5,
          batteryLife: 5,
          buildQuality: 5
        });
        // Reload details to show new review
        fetchProductDetails();
      } else {
        Alert.alert('Failed', data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      Alert.alert('Error', 'Cannot connect to the server.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (ratingVal, fieldToUpdate) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              if (fieldToUpdate) {
                setReviewForm(f => ({ ...f, [fieldToUpdate]: star }));
              }
            }}
            disabled={!fieldToUpdate}
            activeOpacity={0.7}
          >
            <Text style={[styles.starIcon, star <= ratingVal && styles.starIconActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const showProduct = detailedProduct || product;
  const isLowStock = showProduct.stock > 0 && showProduct.stock < 4;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header navigation bar */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: colors.cardBgLight }]} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={[styles.backBtnText, { color: colors.text }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{showProduct.name}</Text>
        </View>

        <View style={[styles.imageContainer, { backgroundColor: colors.card }]}>
          <Image source={{ uri: showProduct.image }} style={styles.image} />
        </View>
        
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.body}>
            <Text style={[styles.category, { color: colors.primary }]}>
              {showProduct.category} · {showProduct.brand}
            </Text>
            
            <Text style={[styles.name, { color: colors.text }]}>{showProduct.name}</Text>
            
            <View style={styles.metaRow}>
              <Text style={[styles.ratingText, { color: colors.subtext }]}>⭐ {showProduct.rating} / 5.0</Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isLowStock && (
                  <View style={[styles.lowStockBadge, { backgroundColor: colors.warning + '1a' }]}>
                    <Text style={[styles.lowStockText, { color: colors.warning }]}>Only {showProduct.stock} left!</Text>
                  </View>
                )}
                
                <Text style={[
                  styles.stockText, 
                  { color: showProduct.stock > 0 ? colors.accent : colors.danger }
                ]}>
                  {showProduct.stock > 0 ? `🟢 In Stock (${showProduct.stock})` : '🔴 Out of Stock'}
                </Text>
              </View>
            </View>

            <Text style={[styles.price, { color: colors.text }]}>ETB {showProduct.price.toLocaleString()}</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.cardBgLight }]}
                onPress={() => setQty(q => Math.max(1, q - 1))}
                activeOpacity={0.8}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text }]}>{qty}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.cardBgLight }]}
                onPress={() => setQty(q => q + 1)}
                activeOpacity={0.8}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Description</Text>
            <Text style={[styles.description, { color: colors.subtext }]}>
              {showProduct.description || 'Premium quality electronics product. Carefully designed to meet your highest needs. Includes official warranty and customer support services.'}
            </Text>

            {/* Technical Specifications */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Technical Specifications</Text>
            <View style={[styles.specTable, { borderColor: colors.border }]}>
              {showProduct.processor && (
                <View style={[styles.specRow, { borderBottomColor: colors.border }]}><Text style={[styles.specLabel, { color: colors.subtext }]}>Processor</Text><Text style={[styles.specValue, { color: colors.text }]}>{showProduct.processor}</Text></View>
              )}
              {showProduct.ram && (
                <View style={[styles.specRow, { borderBottomColor: colors.border }]}><Text style={[styles.specLabel, { color: colors.subtext }]}>RAM</Text><Text style={[styles.specValue, { color: colors.text }]}>{showProduct.ram}</Text></View>
              )}
              {showProduct.storage && (
                <View style={[styles.specRow, { borderBottomColor: colors.border }]}><Text style={[styles.specLabel, { color: colors.subtext }]}>Storage</Text><Text style={[styles.specValue, { color: colors.text }]}>{showProduct.storage}</Text></View>
              )}
              {showProduct.battery && (
                <View style={[styles.specRow, { borderBottomColor: colors.border }]}><Text style={[styles.specLabel, { color: colors.subtext }]}>Battery</Text><Text style={[styles.specValue, { color: colors.text }]}>{showProduct.battery}</Text></View>
              )}
              {showProduct.displaySize && (
                <View style={[styles.specRow, { borderBottomColor: colors.border }]}><Text style={[styles.specLabel, { color: colors.subtext }]}>Display Size</Text><Text style={[styles.specValue, { color: colors.text }]}>{showProduct.displaySize}</Text></View>
              )}
              {showProduct.camera && (
                <View style={[styles.specRow, { borderBottomColor: colors.border }]}><Text style={[styles.specLabel, { color: colors.subtext }]}>Camera</Text><Text style={[styles.specValue, { color: colors.text }]}>{showProduct.camera}</Text></View>
              )}
              {showProduct.os && (
                <View style={[styles.specRow, { borderBottomColor: colors.border }]}><Text style={[styles.specLabel, { color: colors.subtext }]}>Operating System</Text><Text style={[styles.specValue, { color: colors.text }]}>{showProduct.os}</Text></View>
              )}
              {showProduct.warranty && (
                <View style={[styles.specRow, { borderBottomWidth: 0 }]}><Text style={[styles.specLabel, { color: colors.subtext }]}>Warranty</Text><Text style={[styles.specValue, { color: colors.text }]}>{showProduct.warranty}</Text></View>
              )}
            </View>

            {/* Reviews Section */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Reviews ({showProduct.reviews?.length || 0})</Text>
            {(!showProduct.reviews || showProduct.reviews.length === 0) ? (
              <Text style={styles.emptyReviews}>No reviews yet. Be the first to review this product!</Text>
            ) : (
              showProduct.reviews.map((rev) => (
                <View key={rev.id} style={[styles.reviewCard, { borderBottomColor: colors.border }]}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewerName, { color: colors.text }]}>{rev.userName}</Text>
                    <Text style={styles.reviewDate}>{rev.createdAt}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginVertical: 4 }}>
                    {renderStars(rev.rating)}
                  </View>
                  <Text style={[styles.reviewComment, { color: colors.subtext }]}>{rev.comment}</Text>
                  
                  {/* Micro ratings */}
                  <View style={styles.microRatings}>
                    {rev.performance && (
                      <Text style={[styles.microRatingTag, { backgroundColor: colors.cardBgLight, color: colors.subtext }]}>Perf: {rev.performance}⭐</Text>
                    )}
                    {rev.durability && (
                      <Text style={[styles.microRatingTag, { backgroundColor: colors.cardBgLight, color: colors.subtext }]}>Durability: {rev.durability}⭐</Text>
                    )}
                    {rev.batteryLife && (
                      <Text style={[styles.microRatingTag, { backgroundColor: colors.cardBgLight, color: colors.subtext }]}>Battery: {rev.batteryLife}⭐</Text>
                    )}
                    {rev.buildQuality && (
                      <Text style={[styles.microRatingTag, { backgroundColor: colors.cardBgLight, color: colors.subtext }]}>Build: {rev.buildQuality}⭐</Text>
                    )}
                  </View>
                </View>
              ))
            )}

            {/* Review Submission Form */}
            {user ? (
              <View style={[styles.writeReviewContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.writeReviewTitle, { color: colors.text }]}>Leave a Review</Text>
                
                <View style={styles.ratingInputRow}>
                  <Text style={[styles.ratingInputLabel, { color: colors.subtext }]}>Overall Rating</Text>
                  {renderStars(reviewForm.rating, 'rating')}
                </View>
                
                <View style={styles.ratingInputRow}>
                  <Text style={[styles.ratingInputLabel, { color: colors.subtext }]}>Performance</Text>
                  {renderStars(reviewForm.performance, 'performance')}
                </View>

                <View style={styles.ratingInputRow}>
                  <Text style={[styles.ratingInputLabel, { color: colors.subtext }]}>Durability</Text>
                  {renderStars(reviewForm.durability, 'durability')}
                </View>

                <View style={styles.ratingInputRow}>
                  <Text style={[styles.ratingInputLabel, { color: colors.subtext }]}>Battery Life</Text>
                  {renderStars(reviewForm.batteryLife, 'batteryLife')}
                </View>

                <View style={styles.ratingInputRow}>
                  <Text style={[styles.ratingInputLabel, { color: colors.subtext }]}>Build Quality</Text>
                  {renderStars(reviewForm.buildQuality, 'buildQuality')}
                </View>

                <TextInput
                  style={[styles.reviewInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="Share your experience with this electronic item (performance, design, battery life)..."
                  placeholderTextColor={colors.subtext}
                  multiline
                  numberOfLines={4}
                  value={reviewForm.comment}
                  onChangeText={v => setReviewForm(f => ({ ...f, comment: v }))}
                />

                <TouchableOpacity
                  style={[styles.submitReviewBtn, { backgroundColor: colors.primary }]}
                  onPress={submitReview}
                  disabled={submittingReview}
                  activeOpacity={0.8}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitReviewBtnText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.loginReviewPrompt, { backgroundColor: colors.primary + '1a', borderColor: colors.primary }]}>
                <Text style={[styles.loginReviewText, { color: colors.primary }]}>Please sign in to write a product review.</Text>
                <TouchableOpacity
                  style={[styles.loginReviewBtn, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('Auth', { redirectTo: 'ProductDetail', params: { product } })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginReviewBtnText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Bought Together</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={recommendations}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.recommendationWrapper}>
                      <ProductCard product={item} navigation={navigation} />
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Dynamic footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.cartBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
          onPress={handleAddToCart}
          activeOpacity={0.9}
        >
          <Text style={styles.cartBtnText}>
            Add to Cart — ETB {((detailedProduct || product).price * qty).toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12
  },
  backBtnText: { fontSize: rf(12), fontWeight: '600' },
  headerTitle: { flex: 1, fontSize: rf(14), fontWeight: '700' },
  imageContainer: {
    width: '100%', 
    height: 240, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  image: { width: '85%', height: '100%', resizeMode: 'contain' },
  body: { padding: 20 },
  loader: { height: 200, justifyContent: 'center', alignItems: 'center' },
  category: { fontSize: rf(10.5), fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  name: { fontSize: rf(18), fontWeight: '800', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' },
  ratingText: { fontSize: rf(12.5), fontWeight: '600' },
  stockText: { fontSize: rf(11.5), fontWeight: '800' },
  lowStockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lowStockText: {
    fontSize: rf(10),
    fontWeight: '800',
  },
  price: { fontSize: rf(21), fontWeight: '900', marginBottom: 16 },
  sectionTitle: { fontSize: rf(14), fontWeight: '800', marginBottom: 10, marginTop: 20 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  qtyBtn: {
    borderRadius: 8,
    width: rf(34), height: rf(34),
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { fontSize: rf(18), fontWeight: '600' },
  qtyText: { fontSize: rf(15), fontWeight: '800', marginHorizontal: 20 },
  description: { fontSize: rf(13), lineHeight: 21 },
  specTable: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  specLabel: { fontSize: rf(12), fontWeight: '600' },
  specValue: { fontSize: rf(12), fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16 },
  emptyReviews: { fontSize: rf(12), color: '#9ca3af', fontStyle: 'italic', marginVertical: 6 },
  reviewCard: { padding: 14, borderBottomWidth: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { fontSize: rf(12.5), fontWeight: '700' },
  reviewDate: { fontSize: rf(11), color: '#9ca3af' },
  reviewComment: { fontSize: rf(12.5), lineHeight: 18, marginTop: 4 },
  starRow: { flexDirection: 'row' },
  starIcon: { fontSize: rf(18), color: '#d1d5db', marginRight: 2 },
  starIconActive: { color: '#fbbf24' },
  microRatings: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  microRatingTag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, fontSize: rf(9.5), marginRight: 6, marginBottom: 4, fontWeight: '600' },
  writeReviewContainer: { borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1 },
  writeReviewTitle: { fontSize: rf(13.5), fontWeight: '800', marginBottom: 12 },
  ratingInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ratingInputLabel: { fontSize: rf(12), fontWeight: '600' },
  reviewInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: rf(12.5), textAlignVertical: 'top', marginTop: 8 },
  submitReviewBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  submitReviewBtnText: { color: '#ffffff', fontSize: rf(12.5), fontWeight: '700' },
  loginReviewPrompt: { borderStyle: 'dashed', borderWidth: 1, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  loginReviewText: { fontSize: rf(12), marginBottom: 10 },
  loginReviewBtn: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  loginReviewBtnText: { color: '#ffffff', fontSize: rf(12), fontWeight: '700' },
  recommendationsContainer: { marginTop: 10, marginBottom: 30 },
  recommendationWrapper: { width: rf(140), marginRight: 10 },
  footer: { padding: 16, borderTopWidth: 1 },
  cartBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  cartBtnText: { color: '#ffffff', fontSize: rf(14), fontWeight: '700' },
});