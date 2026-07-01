import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { getWardrobe, getOutfitSuggestions } from '../services/api';
import type { OutfitSuggestion, WardrobeItem } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Suggestion'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SuggestionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { occasion, culturalContext } = route.params;

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wardrobeEmpty, setWardrobeEmpty] = useState(false);

  useEffect(() => {
    if (!occasion) {
      setLoading(false);
      setError('No occasion selected. Go to Occasions tab first.');
      return;
    }
    (async () => {
      try {
        const items = await getWardrobe();
        setWardrobe(items);
        if (items.length === 0) {
          setWardrobeEmpty(true);
          setLoading(false);
          return;
        }
        const results = await getOutfitSuggestions(items, occasion, culturalContext);
        setSuggestions(results);
      } catch {
        setError('Could not generate suggestions. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    })();
  }, [occasion, culturalContext]);

  const handleGenerateWithSample = async () => {
    // Generate suggestions with sample wardrobe data for demo
    const sampleWardrobe = [
      {
        id: 'sample-1',
        type: 'Black Blazer',
        dominantColours: ['#000000'],
        colourNames: ['Black'],
        fabric: 'Wool',
        style: 'Formal',
        culturalOrigin: 'Western',
        suitableOccasions: ['Work', 'Formal'],
        description: 'Classic black blazer',
        imageUri: null,
        addedAt: new Date().toISOString(),
      },
      {
        id: 'sample-2',
        type: 'White T-Shirt',
        dominantColours: ['#FFFFFF'],
        colourNames: ['White'],
        fabric: 'Cotton',
        style: 'Casual',
        culturalOrigin: 'Western',
        suitableOccasions: ['Casual', 'Work'],
        description: 'Classic white tee',
        imageUri: null,
        addedAt: new Date().toISOString(),
      },
      {
        id: 'sample-3',
        type: 'Blue Jeans',
        dominantColours: ['#1F3A8A'],
        colourNames: ['Navy Blue'],
        fabric: 'Denim',
        style: 'Casual',
        culturalOrigin: 'Western',
        suitableOccasions: ['Casual', 'Weekend'],
        description: 'Classic blue denim jeans',
        imageUri: null,
        addedAt: new Date().toISOString(),
      },
    ];
    
    setLoading(true);
    try {
      const results = await getOutfitSuggestions(sampleWardrobe, occasion, culturalContext);
      setSuggestions(results);
      setWardrobeEmpty(false);
    } catch {
      Alert.alert('Error', 'Could not generate suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {occasion || 'Outfit Ideas'}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {culturalContext && culturalContext !== 'Any' && (
        <View style={styles.contextBadge}>
          <Text style={styles.contextText}>{culturalContext}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#fbbf24" size="large" />
          <Text style={styles.loadingText}>Gemini AI is styling your outfit…</Text>
        </View>
      ) : wardrobeEmpty ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>👗</Text>
          <Text style={styles.emptyTitle}>No items in wardrobe yet</Text>
          <Text style={styles.emptyText}>Add some clothes to get personalized outfit suggestions, or try demo outfits.</Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Camera')}>
              <Text style={styles.actionBtnText}>+ Add Clothing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handleGenerateWithSample}>
              <Text style={styles.actionBtnTextSecondary}>✨ Try Sample Outfits</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>{suggestions.length} outfit{suggestions.length !== 1 ? 's' : ''} suggested</Text>
          {suggestions.map((sug: OutfitSuggestion, i: number) => (
            <OutfitCard key={`outfit-${i}`} suggestion={sug} wardrobe={wardrobe} index={i + 1} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function OutfitCard({
  suggestion,
  wardrobe,
  index,
}: {
  suggestion: OutfitSuggestion;
  wardrobe: WardrobeItem[];
  index: number;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index}</Text>
        </View>
        <Text style={styles.outfitName}>{suggestion.outfitName}</Text>
      </View>

      {/* Colour palette */}
      <View style={styles.paletteRow}>
        {suggestion.colourPalette.map((hex) => (
          <View key={hex} style={[styles.paletteSwatch, { backgroundColor: hex }]} />
        ))}
      </View>

      {/* Items used */}
      <Text style={styles.cardLabel}>Items used</Text>
      {suggestion.items.map((itemIdx) => {
        const item = wardrobe[itemIdx - 1];
        return item ? (
          <Text key={itemIdx} style={styles.itemText}>
            • {item.type} ({item.colourNames?.join(', ')})
          </Text>
        ) : null;
      })}

      {/* Colour harmony */}
      <Text style={styles.cardLabel}>Colour harmony</Text>
      <Text style={styles.bodyText}>{suggestion.colourHarmony}</Text>

      {/* Why it works */}
      <Text style={styles.cardLabel}>Why it works</Text>
      <Text style={styles.bodyText}>{suggestion.whyItWorks}</Text>

      {/* Tip */}
      <View style={styles.tipBox}>
        <Text style={styles.tipLabel}>💡 Styling tip</Text>
        <Text style={styles.tipText}>{suggestion.tips}</Text>
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
    color: '#f8fafc',
    fontSize: 19,
    fontWeight: '900',
  },
  contextBadge: {
    alignSelf: 'center',
    backgroundColor: '#2244d4',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  contextText: { color: '#f8fafc', fontSize: 11, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: '#b5c5ff', marginTop: 16, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: '#b5c5ff', textAlign: 'center', lineHeight: 22, fontWeight: '600' },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#f8fafc', marginBottom: 8, textAlign: 'center' },
  emptyText: { color: '#b5c5ff', textAlign: 'center', lineHeight: 20, fontWeight: '600', marginBottom: 24, fontSize: 12 },
  emptyActions: { width: '100%', gap: 10 },
  actionBtn: {
    backgroundColor: '#2244d4',
    borderRadius: 0,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  actionBtnSecondary: {
    backgroundColor: '#1a1a2e',
    borderColor: '#2244d4',
  },
  actionBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 13 },
  actionBtnTextSecondary: { color: '#b5c5ff', fontWeight: '700', fontSize: 13 },
  scroll: { paddingHorizontal: 16, paddingBottom: 60 },
  count: { color: '#fbbf24', fontSize: 12, marginBottom: 16, textAlign: 'center', fontWeight: '700' },
  card: {
    backgroundColor: '#2a2247',
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2244d4',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: '#2244d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: { color: '#f8fafc', fontWeight: '900', fontSize: 13 },
  outfitName: { fontSize: 16, fontWeight: '900', color: '#f8fafc', flex: 1 },
  paletteRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  paletteSwatch: { flex: 1, height: 32, borderRadius: 0, borderWidth: 2, borderColor: '#2244d4' },
  cardLabel: { fontSize: 10, color: '#fbbf24', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 12, marginBottom: 8, fontWeight: '900' },
  itemText: { color: '#e5e7eb', fontSize: 11, lineHeight: 18, fontWeight: '600' },
  bodyText: { color: '#e5e7eb', fontSize: 11, lineHeight: 18, fontWeight: '600' },
  tipBox: { backgroundColor: '#2244d4', borderRadius: 0, padding: 14, marginTop: 12, borderWidth: 2, borderColor: '#fbbf24' },
  tipLabel: { color: '#f8fafc', fontWeight: '900', fontSize: 12, marginBottom: 6 },
  tipText: { color: '#f8fafc', fontSize: 11, lineHeight: 18, fontWeight: '600' },
});
