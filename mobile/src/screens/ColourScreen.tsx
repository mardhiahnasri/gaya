import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { analyseColours } from '../services/api';
import type { ColourAnalysis } from '../services/api';

const PRESET_PALETTES = [
  { name: 'Hari Raya', colours: ['#006400', '#FFD700', '#FFFFFF'] },
  { name: 'Chinese New Year', colours: ['#CC0000', '#FFD700', '#FF6600'] },
  { name: 'Deepavali', colours: ['#800080', '#FF8C00', '#FFD700'] },
  { name: 'Royal Blue', colours: ['#003087', '#C0C0C0', '#FFFFFF'] },
  { name: 'Earth Tones', colours: ['#8B4513', '#D2B48C', '#F5F5DC'] },
];

export function ColourScreen() {
  const navigation = useNavigation();
  const [colours, setColours] = useState<string[]>(['#E94560', '#1A1A2E']);
  const [inputValue, setInputValue] = useState('');
  const [analysis, setAnalysis] = useState<ColourAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const addColour = () => {
    const hex = inputValue.trim().toUpperCase();
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      Alert.alert('Invalid Hex', 'Enter a valid hex colour e.g. #FF5733');
      return;
    }
    if (colours.includes(hex)) return;
    setColours((prev) => [...prev, hex]);
    setInputValue('');
    setAnalysis(null);
  };

  const removeColour = (hex: string) => {
    setColours((prev) => prev.filter((c) => c !== hex));
    setAnalysis(null);
  };

  const handleAnalyse = async () => {
    if (colours.length < 2) {
      Alert.alert('Add more colours', 'Add at least 2 colours to analyse.');
      return;
    }
    setLoading(true);
    try {
      const result = await analyseColours(colours);
      setAnalysis(result);
    } catch {
      Alert.alert('Error', 'Could not analyse colours. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (palette: typeof PRESET_PALETTES[0]) => {
    setColours(palette.colours);
    setAnalysis(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Colour Check</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Current palette */}
        <View style={styles.palettePreview}>
          {colours.map((hex) => (
            <TouchableOpacity key={hex} onPress={() => removeColour(hex)} style={styles.swatchWrap}>
              <View style={[styles.swatch, { backgroundColor: hex }]} />
              <Text style={styles.swatchHex}>{hex}</Text>
              <Text style={styles.swatchRemove}>✕</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add colour input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="#FF5733"
            placeholderTextColor="#555"
            autoCapitalize="characters"
            maxLength={7}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addColour}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Preset palettes */}
        <Text style={styles.sectionHeader}>Cultural Presets</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {PRESET_PALETTES.map((palette) => (
            <TouchableOpacity key={palette.name} style={styles.presetCard} onPress={() => applyPreset(palette)}>
              <View style={styles.presetSwatches}>
                {palette.colours.map((hex) => (
                  <View key={hex} style={[styles.presetSwatch, { backgroundColor: hex }]} />
                ))}
              </View>
              <Text style={styles.presetName}>{palette.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Analyse button */}
        <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyse} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeBtnText}>✦ Check Compatibility</Text>
          )}
        </TouchableOpacity>

        {/* Analysis result */}
        {analysis && (
          <View style={styles.result}>
            <View style={styles.resultHeader}>
              <Text style={styles.harmonyType}>{analysis.harmonyType}</Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{analysis.score}/10</Text>
              </View>
            </View>

            <Text style={styles.verdict}>{analysis.verdict}</Text>

            <Text style={styles.sectionHeader}>Cultural Notes</Text>
            <Text style={styles.bodyText}>{analysis.culturalNotes}</Text>

            {analysis.suggestedAccents.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Suggested Accents</Text>
                <View style={styles.accentRow}>
                  {analysis.suggestedAccents.map((hex) => (
                    <View key={hex} style={styles.accentChip}>
                      <View style={[styles.accentSwatch, { backgroundColor: hex }]} />
                      <Text style={styles.accentHex}>{hex}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e17' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: { width: 60 },
  backText: { color: '#e94560', fontSize: 18 },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 60 },
  palettePreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  swatchWrap: { alignItems: 'center', gap: 4 },
  swatch: { width: 56, height: 56, borderRadius: 12, borderWidth: 2, borderColor: '#fff2' },
  swatchHex: { fontSize: 9, color: '#aaa' },
  swatchRemove: { fontSize: 10, color: '#e94560' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: {
    flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, color: '#fff',
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    borderWidth: 1, borderColor: '#16213e',
  },
  addBtn: { backgroundColor: '#e94560', borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  sectionHeader: { fontSize: 10, color: '#e94560', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  presetScroll: { marginBottom: 20 },
  presetCard: {
    backgroundColor: '#1a1a2e', borderRadius: 14, padding: 10,
    marginRight: 10, alignItems: 'center', borderWidth: 1, borderColor: '#16213e', width: 100,
  },
  presetSwatches: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  presetSwatch: { width: 22, height: 22, borderRadius: 11 },
  presetName: { fontSize: 10, color: '#ccc', textAlign: 'center' },
  analyzeBtn: { backgroundColor: '#e94560', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20 },
  analyzeBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  result: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#16213e' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  harmonyType: { fontSize: 20, fontWeight: '800', color: '#fff' },
  scoreBadge: { backgroundColor: '#e94560', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  scoreText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  verdict: { color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  bodyText: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  accentRow: { flexDirection: 'row', gap: 12 },
  accentChip: { alignItems: 'center', gap: 4 },
  accentSwatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff2' },
  accentHex: { fontSize: 10, color: '#aaa' },
});
