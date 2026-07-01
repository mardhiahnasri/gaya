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
      // Auto-save after analysis
      await saveToWardrobe(result, imageUri ?? undefined);
      Alert.alert('✓ Added to Wardrobe!', 'Your item has been saved.', [
        { text: 'Continue Shopping', onPress: () => {
          setImageUri(null);
          setBase64(null);
          setAnalysis(null);
        }},
        { text: 'Go to Wardrobe', onPress: () => navigation.navigate('Wardrobe') },
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('save')) {
        Alert.alert('Item Analyzed', 'Could not save automatically, but you can view the analysis above.');
      } else {
        Alert.alert('Error', 'Could not analyse the image. Make sure the backend is running.');
      }
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
            <Text style={styles.resultTitle}>✓ {analysis.type}</Text>
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
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 3, borderBottomColor: '#2244d4', backgroundColor: '#2d1b4e' },
  backBtn: { width: 60 },
  backText: { color: '#fbbf24', fontSize: 18, fontWeight: '900' },
  title: { flex: 1, textAlign: 'center', color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  scroll: { padding: 16, paddingBottom: 60 },
  imageBox: {
    height: 300, backgroundColor: '#2a2247', borderRadius: 0, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#2244d4',
  },
  preview: { width: '100%', height: '100%' },
  imagePlaceholder: { color: '#7a8aaa', fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btn: {
    flex: 1, backgroundColor: '#2244d4', borderRadius: 0, padding: 14,
    alignItems: 'center', borderWidth: 2, borderColor: '#fbbf24',
  },
  btnSecondary: { backgroundColor: '#1a1a2e', borderWidth: 2, borderColor: '#2244d4' },
  btnText: { color: '#f8fafc', fontWeight: '900', fontSize: 14 },
  analyzeBtn: {
    backgroundColor: '#2244d4', borderRadius: 0, padding: 16,
    alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#fbbf24',
  },
  analyzeBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 15, letterSpacing: 0.3 },
  result: { backgroundColor: '#2a2247', borderRadius: 0, padding: 16, borderWidth: 2, borderColor: '#2244d4' },
  resultTitle: { fontSize: 22, fontWeight: '900', color: '#f8fafc', marginBottom: 4 },
  resultSub: { fontSize: 13, color: '#b5c5ff', marginBottom: 14, lineHeight: 18, fontWeight: '600' },
  colourRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  colourChip: { alignItems: 'center' },
  colourSwatch: { width: 40, height: 40, borderRadius: 0, marginBottom: 4, borderWidth: 2, borderColor: '#2244d4' },
  colourLabel: { fontSize: 10, color: '#b5c5ff', fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { backgroundColor: '#1a1a2e', borderRadius: 0, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#2244d4' },
  tagAccent: { backgroundColor: '#2244d4', borderColor: '#fbbf24' },
  tagText: { color: '#b5c5ff', fontSize: 11, fontWeight: '600' },
  tagTextAccent: { color: '#f8fafc', fontWeight: '900' },
  occasionTitle: { color: '#fbbf24', fontSize: 11, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '900' },
  saveBtn: {
    backgroundColor: '#2244d4', borderRadius: 0, padding: 14,
    alignItems: 'center', marginTop: 8, borderWidth: 2, borderColor: '#fbbf24',
  },
  saveBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 15 },
});
