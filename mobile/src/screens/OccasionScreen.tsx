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
      <View style={styles.bgCircle} />
      <View style={styles.topBar}>
        <Text style={styles.kicker}>STYLE BRIEF</Text>
        <Text style={styles.title}>Occasion Planner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
            {canProceed ? 'Build My Outfit Board' : 'Select an occasion'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  bgCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#f59e0b',
    opacity: 0.16,
    top: -100,
    left: -60,
  },
  topBar: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  kicker: { color: '#f59e0b', fontSize: 10, letterSpacing: 3, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: '#f8fafc', fontFamily: 'Georgia' },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  sectionHeader: {
    fontSize: 11, color: '#fbbf24', letterSpacing: 3, textTransform: 'uppercase',
    marginBottom: 12, marginTop: 16,
  },
  chipScroll: { marginBottom: 8 },
  chip: {
    backgroundColor: '#111b31', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    marginRight: 10, borderWidth: 1, borderColor: '#2b3a55',
  },
  chipActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  chipText: { color: '#cbd5e1', fontSize: 13 },
  chipTextActive: { color: '#0b1220', fontWeight: '800' },
  occasionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  occasionCard: {
    backgroundColor: '#111b31', borderRadius: 15, padding: 14, width: '30%',
    alignItems: 'center', borderWidth: 1, borderColor: '#2b3a55',
  },
  occasionCardActive: { borderColor: '#f59e0b', backgroundColor: '#f59e0b22' },
  occasionEmoji: { fontSize: 24, marginBottom: 6 },
  occasionLabel: { fontSize: 11, color: '#e2e8f0', textAlign: 'center', lineHeight: 14 },
  occasionCulture: { fontSize: 9, color: '#fbbf24', marginTop: 4 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: '#0b1220',
    borderTopWidth: 1, borderTopColor: '#2b3a55',
  },
  ctaBtn: { backgroundColor: '#f59e0b', borderRadius: 14, padding: 16, alignItems: 'center' },
  ctaBtnDisabled: { backgroundColor: '#444' },
  ctaBtnText: { color: '#0b1220', fontWeight: '800', fontSize: 15 },
});
