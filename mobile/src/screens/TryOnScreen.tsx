import React, { useCallback, useMemo, useState } from 'react';
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
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { generateVirtualTryOnPreview, getWardrobe } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { WardrobeItem } from '../services/api';
import { CULTURAL_CONTEXTS, OCCASIONS } from '../constants/config';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type PersonImage = {
  uri: string;
  base64: string;
  mimeType: string;
};

export function TryOnScreen() {
  const navigation = useNavigation<Nav>();
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [personImage, setPersonImage] = useState<PersonImage | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [rendering, setRendering] = useState(false);
  const [resultImageUri, setResultImageUri] = useState<string | null>(null);
  const [fitNotes, setFitNotes] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('Casual Day Out');
  const [selectedCulture, setSelectedCulture] = useState<string>('Any / Mixed');
  const [fitProfile, setFitProfile] = useState<'fitted' | 'relaxed' | 'modest'>('relaxed');

  const selectedItems = useMemo(
    () => wardrobe.filter((item) => selectedItemIds.includes(item.id)),
    [wardrobe, selectedItemIds]
  );

  const loadWardrobe = useCallback(() => {
    setLoadingWardrobe(true);
    void (async () => {
      try {
        const items = await getWardrobe();
        setWardrobe(items);
      } catch {
        Alert.alert('Error', 'Could not load wardrobe items.');
      } finally {
        setLoadingWardrobe(false);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadWardrobe();
      return undefined;
    }, [loadWardrobe])
  );

  const pickPersonImage = (source: 'camera' | 'gallery') => {
    const launcher = source === 'camera' ? launchCamera : launchImageLibrary;
    launcher(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 1400,
        maxHeight: 2200,
      },
      (response) => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri || !asset.base64) {
          Alert.alert('Image Error', 'Could not read selected image.');
          return;
        }

        setPersonImage({
          uri: asset.uri,
          base64: asset.base64,
          mimeType: asset.type || 'image/jpeg',
        });
      }
    );
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const readImageAsBase64 = async (uri: string) => {
    const cleanUri = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
    return RNFS.readFile(cleanUri, 'base64');
  };

  const handleRenderTryOn = async () => {
    if (!personImage) {
      Alert.alert('Full-body image needed', 'Please upload your full-body photo first.');
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert('Select garments', 'Choose at least one wardrobe item to try on.');
      return;
    }

    setRendering(true);
    setWarnings([]);

    try {
      const garmentInputs = await Promise.all(
        selectedItems.map(async (item) => {
          if (!item.imageUri) {
            throw new Error(`"${item.type}" has no image attached.`);
          }

          const base64 = await readImageAsBase64(item.imageUri);
          return {
            base64,
            mimeType: 'image/jpeg',
            category: item.style || item.type,
            name: item.type,
          };
        })
      );

      const fitInstruction =
        fitProfile === 'fitted'
          ? 'Use a tailored silhouette with close-to-body fit.'
          : fitProfile === 'modest'
            ? 'Use modest drape, less contour emphasis, and respectful coverage.'
            : 'Use a natural relaxed drape with realistic spacing from body.';

      const renderPrompt = [
        `Occasion: ${selectedOccasion}.`,
        `Cultural context: ${selectedCulture}.`,
        `Fit profile: ${fitProfile}.`,
        fitInstruction,
        'Maintain pose and body proportion.',
        'Keep face identity unchanged.',
        'Align garment seams and hems accurately.',
        'Avoid clipping, floating fabric, and anatomy distortions.',
      ].join(' ');

      const response = await generateVirtualTryOnPreview(
        {
          base64: personImage.base64,
          mimeType: personImage.mimeType,
        },
        garmentInputs,
        renderPrompt
      );

      const previewUri = response.previewImageBase64
        ? `data:image/jpeg;base64,${response.previewImageBase64}`
        : response.previewImageUrl || null;

      setResultImageUri(previewUri);
      setFitNotes(response.fitNotes || '');
      setWarnings(response.warnings || []);

      if (response.status === 'provider_unavailable') {
        Alert.alert(
          'Provider not configured',
          'Virtual try-on renderer is not connected yet. Configure VTON_API_URL in backend env.'
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not render try-on preview.';
      Alert.alert('Try-on failed', message);
    } finally {
      setRendering(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Virtual Try-On</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Full Body Photo</Text>
          <View style={styles.personPreviewBox}>
            {personImage ? (
              <Image source={{ uri: personImage.uri }} resizeMode="cover" style={styles.personPreview} />
            ) : (
              <Text style={styles.placeholderText}>Upload a straight, full-body image</Text>
            )}
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => pickPersonImage('camera')}>
              <Text style={styles.primaryBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickPersonImage('gallery')}>
              <Text style={styles.secondaryBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Select Garments</Text>
          {loadingWardrobe ? (
            <ActivityIndicator color="#f59e0b" style={{ marginVertical: 20 }} />
          ) : wardrobe.length === 0 ? (
            <Text style={styles.helpText}>Wardrobe is empty. Add items from Camera first.</Text>
          ) : (
            <View style={styles.itemGrid}>
              {wardrobe.map((item) => {
                const selected = selectedItemIds.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, selected && styles.itemCardActive]}
                    onPress={() => toggleItem(item.id)}
                  >
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
                    ) : (
                      <View style={styles.itemImageFallback}>
                        <Text style={styles.fallbackIcon}>No Pic</Text>
                      </View>
                    )}
                    <Text numberOfLines={1} style={styles.itemName}>
                      {item.type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Styling Context</Text>
          <Text style={styles.metaLabel}>Occasion</Text>
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

          <Text style={styles.metaLabel}>Cultural Context</Text>
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

          <Text style={styles.metaLabel}>Fit Profile</Text>
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

        <TouchableOpacity
          style={[styles.renderBtn, rendering && styles.renderBtnDisabled]}
          onPress={handleRenderTryOn}
          disabled={rendering}
        >
          {rendering ? (
            <ActivityIndicator color="#0b1220" />
          ) : (
            <Text style={styles.renderBtnText}>Render Try-On Preview</Text>
          )}
        </TouchableOpacity>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Preview Result</Text>
          <View style={styles.resultBox}>
            {resultImageUri ? (
              <Image source={{ uri: resultImageUri }} style={styles.resultImage} resizeMode="cover" />
            ) : (
              <Text style={styles.placeholderText}>Rendered outfit preview will appear here</Text>
            )}
          </View>

          {!!fitNotes && <Text style={styles.fitNotes}>{fitNotes}</Text>}
          {warnings.map((warning) => (
            <Text key={warning} style={styles.warningText}>
              {warning}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#0ea5e9',
    opacity: 0.18,
    top: -100,
    left: -80,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { width: 64 },
  backText: { color: '#f59e0b', fontWeight: '700', fontSize: 14 },
  title: { color: '#f8fafc', fontSize: 22, fontFamily: 'Georgia', fontWeight: '800' },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: '#111b31',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b3a55',
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#fbbf24',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  metaLabel: {
    color: '#93c5fd',
    fontSize: 11,
    marginBottom: 8,
    marginTop: 2,
  },
  chipRow: {
    paddingBottom: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#f59e0b22',
    borderColor: '#f59e0b',
  },
  chipText: { color: '#e2e8f0', fontSize: 12 },
  chipTextActive: { color: '#fbbf24', fontWeight: '700' },
  fitRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  fitBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    paddingVertical: 10,
  },
  fitBtnActive: {
    backgroundColor: '#f59e0b22',
    borderColor: '#f59e0b',
  },
  fitBtnText: {
    color: '#cbd5e1',
    textTransform: 'capitalize',
    fontSize: 12,
    fontWeight: '600',
  },
  fitBtnTextActive: {
    color: '#fbbf24',
    fontWeight: '800',
  },
  personPreviewBox: {
    height: 270,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  personPreview: { width: '100%', height: '100%' },
  row: { flexDirection: 'row', gap: 10 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryBtnText: { color: '#0b1220', fontWeight: '800', fontSize: 13 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: { color: '#e2e8f0', fontWeight: '700', fontSize: 13 },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemCard: {
    width: '31%',
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 6,
  },
  itemCardActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#7c2d1220',
  },
  itemImage: { width: '100%', height: 90, borderRadius: 8, marginBottom: 6 },
  itemImageFallback: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
  },
  fallbackIcon: { color: '#94a3b8', fontSize: 11 },
  itemName: { color: '#e2e8f0', fontSize: 11, textAlign: 'center' },
  renderBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 14,
  },
  renderBtnDisabled: { opacity: 0.65 },
  renderBtnText: { color: '#0b1220', fontWeight: '800', fontSize: 14, letterSpacing: 0.6 },
  resultBox: {
    height: 330,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultImage: { width: '100%', height: '100%' },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  fitNotes: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  warningText: {
    color: '#fbbf24',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  helpText: { color: '#cbd5e1', fontSize: 13 },
});
