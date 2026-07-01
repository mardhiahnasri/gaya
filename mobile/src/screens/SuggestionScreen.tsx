import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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
          setError('Your wardrobe is empty. Add some clothes first!');
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

  return (
    <View style={styles.container}>
      <View style={styles.bgHalo} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {occasion || 'Outfit Ideas'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {culturalContext && culturalContext !== 'Any' && (
        <View style={styles.contextBadge}>
          <Text style={styles.contextText}>{culturalContext} context</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#f59e0b" size="large" />
          <Text style={styles.loadingText}>Composing runway-ready combinations...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>{suggestions.length} look{suggestions.length !== 1 ? 's' : ''} generated</Text>
          {suggestions.map((sug, i) => (
            <OutfitCard key={i} suggestion={sug} wardrobe={wardrobe} index={i + 1} />
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
        <Text style={styles.tipLabel}>Styling Tip</Text>
        <Text style={styles.tipText}>{suggestion.tips}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  bgHalo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#0ea5e9',
    opacity: 0.14,
    right: -90,
    top: -70,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: { width: 60 },
  backText: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },
  title: { flex: 1, textAlign: 'center', color: '#f8fafc', fontSize: 18, fontWeight: '800', fontFamily: 'Georgia' },
  contextBadge: {
    alignSelf: 'center', backgroundColor: '#f59e0b22', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4, marginBottom: 8,
  },
  contextText: { color: '#fbbf24', fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: '#cbd5e1', marginTop: 16, textAlign: 'center', fontSize: 13 },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: '#cbd5e1', textAlign: 'center', lineHeight: 22 },
  scroll: { padding: 20, paddingBottom: 60 },
  count: { color: '#93c5fd', fontSize: 12, marginBottom: 16, textAlign: 'center' },
  card: {
    backgroundColor: '#111b31', borderRadius: 20, padding: 20,
    marginBottom: 20, borderWidth: 1, borderColor: '#2b3a55',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  indexBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  indexText: { color: '#0b1220', fontWeight: '800', fontSize: 13 },
  outfitName: { fontSize: 19, fontWeight: '800', color: '#f8fafc', flex: 1, fontFamily: 'Georgia' },
  paletteRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  paletteSwatch: { flex: 1, height: 28, borderRadius: 6, borderWidth: 1, borderColor: '#fff1' },
  cardLabel: { fontSize: 10, color: '#fbbf24', letterSpacing: 2, textTransform: 'uppercase', marginTop: 14, marginBottom: 6 },
  itemText: { color: '#e2e8f0', fontSize: 13, lineHeight: 20 },
  bodyText: { color: '#cbd5e1', fontSize: 13, lineHeight: 20 },
  tipBox: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, marginTop: 14 },
  tipLabel: { color: '#f8fafc', fontWeight: '700', fontSize: 13, marginBottom: 4, letterSpacing: 1 },
  tipText: { color: '#cbd5e1', fontSize: 13, lineHeight: 20 },
});
