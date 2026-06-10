import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, SafeAreaView, Dimensions
} from 'react-native';
import { categories } from '../data/products';
import ProductCard from '../components/productCard';
import CategoryFilter from '../components/CategoryFilter';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SkeletonLoader from '../components/SkeletonLoader';
import { rf } from '../utils/responsive';

const { width } = Dimensions.get('window');

const BANNERS = [
  { id: 'b1', title: 'Flash Sales! ⚡', desc: 'Up to 20% off Premium Headphones', color: '#1e3a8a', label: 'Shop Now' },
  { id: 'b2', title: 'New Arrivals 🌟', desc: 'Experience the new iPad Pro M4 Tandem OLED', color: '#0f172a', label: 'Discover' },
  { id: 'b3', title: 'Pro Gaming Gear 🎮', desc: 'Upgrade your accessories & mechanical keyboards', color: '#065f46', label: 'Explore' }
];

const BRANDS = ['All', 'Apple', 'Samsung', 'Sony', 'Dell', 'Canon', 'Logitech', 'LG'];

const SORT_OPTIONS = [
  { id: 'popularity', label: '🔥 Popularity' },
  { id: 'rating', label: '⭐ Rating' },
  { id: 'price_asc', label: '📈 Price: Low to High' },
  { id: 'price_desc', label: '📉 Price: High to Low' },
];

export default function HomeScreen({ navigation }) {
  const { productsList, cartCount } = useCart();
  const { user } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [searchText, setSearchText] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort products
  const filteredAndSorted = productsList
    .filter(p => {
      const matchCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchBrand = selectedBrand === 'All' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchText.toLowerCase());
      return matchCategory && matchBrand && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.popularity || 0) - (a.popularity || 0);
    });

  const activeSortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label || '🔥 Popularity';

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.greeting, { color: colors.text }]}>Hello, {user ? user.name : 'Guest'}</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Welcome to ElectroHub</Text>
      </View>

      <View style={styles.headerActions}>
        {/* Theme Toggler */}
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>{theme === 'light' ? '☾' : '☀'}</Text>
        </TouchableOpacity>

        {/* Shopping Cart Button */}
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        {/* Search placeholder */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search smartphones, laptops, gaming..."
            placeholderTextColor={colors.subtext}
            editable={false}
          />
        </View>

        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={item => item.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={() => <SkeletonLoader />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredAndSorted}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <>
            {renderHeader()}

            {/* Search container */}
            <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search smartphones, laptops, gaming..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={colors.subtext}
              />
            </View>

            {/* Promo banner carousel */}
            <FlatList
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={BANNERS}
              keyExtractor={item => item.id}
              style={styles.bannerList}
              renderItem={({ item }) => (
                <View style={[styles.bannerCard, { backgroundColor: item.color }]}>
                  <View style={styles.bannerInfo}>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Text style={styles.bannerDesc}>{item.desc}</Text>
                    <TouchableOpacity style={styles.bannerButton} activeOpacity={0.8}>
                      <Text style={styles.bannerBtnText}>{item.label}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            {/* Category Filter */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={(cat) => setSelectedCategory(cat)}
            />

            {/* Brand Filter */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Brands</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>
              {BRANDS.map(brand => {
                const isActive = selectedBrand === brand;
                return (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.brandPill,
                      { backgroundColor: colors.cardBgLight, borderColor: colors.border },
                      isActive && { backgroundColor: colors.cardBgActive, borderColor: colors.cardBgActive }
                    ]}
                    onPress={() => setSelectedBrand(brand)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.brandPillText,
                      { color: colors.brandPillText },
                      isActive && { color: colors.brandPillTextActive, fontWeight: '700' }
                    ]}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Sorting and Result Count Bar */}
            <View style={styles.sortBar}>
              <Text style={[styles.resultCount, { color: colors.subtext }]}>{filteredAndSorted.length} products found</Text>
              
              <View style={styles.sortDropdownContainer}>
                <TouchableOpacity
                  style={[styles.sortSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowSortDropdown(!showSortDropdown)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sortSelectorText, { color: colors.text }]}>{activeSortLabel} ▾</Text>
                </TouchableOpacity>

                {showSortDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {SORT_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownItem,
                          { borderBottomColor: colors.border },
                          sortBy === opt.id && { backgroundColor: colors.cardBgLight }
                        ]}
                        onPress={() => {
                          setSortBy(opt.id);
                          setShowSortDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          { color: colors.text },
                          sortBy === opt.id && { color: colors.primary, fontWeight: '700' }
                        ]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard product={item} navigation={navigation} />
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.subtext }]}>No electronics match your search filters.</Text>}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { paddingHorizontal: 10, paddingTop: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  greeting: { fontSize: rf(18), fontWeight: '800' },
  subtitle: { fontSize: rf(12), marginTop: 2 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    position: 'relative',
    borderWidth: 1.5,
    borderRadius: 12,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: { fontSize: rf(17) },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: { color: '#ffffff', fontSize: rf(8.5), fontWeight: '800' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginHorizontal: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    marginVertical: 10,
  },
  searchIcon: { fontSize: rf(14), marginRight: 10 },
  searchInput: { flex: 1, fontSize: rf(13) },
  bannerList: { marginVertical: 8 },
  bannerCard: {
    width: width - 40,
    marginHorizontal: 10,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    height: rf(120),
  },
  bannerInfo: { justifyContent: 'center' },
  bannerTitle: { color: '#ffffff', fontSize: rf(16), fontWeight: '800' },
  bannerDesc: { color: '#e5e7eb', fontSize: rf(11.5), marginTop: 4, marginBottom: 12 },
  bannerButton: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bannerBtnText: { color: '#111827', fontSize: rf(10.5), fontWeight: '700' },
  sectionTitle: { fontSize: rf(14), fontWeight: '800', marginHorizontal: 10, marginTop: 14, marginBottom: 4 },
  brandList: { paddingHorizontal: 10, paddingVertical: 8 },
  brandPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  brandPillText: { fontSize: rf(11.5), fontWeight: '500' },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 12,
    zIndex: 10,
  },
  resultCount: { fontSize: rf(11.5) },
  sortDropdownContainer: { position: 'relative' },
  sortSelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortSelectorText: { fontSize: rf(11), fontWeight: '600' },
  dropdownMenu: {
    position: 'absolute',
    top: 32,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    width: rf(150),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20,
    overflow: 'hidden'
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  dropdownItemText: { fontSize: rf(11) },
  empty: { textAlign: 'center', marginTop: 40, fontSize: rf(13), paddingHorizontal: 30 },
});
