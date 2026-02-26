import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {ProductCard} from './ProductCard';
import {useAppTheme} from './theme/ThemeContext';

const DEAL_DURATION_SECONDS = 8;

export default function HomeScreen({navigation}) {
  const {isDark, toggleTheme} = useAppTheme();
  const [userEmail, setUserEmail] = useState('');
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dealProduct, setDealProduct] = useState(null);
  const [dealSecondsLeft, setDealSecondsLeft] = useState(DEAL_DURATION_SECONDS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [activeSort, setActiveSort] = useState('none');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef(null);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const displayName = userEmail?.includes('@') ? userEmail.split('@')[0] : userEmail || 'Guest';
  const userInitial = displayName.charAt(0).toUpperCase() || 'G';

  const palette = useMemo(
    () => ({
      pageBg: isDark ? '#020617' : '#F8FAFC',
      cardBg: isDark ? '#0F172A' : '#FFFFFF',
      cardBorder: isDark ? '#1E293B' : '#E5E7EB',
      textPrimary: isDark ? '#E2E8F0' : '#111827',
      textSecondary: isDark ? '#94A3B8' : '#6B7280',
      textMuted: isDark ? '#64748B' : '#9CA3AF',
      inputBg: isDark ? '#1E293B' : '#F9FAFB',
      inputBorder: isDark ? '#334155' : '#E5E7EB',
      chipBg: isDark ? '#0F172A' : '#FFFFFF',
      chipBorder: isDark ? '#334155' : '#D1D5DB',
      chipText: isDark ? '#CBD5E1' : '#4B5563',
      primary: '#4F46E5',
      redText: isDark ? '#FCA5A5' : '#DC2626',
      redBg: isDark ? '#450A0A' : '#FEF2F2',
      redBorder: isDark ? '#7F1D1D' : '#FECACA',
      greenBg: isDark ? '#052E16' : '#DCFCE7',
      greenText: isDark ? '#86EFAC' : '#166534',
    }),
    [isDark],
  );

  const getUserEmail = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email || 'Guest');
    } catch (e) {
      setUserEmail('Guest');
    }
  };

  const fetchProducts = async () => {
    try {
      setError(null);
      const response = await axios.get('https://dummyjson.com/products?limit=30');
      const fetchedProducts = response.data.products || [];

      setOriginalProducts(fetchedProducts);
      setProducts(fetchedProducts);

      const uniqueCategories = [...new Set(fetchedProducts.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (_err) {
      setError('Connection Error: Unable to fetch products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getUserEmail();
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...originalProducts];
    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (trimmedQuery) {
      result = result.filter(product =>
        [product.title, product.brand, product.category].some(field =>
          (field || '').toLowerCase().includes(trimmedQuery),
        ),
      );
    }

    if (activeFilter !== 'all') {
      result = result.filter(p => p.category === activeFilter);
    }

    if (activeSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    }

    setProducts(result);
  }, [activeFilter, activeSort, originalProducts, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setActiveSort('none');
    setActiveFilter('all');
    setSearchQuery('');
    fetchProducts();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['userEmail', 'userToken', 'userName']);
    } catch (_e) {
      // noop
    } finally {
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  }, [navigation]);

  const pickRandomDeal = useCallback((items, previousId) => {
    if (!items || items.length === 0) {
      return null;
    }
    if (items.length === 1) {
      return items[0];
    }

    let next = items[Math.floor(Math.random() * items.length)];
    let safety = 0;
    while (next.id === previousId && safety < 6) {
      next = items[Math.floor(Math.random() * items.length)];
      safety += 1;
    }
    return next;
  }, []);

  useEffect(() => {
    if (originalProducts.length === 0) {
      return;
    }
    setDealProduct(current => pickRandomDeal(originalProducts, current?.id));
    setDealSecondsLeft(DEAL_DURATION_SECONDS);
  }, [originalProducts, pickRandomDeal]);

  useEffect(() => {
    if (originalProducts.length === 0) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setDealSecondsLeft(seconds => {
        if (seconds <= 1) {
          setDealProduct(current => pickRandomDeal(originalProducts, current?.id));
          return DEAL_DURATION_SECONDS;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [originalProducts, pickRandomDeal]);

  const formatDealTime = useCallback(seconds => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  }, []);

  const renderProduct = ({item}) => (
    <ProductCard
      item={item}
      isDark={isDark}
      onPress={() => navigation.navigate('ProductDetail', {productId: item.id})}
    />
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerRoot}>
        <View style={[styles.headerCard, {backgroundColor: palette.cardBg, borderColor: palette.cardBorder}]}>
          <View
            style={[
              styles.decorCircleA,
              {backgroundColor: isDark ? '#1E293B' : '#EEF2FF'},
            ]}
          />
          <View
            style={[
              styles.decorCircleB,
              {backgroundColor: isDark ? '#1E293B' : '#DBEAFE'},
            ]}
          />

          <View style={styles.headerTopRow}>
            <View style={styles.userRow}>
              <View style={[styles.initialBadge, {backgroundColor: isDark ? '#312E81' : '#E0E7FF'}]}>
                <Text style={[styles.initialText, {color: isDark ? '#C7D2FE' : '#4338CA'}]}>
                  {userInitial}
                </Text>
              </View>
              <View>
                <Text style={[styles.greetingText, {color: palette.textMuted}]}>{greeting}</Text>
                <Text style={[styles.displayNameText, {color: palette.textPrimary}]}>
                  {displayName}
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => searchInputRef.current?.focus()}
                style={[styles.iconBtn, {backgroundColor: isDark ? '#1E293B' : '#F3F4F6'}]}>
                <Ionicons name="search-outline" size={17} color={palette.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleTheme}
                style={[styles.iconBtn, {backgroundColor: isDark ? '#1E293B' : '#F3F4F6'}]}>
                <Ionicons
                  name={isDark ? 'sunny' : 'moon'}
                  size={17}
                  color={isDark ? '#FBBF24' : '#1F2937'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, {backgroundColor: palette.primary}]}>
                <View style={styles.cartDot} />
                <Ionicons name="cart-outline" size={17} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: palette.redBg,
                    borderColor: palette.redBorder,
                    borderWidth: 1,
                  },
                ]}>
                <Ionicons name="log-out-outline" size={17} color={palette.redText} />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.searchWrap,
              {backgroundColor: palette.inputBg, borderColor: palette.inputBorder},
            ]}>
            <Ionicons name="search-outline" size={17} color={palette.textSecondary} />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products, brands, categories"
              placeholderTextColor={palette.textMuted}
              style={[styles.searchInput, {color: palette.textPrimary}]}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={palette.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (dealProduct) {
              navigation.navigate('ProductDetail', {productId: dealProduct.id});
            }
          }}
          style={styles.heroCard}>
          <View style={styles.heroCircleA} />
          <View style={styles.heroCircleB} />

          {dealProduct?.thumbnail ? (
            <Image
              source={{uri: dealProduct.thumbnail}}
              style={styles.heroImage}
              resizeMode="contain"
              fadeDuration={0}
            />
          ) : null}

          <View style={styles.heroContent}>
            <View style={styles.heroPillRow}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>GREAT DEALS!</Text>
              </View>
              <View style={styles.heroTimerPill}>
                <Text style={styles.heroPillText}>{formatDealTime(dealSecondsLeft)}</Text>
              </View>
            </View>

            <Text numberOfLines={2} style={styles.heroTitle}>
              {dealProduct ? dealProduct.title : 'Finding a fresh deal...'}
            </Text>

            <View style={styles.heroPriceRow}>
              {dealProduct ? (
                <>
                  <Text style={styles.heroPrice}>${dealProduct.price}</Text>
                  {dealProduct.discountPercentage ? (
                    <>
                      <Text style={styles.heroOldPrice}>
                        $
                        {(
                          dealProduct.price /
                          (1 - dealProduct.discountPercentage / 100)
                        ).toFixed(2)}
                      </Text>
                      <View style={styles.heroDiscountBadge}>
                        <Text style={styles.heroDiscountText}>
                          -{Math.round(dealProduct.discountPercentage)}%
                        </Text>
                      </View>
                    </>
                  ) : null}
                </>
              ) : (
                <Text style={styles.heroLoadingPrice}>Loading deal price...</Text>
              )}
            </View>

            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>View Deal</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionRow}>
          <View>
            <Text style={[styles.sectionTitle, {color: palette.textPrimary}]}>Fresh Picks</Text>
            <Text style={[styles.sectionSubtitle, {color: palette.textSecondary}]}>
              {products.length} items ready to browse
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setSortModalVisible(true)}
            style={[
              styles.sortBtn,
              {backgroundColor: palette.cardBg, borderColor: palette.cardBorder},
            ]}>
            <Ionicons name="swap-vertical-outline" size={16} color={isDark ? '#A5B4FC' : '#4F46E5'} />
            <Text style={[styles.sortBtnText, {color: isDark ? '#A5B4FC' : '#4F46E5'}]}>
              Sort
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}>
          <TouchableOpacity
            onPress={() => setActiveFilter('all')}
            style={[
              styles.chip,
              activeFilter === 'all'
                ? styles.chipActive
                : {backgroundColor: palette.chipBg, borderColor: palette.chipBorder},
            ]}>
            <Text style={[styles.chipText, activeFilter === 'all' ? styles.chipTextActive : {color: palette.chipText}]}>
              All
            </Text>
          </TouchableOpacity>

          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveFilter(cat)}
              style={[
                styles.chip,
                activeFilter === cat
                  ? styles.chipActive
                  : {backgroundColor: palette.chipBg, borderColor: palette.chipBorder},
              ]}>
              <Text
                style={[
                  styles.chipText,
                  activeFilter === cat ? styles.chipTextActive : {color: palette.chipText},
                ]}>
                {cat.replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ),
    [
      activeFilter,
      categories,
      dealProduct,
      dealSecondsLeft,
      displayName,
      formatDealTime,
      greeting,
      handleLogout,
      isDark,
      navigation,
      palette,
      products.length,
      searchQuery,
      toggleTheme,
      userInitial,
    ],
  );

  if (loading) {
    return (
      <View style={[styles.stateScreen, {backgroundColor: palette.pageBg}]}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={[styles.stateText, {color: palette.textSecondary}]}>Updating catalogue...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.stateScreen, {backgroundColor: palette.pageBg}]}>
        <Ionicons name="cloud-offline-outline" size={80} color={isDark ? '#334155' : '#E5E7EB'} />
        <Text style={[styles.errorTitle, {color: palette.textPrimary}]}>{error}</Text>
        <TouchableOpacity onPress={fetchProducts} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeRoot, {backgroundColor: palette.pageBg}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={palette.pageBg} />

      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
            progressBackgroundColor={isDark ? '#0F172A' : '#FFFFFF'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIconWrap, {backgroundColor: isDark ? '#1E293B' : '#F3F4F6'}]}>
              <Ionicons name="search" size={40} color={palette.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, {color: palette.textPrimary}]}>No exact matches</Text>
            <Text style={[styles.emptyText, {color: palette.textSecondary}]}>
              Try changing or removing some of your filters.
            </Text>
            <TouchableOpacity
              onPress={() => setActiveFilter('all')}
              style={[styles.clearBtn, {backgroundColor: isDark ? '#334155' : '#111827'}]}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        visible={isSortModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSortModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {backgroundColor: palette.cardBg}]}>
            <View style={[styles.modalHandle, {backgroundColor: isDark ? '#334155' : '#E5E7EB'}]} />
            <Text style={[styles.modalTitle, {color: palette.textPrimary}]}>Sort Products By</Text>

            {[
              {id: 'none', label: 'Default (Recommended)', icon: 'star-outline'},
              {id: 'price-asc', label: 'Price: Low to High', icon: 'trending-up-outline'},
              {id: 'price-desc', label: 'Price: High to Low', icon: 'trending-down-outline'},
              {id: 'rating-desc', label: 'Top Rated', icon: 'heart-outline'},
            ].map(option => {
              const active = activeSort === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setActiveSort(option.id);
                    setSortModalVisible(false);
                  }}
                  style={[
                    styles.modalItem,
                    active
                      ? {backgroundColor: isDark ? '#312E81' : '#EEF2FF'}
                      : null,
                  ]}>
                  <View style={styles.modalItemLeft}>
                    <View
                      style={[
                        styles.modalIconBubble,
                        active
                          ? {backgroundColor: isDark ? '#4338CA' : '#C7D2FE'}
                          : {backgroundColor: isDark ? '#1E293B' : '#F3F4F6'},
                      ]}>
                      <Ionicons
                        name={option.icon}
                        size={16}
                        color={active ? '#4F46E5' : palette.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.modalItemText,
                        {color: active ? '#4F46E5' : palette.textPrimary},
                      ]}>
                      {option.label}
                    </Text>
                  </View>
                  {active ? <Ionicons name="checkmark-circle" size={22} color="#4F46E5" /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.filterModalCard, {backgroundColor: palette.cardBg}]}>
            <View style={[styles.modalHandle, {backgroundColor: isDark ? '#334155' : '#E5E7EB'}]} />
            <View style={styles.filterTitleRow}>
              <Text style={[styles.modalTitle, {color: palette.textPrimary}]}>Categories</Text>
              <TouchableOpacity
                onPress={() => {
                  setActiveFilter('all');
                  setFilterModalVisible(false);
                }}>
                <Text style={styles.filterResetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map(cat => {
                const active = activeFilter === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setActiveFilter(cat);
                      setFilterModalVisible(false);
                    }}
                    style={[
                      styles.filterItem,
                      {
                        backgroundColor: active
                          ? isDark
                            ? '#312E81'
                            : '#EEF2FF'
                          : palette.cardBg,
                        borderColor: active ? '#4F46E5' : palette.cardBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.filterItemText,
                        {color: active ? '#4F46E5' : palette.textPrimary},
                      ]}>
                      {cat.replace('-', ' ')}
                    </Text>
                    {active ? <Ionicons name="checkmark-circle" size={22} color="#4F46E5" /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingBottom: 110,
  },
  headerRoot: {
    paddingBottom: 14,
    paddingTop: 8,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  decorCircleA: {
    position: 'absolute',
    top: -40,
    right: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  decorCircleB: {
    position: 'absolute',
    bottom: -32,
    left: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initialText: {
    fontWeight: '800',
    fontSize: 16,
  },
  greetingText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  displayNameText: {
    marginTop: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  cartDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
    zIndex: 2,
  },
  searchWrap: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 18,
    borderRadius: 24,
    backgroundColor: '#312E81',
    padding: 24,
    overflow: 'hidden',
  },
  heroCircleA: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(99,102,241,0.22)',
  },
  heroCircleB: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroImage: {
    position: 'absolute',
    right: -22,
    bottom: -16,
    width: 128,
    height: 128,
    opacity: 0.9,
  },
  heroContent: {
    width: '68%',
  },
  heroPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroPill: {
    backgroundColor: 'rgba(99,102,241,0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  heroTimerPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroPillText: {
    color: '#E0E7FF',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.7,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 22,
    marginBottom: 8,
  },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  heroPrice: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 28,
  },
  heroOldPrice: {
    color: '#C7D2FE',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  heroDiscountBadge: {
    marginLeft: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(239,68,68,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroDiscountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  heroLoadingPrice: {
    color: '#C7D2FE',
    fontSize: 12,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  heroButtonText: {
    color: '#312E81',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionRow: {
    marginHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  sortBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortBtnText: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 12,
  },
  chipsContainer: {
    paddingLeft: 20,
    paddingRight: 40,
    paddingBottom: 6,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  stateScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 14,
    fontWeight: '500',
  },
  errorTitle: {
    marginTop: 14,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    borderRadius: 999,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyWrap: {
    marginTop: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontWeight: '800',
    fontSize: 20,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: 20,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 32,
  },
  filterModalCard: {
    height: '65%',
  },
  modalHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalItem: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  filterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterResetText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 13,
  },
  filterItem: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterItemText: {
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
