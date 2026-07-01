import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OCCASIONS, CULTURAL_CONTEXTS } from '../constants/config';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OccasionScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedCulture, setSelectedCulture] = useState('Any');

  const canProceed = !!selectedOccasion;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pick an Occasion</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cultural context */}
        <Text style={styles.sectionHeader}>Cultural Context</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CULTURAL_CONTEXTS.map((ctx) => (
            <TouchableOpacity
              key={ctx.id}
              style={[styles.chip, selectedCulture === ctx.label && styles.chipActive]}
              onPress={() => setSelectedCulture(ctx.label)}
            >
              <Text style={[styles.chipText, selectedCulture === ctx.label && styles.chipTextActive]}>
                {ctx.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Occasions */}
        <Text style={styles.sectionHeader}>Occasion</Text>
        <View style={styles.occasionGrid}>
          {OCCASIONS.map((occ) => (
            <TouchableOpacity
              key={occ.id}
              style={[styles.occasionCard, selectedOccasion === occ.label && styles.occasionCardActive]}
              onPress={() => setSelectedOccasion(occ.label)}
            >
              <Text style={styles.occasionEmoji}>{occ.emoji}</Text>
              <Text style={styles.occasionLabel} numberOfLines={2}>{occ.label}</Text>
              {occ.culture !== 'General' && (
                <Text style={styles.occasionCulture}>{occ.culture}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, !canProceed && styles.ctaBtnDisabled]}
          disabled={!canProceed}
          onPress={() =>
            navigation.navigate('Suggestion', {
              occasion: selectedOccasion!,
              culturalContext: selectedCulture,
            })
          }
        >
          <Text style={styles.ctaBtnText}>
            {canProceed ? 'Build Outfit Board' : 'Select an occasion'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#2244d4',
    backgroundColor: '#2d1b4e',
  },
  backBtn: { width: 50 },
  backText: { color: '#fbbf24', fontSize: 18, fontWeight: '900' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '900',
    color: '#f8fafc',
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  sectionHeader: {
    fontSize: 10,
    color: '#fbbf24',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
    marginTop: 22,
    fontWeight: '900',
  },
  chipScroll: { marginBottom: 12 },
  chip: {
    backgroundColor: '#2a2247',
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#2244d4',
  },
  chipActive: { backgroundColor: '#2244d4', borderColor: '#fbbf24' },
  chipText: { color: '#b5c5ff', fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: '#f8fafc', fontWeight: '900' },
  occasionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  occasionCard: {
    backgroundColor: '#2a2247',
    borderRadius: 0,
    padding: 14,
    width: '31%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2244d4',
  },
  occasionCardActive: { borderColor: '#fbbf24', backgroundColor: '#2244d4' },
  occasionEmoji: { fontSize: 32, marginBottom: 8 },
  occasionLabel: { fontSize: 11, color: '#f3f4f6', textAlign: 'center', lineHeight: 14, fontWeight: '700' },
  occasionCulture: { fontSize: 9, color: '#fbbf24', marginTop: 4, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#2d1b4e',
    borderTopWidth: 3,
    borderTopColor: '#2244d4',
  },
  ctaBtn: {
    backgroundColor: '#2244d4',
    borderRadius: 0,
    padding: 16,
    alignItems: 'center',
    borderWidth: 0,
  },
  ctaBtnDisabled: { backgroundColor: '#6b5b50' },
  ctaBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 13 },
});
