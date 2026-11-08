import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProfile, imageSrc, reviewTryon, tryOnFromImage } from '../services/api';
import type { OutfitRender, OutfitReview } from '../services/api';
import { pickImage, type PickedImage } from '../lib/image';
import { scoreTone } from '../lib/outfit';
import { Busy, Button, Card, Label, Notice, ScorePill, Segmented, Select, layout } from '../components/ui';
import { colors, radius, type } from '../theme';

type Category = 'top' | 'dress' | 'outerwear';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top', label: 'Top / shirt' },
  { value: 'dress', label: 'Dress / one-piece' },
  { value: 'outerwear', label: 'Jacket / outerwear' },
];
const MODES = [
  { value: 'upload' as const, label: 'Upload image' },
  { value: 'link' as const, label: 'Paste link' },
];

export function TryOnScreen() {
  const navigation = useNavigation<{ navigate: (name: string) => void }>();
  const [hasBody, setHasBody] = useState(true);
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Category>('top');
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<OutfitRender | null>(null);
  const [review, setReview] = useState<OutfitReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProfile().then((p) => setHasBody(Boolean(p.bodyPhoto))).catch(() => {});
    }, [])
  );

  const ready = hasBody && (mode === 'upload' ? Boolean(image) : /^https?:\/\//i.test(url.trim()));

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setReview(null);
    try {
      const r = await tryOnFromImage(
        mode === 'upload' && image
          ? { sourceImage: { base64: image.base64, mimeType: image.mimeType }, category }
          : { sourceUrl: url.trim(), category }
      );
      setResult(r);
      if (r.status !== 'ready' || !r.previewImageBase64) {
        setError('The try-on service is unavailable right now. Try again in a few minutes.');
        return;
      }
      setBusy(false);
      setReviewing(true);
      try {
        setReview(await reviewTryon({ base64: r.previewImageBase64, mimeType: 'image/jpeg' }, r.tryonId));
      } catch {
        setError('The try-on worked, but the stylist review failed. Check that the AI model is running.');
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Try-on failed. The free Hugging Face Space may be busy, so try again shortly.');
    } finally {
      setBusy(false);
      setReviewing(false);
    }
  };

  const resultUri = result?.previewImageBase64 ? imageSrc(result.resultImageUrl) ?? `data:image/jpeg;base64,${result.previewImageBase64}` : null;

  return (
    <SafeAreaView style={layout.screen} edges={['top']}>
      <ScrollView contentContainerStyle={layout.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View>
          <Text style={type.h1}>Try on</Text>
          <Text style={type.small}>See any outfit on your body: a photo, a screenshot or a Pinterest link.</Text>
        </View>

        {!hasBody && (
          <Notice>
            Add your body photo first.
          </Notice>
        )}
        {!hasBody && <Button title="Go to profile" onPress={() => navigation.navigate('Profile')} />}
        {error && <Notice tone="error">{error}</Notice>}

        <Card>
          <Segmented value={mode} options={MODES} onChange={setMode} />
          {mode === 'upload' ? (
            <>
              <View style={s.preview}>
                {image ? <Image source={{ uri: image.dataUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" /> : <Text style={type.small}>Choose the outfit image</Text>}
              </View>
              <View style={layout.row}>
                <Button title="Camera" onPress={async () => setImage((await pickImage('camera', 1024)) ?? image)} style={{ flex: 1 }} />
                <Button title="Gallery" onPress={async () => setImage((await pickImage('gallery', 1024)) ?? image)} style={{ flex: 1 }} />
              </View>
            </>
          ) : (
            <View>
              <Label>Image or Pinterest link</Label>
              <TextInput
                style={s.input}
                value={url}
                onChangeText={setUrl}
                placeholder="https://…"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <Text style={[type.small, { marginTop: 8 }]}>For a Pinterest pin, paste the pin link. A direct image link works too.</Text>
            </View>
          )}
          <View>
            <Label>What should be tried on?</Label>
            <Select value={category} options={CATEGORIES} onChange={setCategory} />
          </View>
          <Text style={type.small}>The free try-on model dresses the upper body only. It works best when the garment is shown on its own.</Text>
          {busy ? <Busy message="Dressing you in this outfit. This can take a few minutes" /> : <Button title="Try on my body" variant="primary" disabled={!ready || reviewing} onPress={run} />}
        </Card>

        {(resultUri || reviewing || review) && (
          <Card>
            <Text style={type.h3}>Result</Text>
            {resultUri && <Image source={{ uri: resultUri }} style={s.result} resizeMode="contain" />}
            {result?.warnings.map((w, i) => <Notice key={i}>{w}</Notice>)}
            {reviewing && <Busy message="Stylist is reviewing the look" />}
            {review && (
              <>
                <View style={layout.row}>
                  <ScorePill big score={review.score} suffix="/10" tone={scoreTone(review.score * 10)} />
                  <Text style={[type.body, { fontWeight: '600', flex: 1 }]}>{review.verdict}</Text>
                </View>
                {([['Works well', review.strengths], ['Could be better', review.issues], ['Try this', review.swaps]] as const).map(
                  ([title, list]) =>
                    list?.length > 0 && (
                      <View key={title}>
                        <Label>{title}</Label>
                        {list.map((t, i) => <Text key={i} style={[type.body, { marginBottom: 4 }]}>• {t}</Text>)}
                      </View>
                    )
                )}
              </>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  preview: { height: 260, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 12 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text },
  result: { width: '100%', height: 420, borderRadius: radius.md, backgroundColor: colors.bg },
});
