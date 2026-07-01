import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import { CULTURAL_CONTEXTS, OCCASIONS } from '../constants/config';
import { generateVirtualTryOnPreview } from '../services/api';

type PickedImage = {
  uri: string;
  base64: string;
  mimeType: string;
};

function pickImageFromLibrary(setter: (img: PickedImage) => void) {
  launchImageLibrary(
    {
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 1400,
      maxHeight: 2200,
      quality: 0.9 as const,
    },
    (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.base64 || !asset?.uri) {
        Alert.alert('Image Error', 'Could not read selected image.');
        return;
      }
      setter({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.type || 'image/jpeg',
      });
    }
  );
}

export function TryOnScreen() {
  const [personImage, setPersonImage] = useState<PickedImage | null>(null);
  const [garmentImage, setGarmentImage] = useState<PickedImage | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState('Casual Day Out');
  const [selectedCulture, setSelectedCulture] = useState('Any / Mixed');
  const [fitProfile, setFitProfile] = useState<'fitted' | 'relaxed' | 'modest'>('relaxed');
  const [loading, setLoading] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const fitPrompt = useMemo(() => {
    if (fitProfile === 'fitted') return 'Use a tailored fit with close body contour.';
    if (fitProfile === 'modest') return 'Keep modest coverage and softer drape.';
    return 'Use a natural relaxed silhouette and realistic drape.';
  }, [fitProfile]);

  const handleRender = async () => {
    if (!personImage) {
      Alert.alert('Missing full-body photo', 'Please upload your full-body image.');
      return;
    }
    if (!garmentImage) {
      Alert.alert('Missing garment image', 'Please upload one garment image.');
      return;
    }

    setLoading(true);
    setWarnings([]);

    try {
      const prompt = [
        `Occasion: ${selectedOccasion}.`,
        `Cultural context: ${selectedCulture}.`,
        `Fit profile: ${fitProfile}.`,
        fitPrompt,
        'Maintain body proportions and preserve face identity.',
        'Match lighting and shadows naturally.',
      ].join(' ');

      const result = await generateVirtualTryOnPreview(
        { base64: personImage.base64, mimeType: personImage.mimeType },
        [
          {
            base64: garmentImage.base64,
            mimeType: garmentImage.mimeType,
            category: 'top',
            name: 'Uploaded Garment',
          },
        ],
        prompt
      );

      const preview = result.previewImageBase64
        ? `data:image/jpeg;base64,${result.previewImageBase64}`
        : result.previewImageUrl || null;

      setResultUri(preview);
      setNotes(result.fitNotes || '');
      setWarnings(result.warnings || []);

      if (result.status === 'provider_unavailable') {
        Alert.alert('Provider unavailable', 'Try again later or use your own duplicated HF Space URL.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not render try-on image.';
      Alert.alert('Try-On Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>DRESS ME CONSOLE</Text>
        <Text style={styles.subheader}>Upload your photo and one clothing image.</Text>

        <View style={styles.card}>
          <Text style={styles.section}>1. Full-body image</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImageFromLibrary(setPersonImage)}>
            <Text style={styles.uploadBtnText}>Upload My Photo</Text>
          </TouchableOpacity>
          <View style={styles.previewBox}>
            {personImage ? (
              <Image source={{ uri: personImage.uri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <Text style={styles.placeholder}>No image selected</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>2. Garment image</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImageFromLibrary(setGarmentImage)}>
            <Text style={styles.uploadBtnText}>Upload Clothing Photo</Text>
          </TouchableOpacity>
          <View style={styles.previewBox}>
            {garmentImage ? (
              <Image source={{ uri: garmentImage.uri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <Text style={styles.placeholder}>No image selected</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>3. Style context</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {OCCASIONS.slice(0, 8).map((occ) => {
              const active = selectedOccasion === occ.label;
              return (
                <TouchableOpacity
                  key={occ.id}
                  onPress={() => setSelectedOccasion(occ.label)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{occ.emoji} {occ.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CULTURAL_CONTEXTS.map((ctx) => {
              const active = selectedCulture === ctx.label;
              return (
                <TouchableOpacity
                  key={ctx.id}
                  onPress={() => setSelectedCulture(ctx.label)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{ctx.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.fitRow}>
            {['fitted', 'relaxed', 'modest'].map((profile) => {
              const active = fitProfile === profile;
              return (
                <TouchableOpacity
                  key={profile}
                  onPress={() => setFitProfile(profile as 'fitted' | 'relaxed' | 'modest')}
                  style={[styles.fitBtn, active && styles.fitBtnActive]}
                >
                  <Text style={[styles.fitBtnText, active && styles.fitBtnTextActive]}>{profile}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.renderBtn} onPress={handleRender} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.renderBtnText}>Try This Outfit</Text>}
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.section}>4. Result</Text>
          <View style={[styles.previewBox, { height: 380 }]}>
            {resultUri ? (
              <Image source={{ uri: resultUri }} style={styles.preview} resizeMode="contain" />
            ) : (
              <Text style={styles.placeholder}>Rendered preview appears here</Text>
            )}
          </View>
          {!!notes && <Text style={styles.notes}>{notes}</Text>}
          {warnings.map((w) => (
            <Text key={w} style={styles.warning}>{w}</Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 40, gap: 12 },
  header: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f8fafc',
    marginTop: 8,
    fontFamily: 'Georgia',
    textAlign: 'center',
    backgroundColor: '#2d1b4e',
    borderWidth: 3,
    borderColor: '#2244d4',
    borderRadius: 0,
    paddingVertical: 14,
  },
  subheader: {
    color: '#b5c5ff',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#2a2247',
    borderWidth: 2,
    borderColor: '#2244d4',
    borderRadius: 0,
    padding: 14,
    marginBottom: 12,
  },
  section: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#fbbf24',
    marginBottom: 12,
    fontWeight: '900',
  },
  uploadBtn: {
    backgroundColor: '#2244d4',
    borderRadius: 0,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  uploadBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 12 },
  previewBox: {
    height: 240,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#2244d4',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { color: '#7a8aaa', fontSize: 11, fontWeight: '600' },
  chipRow: { gap: 8, marginBottom: 12 },
  chip: {
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#2244d4',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#2244d4', borderColor: '#fbbf24' },
  chipText: { color: '#b5c5ff', fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: '#f8fafc', fontWeight: '900' },
  fitRow: { flexDirection: 'row', gap: 8 },
  fitBtn: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#2244d4',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  fitBtnActive: { backgroundColor: '#2244d4', borderColor: '#fbbf24' },
  fitBtnText: { color: '#b5c5ff', textTransform: 'capitalize', fontSize: 11, fontWeight: '700' },
  fitBtnTextActive: { color: '#f8fafc', fontWeight: '900' },
  renderBtn: {
    backgroundColor: '#2244d4',
    borderRadius: 0,
    alignItems: 'center',
    paddingVertical: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  renderBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 13 },
  notes: { color: '#e5e7eb', marginTop: 12, lineHeight: 18, fontSize: 11, fontWeight: '600' },
  warning: { color: '#fbbf24', marginTop: 8, fontSize: 11, lineHeight: 18, fontWeight: '700' },
});
