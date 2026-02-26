import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const ProductCard = ({item, onPress, isDetail = false, isDark = false}) => {
  if (!item) {
    return null;
  }

  const hasDiscount = item.discountPercentage && item.discountPercentage > 15;
  const originalPrice = hasDiscount
    ? (item.price / (1 - item.discountPercentage / 100)).toFixed(2)
    : item.price;

  const cardStyle = [
    styles.cardBase,
    isDetail ? styles.cardDetail : styles.cardGrid,
    {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderColor: isDark ? '#1E293B' : '#E5E7EB',
    },
  ];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={cardStyle}>
      <View style={styles.imageWrap}>
        <Image
          source={{uri: item.thumbnail}}
          style={[
            styles.image,
            isDetail ? styles.imageDetail : styles.imageGrid,
            {backgroundColor: isDark ? '#1E293B' : '#F9FAFB'},
          ]}
          resizeMode="cover"
        />

        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{Math.round(item.discountPercentage)}%</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.favoriteBadge,
            {backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)'},
          ]}>
          <Ionicons name="heart-outline" size={16} color={isDark ? '#A5B4FC' : '#4F46E5'} />
        </View>
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[styles.title, {color: isDark ? '#E2E8F0' : '#1F2937'}]}>
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>${item.price}</Text>
            {hasDiscount ? (
              <Text style={[styles.oldPrice, {color: isDark ? '#64748B' : '#9CA3AF'}]}>
                ${originalPrice}
              </Text>
            ) : null}
          </View>

          <View style={styles.ratingWrap}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={[styles.ratingText, {color: isDark ? '#94A3B8' : '#6B7280'}]}>
              {item.rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  cardGrid: {
    flex: 1,
    margin: 6,
  },
  cardDetail: {
    width: '100%',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  imageGrid: {
    height: 176,
  },
  imageDetail: {
    height: 256,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 999,
    padding: 6,
    zIndex: 2,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  price: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },
  oldPrice: {
    marginLeft: 6,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  ratingWrap: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});
