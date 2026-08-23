import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
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
  const [colours, setColours] = useState<string[]>(['#C7A88C', '#8E7A69']);
  const [inputValue, setInputValue] = useState('');
  const [analysis, setAnalysis] = useState<ColourAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const colorInputRef = useRef<any>(null);

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

  const addColourFromPicker = (hex: string) => {
    const upper = hex.toUpperCase();
    if (!colours.includes(upper)) {
      setColours((prev) => [...prev, upper]);
      setAnalysis(null);
    }
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
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.pickerBtn} onPress={() => colorInputRef.current?.click()}>
              <Text style={styles.pickerBtnText}>🎨</Text>
            </TouchableOpacity>
          )}
        </View>
        {Platform.OS === 'web' && (
          // @ts-ignore — HTML input rendered via RN Web
          <input
            ref={colorInputRef}
            type="color"
            style={{ display: 'none' }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => addColourFromPicker(e.target.value)}
          />
        )}

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
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 3, borderBottomColor: '#2244d4', backgroundColor: '#2d1b4e',
  },
  backBtn: { width: 60 },
  backText: { color: '#fbbf24', fontSize: 18, fontWeight: '900' },
  title: { flex: 1, textAlign: 'center', color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  scroll: { padding: 16, paddingBottom: 60 },
  palettePreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  swatchWrap: { alignItems: 'center', gap: 4 },
  swatch: { width: 56, height: 56, borderRadius: 0, borderWidth: 2, borderColor: '#2244d4', backgroundColor: '#2a2247' },
  swatchHex: { fontSize: 9, color: '#b5c5ff', fontWeight: '600' },
  swatchRemove: { fontSize: 10, color: '#fbbf24', fontWeight: '900' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: {
    flex: 1, backgroundColor: '#2a2247', borderRadius: 0, color: '#f8fafc',
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 14,
    borderWidth: 2, borderColor: '#2244d4',
  },
  addBtn: { backgroundColor: '#2244d4', borderRadius: 0, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 2, borderColor: '#fbbf24' },
  addBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 13 },
  pickerBtn: { backgroundColor: '#2d1b4e', borderRadius: 0, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 2, borderColor: '#2244d4' },
  pickerBtnText: { fontSize: 18 },
  sectionHeader: { fontSize: 10, color: '#fbbf24', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 4, fontWeight: '900' },
  presetScroll: { marginBottom: 20 },
  presetCard: {
    backgroundColor: '#2a2247', borderRadius: 0, padding: 10,
    marginRight: 10, alignItems: 'center', borderWidth: 2, borderColor: '#2244d4', width: 100,
  },
  presetSwatches: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  presetSwatch: { width: 22, height: 22, borderRadius: 0, borderWidth: 1, borderColor: '#2244d4' },
  presetName: { fontSize: 10, color: '#b5c5ff', textAlign: 'center', fontWeight: '600' },
  analyzeBtn: { backgroundColor: '#2244d4', borderRadius: 0, padding: 16, alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#fbbf24' },
  analyzeBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
  result: { backgroundColor: '#2a2247', borderRadius: 0, padding: 16, borderWidth: 2, borderColor: '#2244d4' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  harmonyType: { fontSize: 20, fontWeight: '900', color: '#f8fafc' },
  scoreBadge: { backgroundColor: '#2244d4', borderRadius: 0, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: '#fbbf24' },
  scoreText: { color: '#f8fafc', fontWeight: '900', fontSize: 14 },
  verdict: { color: '#b5c5ff', fontSize: 14, lineHeight: 20, marginBottom: 10, fontWeight: '600' },
  bodyText: { color: '#b5c5ff', fontSize: 13, lineHeight: 20, fontWeight: '600' },
  accentRow: { flexDirection: 'row', gap: 12 },
  accentChip: { alignItems: 'center', gap: 4 },
  accentSwatch: { width: 40, height: 40, borderRadius: 0, borderWidth: 2, borderColor: '#2244d4' },
  accentHex: { fontSize: 10, color: '#b5c5ff', fontWeight: '600' },
});
