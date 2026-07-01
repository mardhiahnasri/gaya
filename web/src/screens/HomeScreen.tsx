import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OCCASIONS, CULTURAL_CONTEXTS } from '../constants/config';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedCulture, setSelectedCulture] = useState('Any');

  const handleGetOutfits = () => {
    if (selectedOccasion) {
      navigation.navigate('Suggestion', { occasion: selectedOccasion, culturalContext: selectedCulture });
      setShowOccasionModal(false);
      setSelectedOccasion(null);
      setSelectedCulture('Any');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#161329" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>CHER'S WARDROBE</Text>
          <Text style={styles.brand}>FALL FASHIONS</Text>
          <Text style={styles.tagline}>Browse pieces. Build looks. Dress me.</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Retro Closet Console</Text>
          <Text style={styles.heroSub}>Pick one action and continue.</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.cardEmoji}>👕</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Add Clothes</Text>
              <Text style={styles.cardSub}>Upload item photo</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => setShowOccasionModal(true)}
          >
            <Text style={styles.cardEmoji}>✨</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Get Outfit Ideas</Text>
              <Text style={styles.cardSub}>Get suggestions for any occasion</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TryOn')}>
            <Text style={styles.cardEmoji}>🪞</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Try On</Text>
              <Text style={styles.cardSub}>Preview outfit on your photo</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Colour')}>
            <Text style={styles.footerLink}>Check Colors</Text>
          </TouchableOpacity>
          <Text style={styles.footerLinkDivider}>•</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Wardrobe')}>
            <Text style={styles.footerLink}>My Wardrobe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Occasion Picker Modal */}
      <Modal visible={showOccasionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowOccasionModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Pick Occasion</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Cultural context */}
              <Text style={styles.modalSectionHeader}>Cultural Context</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {CULTURAL_CONTEXTS.map((ctx) => (
                  <TouchableOpacity
                    key={ctx.id}
                    style={[styles.modalChip, selectedCulture === ctx.label && styles.modalChipActive]}
                    onPress={() => setSelectedCulture(ctx.label)}
                  >
                    <Text style={[styles.modalChipText, selectedCulture === ctx.label && styles.modalChipTextActive]}>
                      {ctx.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Occasions */}
              <Text style={styles.modalSectionHeader}>Occasion</Text>
              <View style={styles.occasionGrid}>
                {OCCASIONS.map((occ) => (
                  <TouchableOpacity
                    key={occ.id}
                    style={[styles.modalOccasionCard, selectedOccasion === occ.label && styles.modalOccasionCardActive]}
                    onPress={() => setSelectedOccasion(occ.label)}
                  >
                    <Text style={styles.occasionEmoji}>{occ.emoji}</Text>
                    <Text style={styles.modalOccasionLabel} numberOfLines={2}>{occ.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, !selectedOccasion && styles.modalBtnDisabled]}
                disabled={!selectedOccasion}
                onPress={handleGetOutfits}
              >
                <Text style={styles.modalBtnText}>Get Outfits</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setShowOccasionModal(false)}
              >
                <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { paddingTop: 40, paddingBottom: 20, alignItems: 'center', backgroundColor: '#2d1b4e', borderBottomWidth: 3, borderBottomColor: '#2244d4' },
  kicker: {
    color: '#fbbf24',
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: '900',
  },
  brand: { fontSize: 32, fontWeight: '900', color: '#f8fafc', letterSpacing: 1, marginTop: 8, fontFamily: 'Georgia' },
  tagline: { fontSize: 11, color: '#b5c5ff', marginTop: 8, letterSpacing: 0.5, fontWeight: '600' },
  heroCard: {
    backgroundColor: '#2244d4',
    borderWidth: 3,
    borderColor: '#f8fafc',
    borderRadius: 0,
    padding: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  heroTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  heroSub: { color: '#e5e7eb', fontSize: 12, marginTop: 6, lineHeight: 18, fontWeight: '600' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, color: '#fbbf24', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontWeight: '900' },
  card: {
    backgroundColor: '#2a2247',
    borderRadius: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#2244d4',
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#f8fafc' },
  cardSub: { fontSize: 11, color: '#b5c5ff', marginTop: 3 },
  arrow: { fontSize: 18, color: '#fbbf24', fontWeight: '900' },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#2244d4',
  },
  footerLink: {
    color: '#fbbf24',
    fontSize: 11,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  footerLinkDivider: {
    color: '#2244d4',
    fontSize: 14,
    fontWeight: '900',
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderTopWidth: 3,
    borderTopColor: '#2244d4',
    borderRadius: 0,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#2d1b4e',
    borderBottomWidth: 2,
    borderBottomColor: '#2244d4',
  },
  modalClose: {
    fontSize: 24,
    color: '#fbbf24',
    fontWeight: '900',
    width: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f8fafc',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalSectionHeader: {
    fontSize: 11,
    color: '#fbbf24',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
    fontWeight: '900',
  },
  chipScroll: {
    marginBottom: 20,
  },
  modalChip: {
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#2244d4',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  modalChipActive: {
    backgroundColor: '#2244d4',
    borderColor: '#fbbf24',
  },
  modalChipText: {
    color: '#b5c5ff',
    fontSize: 11,
    fontWeight: '700',
  },
  modalChipTextActive: {
    color: '#f8fafc',
    fontWeight: '900',
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  modalOccasionCard: {
    width: '48%',
    backgroundColor: '#2a2247',
    borderWidth: 2,
    borderColor: '#2244d4',
    borderRadius: 0,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOccasionCardActive: {
    backgroundColor: '#2244d4',
    borderColor: '#fbbf24',
  },
  occasionEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  modalOccasionLabel: {
    fontSize: 11,
    color: '#b5c5ff',
    fontWeight: '700',
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 2,
    borderTopColor: '#2244d4',
  },
  modalBtn: {
    backgroundColor: '#2244d4',
    borderRadius: 0,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  modalBtnDisabled: {
    backgroundColor: '#1a1a2e',
    borderColor: '#2244d4',
    opacity: 0.5,
  },
  modalBtnText: {
    color: '#f8fafc',
    fontWeight: '900',
    fontSize: 13,
  },
  modalBtnSecondary: {
    backgroundColor: '#1a1a2e',
    borderColor: '#2244d4',
  },
  modalBtnTextSecondary: {
    color: '#b5c5ff',
    fontWeight: '700',
    fontSize: 13,
  },
});
