import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { analyseColours } from '../services/api';
import type { ColourAnalysis } from '../services/api';
import { Busy, Button, Card, Chip, Label, Notice, ScorePill, layout } from '../components/ui';
import { colors, radius, type } from '../theme';

const PRESETS = [
  { name: 'Hari Raya', colours: ['#006400', '#FFD700', '#FFFFFF'] },
  { name: 'Chinese New Year', colours: ['#CC0000', '#FFD700', '#FF6600'] },
  { name: 'Deepavali', colours: ['#800080', '#FF8C00', '#FFD700'] },
  { name: 'Royal blue', colours: ['#003087', '#C0C0C0', '#FFFFFF'] },
  { name: 'Earth tones', colours: ['#8B4513', '#D2B48C', '#F5F5DC'] },
];

const HEX = /^#[0-9A-F]{6}$/i;

export function ColourScreen() {
  const [palette, setPalette] = useState<string[]>(['#C7A88C', '#8E7A69']);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ColourAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (next: string[]) => {
    setPalette(next);
    setResult(null);
    setError(null);
  };

  const add = (hex: string) => {
    const value = (hex.startsWith('#') ? hex : `#${hex}`).toUpperCase();
    if (!HEX.test(value)) {
      setError('Enter a valid hex colour, e.g. #B5654A');
      return;
    }
    if (!palette.includes(value)) update([...palette, value]);
    setInput('');
  };

  const analyse = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await analyseColours(palette));
    } catch {
      setError('Could not analyse these colours. Check that the AI model is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={layout.screen} edges={['top']}>
      <ScrollView contentContainerStyle={layout.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View>
          <Text style={type.h1}>Colour check</Text>
          <Text style={type.small}>See how well colours pair before you wear them.</Text>
        </View>

        <Card>
          <Label>Your palette</Label>
          <View style={s.bar}>
            {palette.map((c) => <View key={c} style={{ flex: 1, backgroundColor: c }} />)}
          </View>
          <View style={layout.row}>
            {palette.map((c) => (
              <TouchableOpacity key={c} activeOpacity={0.8} onPress={() => update(palette.filter((x) => x !== c))} style={s.colourChip}>
                <View style={[s.dot, { backgroundColor: c }]} />
                <Text style={{ fontSize: 14, color: colors.text }}>{c} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={layout.row}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder="#4F6B4A"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              onSubmitEditing={() => add(input)}
            />
            <Button title="Add colour" onPress={() => add(input)} />
          </View>
          <View>
            <Label>Presets</Label>
            <View style={layout.row}>
              {PRESETS.map((p) => <Chip key={p.name} label={p.name} onPress={() => update(p.colours)} />)}
            </View>
          </View>
          {error && <Notice tone="error">{error}</Notice>}
          {loading ? <Busy message="Analysing colours" /> : <Button title="Analyse palette" variant="primary" disabled={palette.length < 2} onPress={analyse} />}
        </Card>

        {result && (
          <Card>
            <View style={layout.row}>
              <ScorePill big score={result.score} suffix="/10" tone={result.score >= 8 ? 'pass' : result.score >= 5 ? 'warn' : 'fail'} />
              <View style={s.tag}><Text style={{ color: colors.accentStrong, fontSize: 12, fontWeight: '600' }}>{result.harmonyType}</Text></View>
            </View>
            <Text style={type.body}>{result.verdict}</Text>
            <View>
              <Label>Cultural notes</Label>
              <Text style={type.small}>{result.culturalNotes}</Text>
            </View>
            {result.suggestedAccents?.length > 0 && (
              <View>
                <Label>Suggested accents</Label>
                <View style={layout.row}>
                  {result.suggestedAccents.map((c) => <Chip key={c} label={`+ ${c}`} onPress={() => add(c)} />)}
                </View>
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', height: 80, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  colourChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 11, fontSize: 14, color: colors.text },
  tag: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 10 },
});
