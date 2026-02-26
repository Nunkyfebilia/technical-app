import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {ProductCard} from './ProductCard';
import {useAppTheme} from './theme/ThemeContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function ProductDetailScreen({route, navigation}) {
  const {isDark} = useAppTheme();
  const insets = useSafeAreaInsets();
  const productId = route?.params?.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const palette = useMemo(
    () => ({
      pageBg: isDark ? '#020617' : '#F8FAFC',
      cardBg: isDark ? '#0F172A' : '#FFFFFF',
      cardBorder: isDark ? '#1E293B' : '#E5E7EB',
      textPrimary: isDark ? '#E2E8F0' : '#111827',
      textSecondary: isDark ? '#94A3B8' : '#6B7280',
      textMuted: isDark ? '#64748B' : '#9CA3AF',
      primary: '#4F46E5',
    }),
    [isDark],
  );

  const fetchDetail = useCallback(async () => {
    if (!productId) {
      setError('Product ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`https://dummyjson.com/products/${productId}`);
      setProduct(res.data);
    } catch (_err) {
      setError('Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setModalVisible(false);
    try {
      await axios.post('https://dummyjson.com/carts/add', {
        userId: 1,
        products: [{id: productId, quantity: 1}],
      });
      Alert.alert('Success', 'Your order has been placed.');
      navigation.goBack();
    } catch (_err) {
      Alert.alert('Checkout failed', 'Check your connection and try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.stateRoot, {backgroundColor: palette.pageBg}]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.stateRoot, {backgroundColor: palette.pageBg}]}>
        <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
        <Text style={styles.errorTitle}>{error || 'Product not found'}</Text>
        <TouchableOpacity onPress={fetchDetail} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeRoot, {backgroundColor: palette.pageBg}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.flex, {backgroundColor: palette.pageBg}]}>
        <ScrollView style={styles.flex} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.productCardWrap}>
            <ProductCard item={product} isDetail isDark={isDark} />
          </View>

          <View style={[styles.mainCard, {backgroundColor: palette.cardBg}]}>
            <Text style={[styles.mainTitle, {color: palette.textPrimary}]}>About this product</Text>
            <Text style={[styles.description, {color: palette.textSecondary}]}>
              {product.description}
            </Text>

            <View style={styles.infoRow}>
              <View
                style={[
                  styles.infoBox,
                  {backgroundColor: isDark ? '#052E16' : '#DCFCE7', borderColor: isDark ? '#14532D' : '#BBF7D0'},
                ]}>
                <View style={[styles.infoIconBubble, {backgroundColor: isDark ? '#14532D' : '#BBF7D0'}]}>
                  <Ionicons name="cube-outline" size={20} color="#15803D" />
                </View>
                <View>
                  <Text style={[styles.infoLabel, {color: isDark ? '#86EFAC' : '#15803D'}]}>Stock</Text>
                  <Text style={[styles.infoValue, {color: isDark ? '#BBF7D0' : '#166534'}]}>
                    {product.stock} Left
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.infoBox,
                  {backgroundColor: isDark ? '#312E81' : '#EEF2FF', borderColor: isDark ? '#4338CA' : '#C7D2FE'},
                ]}>
                <View style={[styles.infoIconBubble, {backgroundColor: isDark ? '#4338CA' : '#C7D2FE'}]}>
                  <Ionicons name="pricetag-outline" size={20} color="#4338CA" />
                </View>
                <View style={styles.flexShrink}>
                  <Text style={[styles.infoLabel, {color: isDark ? '#A5B4FC' : '#4F46E5'}]}>Brand</Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.infoValue, {color: isDark ? '#C7D2FE' : '#3730A3'}]}>
                    {product.brand || 'Generic'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.reviewSection}>
              <View style={styles.reviewHeaderRow}>
                <Text style={[styles.reviewTitle, {color: palette.textPrimary}]}>Customer Reviews</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#D97706" />
                  <Text style={styles.ratingBadgeText}>{product.rating}</Text>
                </View>
              </View>

              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review, index) => (
                  <View
                    key={`${review.reviewerName}-${index}`}
                    style={[
                      styles.reviewCard,
                      {backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: palette.cardBorder},
                    ]}>
                    <View style={styles.reviewTopRow}>
                      <View style={styles.reviewUserRow}>
                        <View
                          style={[
                            styles.avatar,
                            {backgroundColor: isDark ? '#312E81' : '#E0E7FF'},
                          ]}>
                          <Text style={[styles.avatarText, {color: isDark ? '#C7D2FE' : '#4338CA'}]}>
                            {(review.reviewerName || 'U').charAt(0)}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.reviewerName, {color: palette.textPrimary}]}>
                            {review.reviewerName}
                          </Text>
                          <Text style={[styles.reviewDate, {color: palette.textMuted}]}>
                            {new Date(review.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.starsRow}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < Math.round(review.rating) ? 'star' : 'star-outline'}
                            size={14}
                            color="#FBBF24"
                          />
                        ))}
                      </View>
                    </View>

                    <Text style={[styles.reviewComment, {color: palette.textSecondary}]}>
                      "{review.comment}"
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noReviewsText, {color: palette.textMuted}]}>No reviews yet.</Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: palette.cardBg,
              borderTopColor: palette.cardBorder,
              paddingBottom: 12 + insets.bottom,
            },
          ]}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            disabled={checkoutLoading}
            style={styles.checkoutBtn}>
            {checkoutLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="bag-check-outline" size={22} color="#FFFFFF" />
                <Text style={styles.checkoutBtnText}>CHECKOUT NOW</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {backgroundColor: palette.cardBg}]}>
            <View style={styles.modalIconWrap}>
              <View style={[styles.modalIconBubble, {backgroundColor: isDark ? '#312E81' : '#EEF2FF'}]}>
                <Ionicons name="cart" size={32} color="#4F46E5" />
              </View>
            </View>

            <Text style={[styles.modalTitle, {color: palette.textPrimary}]}>Confirm Purchase</Text>
            <Text style={[styles.modalText, {color: palette.textSecondary}]}>
              Are you sure you want to checkout with this item? Your default payment
              method will be used.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.modalCancelBtn,
                  {backgroundColor: isDark ? '#1E293B' : '#F3F4F6'},
                ]}>
                <Text style={[styles.modalCancelText, {color: palette.textSecondary}]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCheckout} style={styles.modalConfirmBtn}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {flex: 1},
  flex: {flex: 1},
  scrollContent: {paddingBottom: 12},
  productCardWrap: {padding: 16},
  mainCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    padding: 24,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  infoValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '800',
  },
  flexShrink: {
    flex: 1,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadgeText: {
    marginLeft: 4,
    color: '#B45309',
    fontWeight: '700',
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  reviewDate: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 21,
  },
  noReviewsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  checkoutBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  checkoutBtnText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    width: '85%',
    borderRadius: 28,
    padding: 28,
  },
  modalIconWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  modalIconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelText: {
    fontWeight: '700',
    fontSize: 16,
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#4F46E5',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  stateRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    marginTop: 12,
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
