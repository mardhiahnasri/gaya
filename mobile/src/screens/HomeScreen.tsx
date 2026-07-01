import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1321" />
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>DIGITAL CLOSET</Text>
          <Text style={styles.brand}>GAYA ATELIER</Text>
          <Text style={styles.tagline}>Plan the full look before you step outside.</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Style Board</Text>
          <Text style={styles.heroSub}>Scan pieces, mix outfits, and prep your next statement fit.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Here</Text>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.cardEmoji}>CAM</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Capture Closet Piece</Text>
              <Text style={styles.cardSub}>Photograph and classify a garment in seconds</Text>
            </View>
            <Text style={styles.arrow}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Suggestion', { occasion: '', culturalContext: 'Any' })}
          >
            <Text style={styles.cardEmoji}>AI</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Generate Full Look</Text>
              <Text style={styles.cardSub}>Build complete outfits from your wardrobe</Text>
            </View>
            <Text style={styles.arrow}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Colour')}>
            <Text style={styles.cardEmoji}>CLR</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Palette Studio</Text>
              <Text style={styles.cardSub}>Test harmony, contrast, and accent options</Text>
            </View>
            <Text style={styles.arrow}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TryOn')}>
            <Text style={styles.cardEmoji}>VTO</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Virtual Try-On</Text>
              <Text style={styles.cardSub}>See full-body outfit preview before wearing</Text>
            </View>
            <Text style={styles.arrow}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Season Radar</Text>
          <View style={styles.occasionRow}>
            {[
              { emoji: '🌙', label: 'Hari Raya' },
              { emoji: '🧧', label: 'CNY' },
              { emoji: '🪔', label: 'Deepavali' },
              { emoji: '💍', label: 'Wedding' },
            ].map(({ emoji, label }) => (
              <View key={label} style={styles.occasionChip}>
                <Text style={styles.occasionEmoji}>{emoji}</Text>
                <Text style={styles.occasionLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1321' },
  orbOne: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#ca8a04',
    opacity: 0.2,
    top: -80,
    left: -60,
  },
  orbTwo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#60a5fa',
    opacity: 0.18,
    right: -80,
    bottom: 20,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 46 },
  header: { paddingTop: 62, paddingBottom: 20, alignItems: 'center' },
  kicker: { fontSize: 10, color: '#fbbf24', letterSpacing: 3, marginBottom: 8 },
  brand: { fontSize: 38, fontWeight: '900', color: '#f8fafc', letterSpacing: 2, fontFamily: 'Georgia' },
  tagline: { fontSize: 13, color: '#bfdbfe', marginTop: 6, letterSpacing: 0.4 },
  heroCard: {
    backgroundColor: '#111b31',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 18,
    marginBottom: 24,
  },
  heroTitle: { color: '#f8fafc', fontSize: 20, fontFamily: 'Georgia', fontWeight: '700' },
  heroSub: { color: '#cbd5e1', fontSize: 13, lineHeight: 19, marginTop: 6 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 11, color: '#fbbf24', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 },
  card: {
    backgroundColor: '#111b31',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2b3a55',
  },
  cardEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    overflow: 'hidden',
    marginRight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    paddingTop: 14,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  cardSub: { fontSize: 12, color: '#bfdbfe', marginTop: 2 },
  arrow: { fontSize: 24, color: '#fbbf24', fontWeight: '700' },
  occasionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  occasionChip: {
    backgroundColor: '#111b31',
    borderRadius: 12,
    alignItems: 'center',
    padding: 12,
    width: '23%',
    borderWidth: 1,
    borderColor: '#2b3a55',
  },
  occasionEmoji: { fontSize: 22 },
  occasionLabel: { fontSize: 10, color: '#e2e8f0', marginTop: 4, textAlign: 'center' },
});
