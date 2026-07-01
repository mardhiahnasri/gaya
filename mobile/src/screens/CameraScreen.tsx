import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { analyzeClothing, saveToWardrobe } from '../services/api';
import type { ClothingAnalysis } from '../services/api';

export function CameraScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = (source: 'camera' | 'gallery') => {
    const options = { includeBase64: true, maxWidth: 1024, maxHeight: 1024, quality: 0.8 as const };
    const launcher = source === 'camera' ? launchCamera : launchImageLibrary;
    launcher({ mediaType: 'photo', ...options }, (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset?.uri && asset?.base64) {
        setImageUri(asset.uri);
        setBase64(asset.base64);
        setAnalysis(null);
      }
    });
  };

  const handleAnalyze = async () => {
    if (!base64) return;
    setLoading(true);
    try {
      const result = await analyzeClothing(base64);
      setAnalysis(result);
    } catch {
      Alert.alert('Error', 'Could not analyse the image. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      await saveToWardrobe(analysis, imageUri ?? undefined);
      Alert.alert('Saved!', 'Item added to your wardrobe.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save to wardrobe.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Clothing</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Image preview */}
        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <Text style={styles.imagePlaceholder}>No image selected</Text>
          )}
        </View>

        {/* Pick image buttons */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={() => pickImage('camera')}>
            <Text style={styles.btnText}>📷  Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => pickImage('gallery')}>
            <Text style={styles.btnText}>🖼  Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Analyse button */}
        {base64 && !analysis && (
          <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analyzeBtnText}>✦ Analyse with Gemini AI</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Analysis result */}
        {analysis && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>{analysis.type}</Text>
            <Text style={styles.resultSub}>{analysis.description}</Text>

            <View style={styles.colourRow}>
              {analysis.dominantColours.map((hex, i) => (
                <View key={hex} style={styles.colourChip}>
                  <View style={[styles.colourSwatch, { backgroundColor: hex }]} />
                  <Text style={styles.colourLabel}>{analysis.colourNames[i]}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tagsRow}>
              <Tag label={analysis.culturalOrigin} accent />
              <Tag label={analysis.style} />
              <Tag label={analysis.fabric} />
            </View>

            <Text style={styles.occasionTitle}>Suitable for:</Text>
            <View style={styles.tagsRow}>
              {analysis.suitableOccasions.map((occ) => (
                <Tag key={occ} label={occ} />
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>💾  Save to Wardrobe</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.tag, accent && styles.tagAccent]}>
      <Text style={[styles.tagText, accent && styles.tagTextAccent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e17' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 60 },
  backText: { color: '#e94560', fontSize: 18 },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 60 },
  imageBox: {
    height: 300, backgroundColor: '#1a1a2e', borderRadius: 20, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#16213e',
  },
  preview: { width: '100%', height: '100%' },
  imagePlaceholder: { color: '#555', fontSize: 14 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btn: {
    flex: 1, backgroundColor: '#e94560', borderRadius: 12, padding: 14,
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#e94560' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  analyzeBtn: {
    backgroundColor: '#e94560', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 16,
  },
  analyzeBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  result: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#16213e' },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  resultSub: { fontSize: 13, color: '#aaa', marginBottom: 16, lineHeight: 18 },
  colourRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  colourChip: { alignItems: 'center' },
  colourSwatch: { width: 36, height: 36, borderRadius: 18, marginBottom: 4, borderWidth: 2, borderColor: '#fff2' },
  colourLabel: { fontSize: 10, color: '#ccc' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { backgroundColor: '#16213e', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  tagAccent: { backgroundColor: '#e9456022' },
  tagText: { color: '#ccc', fontSize: 12 },
  tagTextAccent: { color: '#e94560' },
  occasionTitle: { color: '#aaa', fontSize: 12, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  saveBtn: {
    backgroundColor: '#e94560', borderRadius: 12, padding: 14,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
