import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { analyzeClothing, deleteFromWardrobe, getWardrobe, saveToWardrobe, updateWardrobeItem } from '../services/api';
import type { Category, WardrobeItem } from '../services/api';
import { pickImage, type PickedImage } from '../lib/image';
import { CATEGORIES, categoryOf } from '../lib/outfit';
import { Busy, Button, Card, Chip, Notice, Select, layout } from '../components/ui';
import { colors, radius, shadow, type } from '../theme';

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

export function WardrobeScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState<'all' | Category>('all');
  const [adding, setAdding] = useState(false);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await getWardrobe());
      setError(null);
    } catch {
      setError('Could not load your wardrobe. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((i) => m.set(categoryOf(i), (m.get(categoryOf(i)) ?? 0) + 1));
    return m;
  }, [items]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter((i) => {
      if (category !== 'all' && categoryOf(i) !== category) return false;
      if (!q) return true;
      return [i.type, i.culturalOrigin, i.style, ...(i.colourNames ?? [])].some((v) => v?.toLowerCase().includes(q));
    });
  }, [items, filter, category]);

  const pick = async (source: 'camera' | 'gallery') => {
    const img = await pickImage(source, 768);
    if (img) {
      setPhoto(img);
      setError(null);
    }
  };

  const addItem = async () => {
    if (!photo) return;
    setAnalysing(true);
    setError(null);
    try {
      const analysis = await analyzeClothing(photo.base64, photo.mimeType);
      // The data URL is saved so the studio can send the garment image to the try-on service.
      const saved = await saveToWardrobe(analysis, photo.dataUrl);
      setItems((prev) => [...prev, saved]);
      setPhoto(null);
      setAdding(false);
    } catch {
      setError('Could not analyse that photo. Check that the AI model is running, then try again.');
    } finally {
      setAnalysing(false);
    }
  };

  const changeCategory = async (item: WardrobeItem, category: Category) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, category } : i)));
    try {
      await updateWardrobeItem(item.id, { category });
    } catch {
      setError('Could not update the category.');
      load();
    }
  };

  const remove = (item: WardrobeItem) => {
    Alert.alert('Remove item', `Remove ${item.type} from your wardrobe?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteFromWardrobe(item.id);
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        },
      },
    ]);
  };

  const header = (
    <View style={{ gap: 16, marginBottom: 4 }}>
      <View style={layout.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={type.h1}>Wardrobe</Text>
          <Text style={type.small}>
            {items.length} {items.length === 1 ? 'piece' : 'pieces'} in your collection
          </Text>
        </View>
        <Button title={adding ? 'Close' : '+ Add'} variant="primary" onPress={() => setAdding((v) => !v)} />
      </View>

      {error && <Notice tone="error">{error}</Notice>}

      {adding && (
        <Card>
          <View style={s.preview}>
            {photo ? <Image source={{ uri: photo.dataUrl }} style={s.previewImg} resizeMode="contain" /> : <Text style={type.small}>Add a clear photo of one item</Text>}
          </View>
          <View style={layout.row}>
            <Button title="Camera" onPress={() => pick('camera')} style={{ flex: 1 }} />
            <Button title="Gallery" onPress={() => pick('gallery')} style={{ flex: 1 }} />
          </View>
          <Text style={type.small}>Type, colours, fabric, sleeves, length and occasions are detected automatically.</Text>
          {analysing ? <Busy message="Analysing your item" /> : <Button title="Analyse and save" variant="primary" disabled={!photo} onPress={addItem} />}
        </Card>
      )}

      <TextInput style={s.search} placeholder="Search type, colour, culture…" placeholderTextColor={colors.muted} value={filter} onChangeText={setFilter} />

      {items.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(['all', ...CATEGORIES] as const).filter((c) => c === 'all' || counts.has(c)).map((c) => (
            <Chip key={c} active={category === c} onPress={() => setCategory(c)} label={`${c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}  ${c === 'all' ? items.length : counts.get(c)}`} />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={layout.screen} edges={['top']}>
      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={[layout.content, { gap: 12 }]}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          loading ? (
            <Busy message="Loading wardrobe" />
          ) : (
            <View style={s.empty}>
              <Text style={type.h3}>{items.length === 0 ? 'Your wardrobe is empty' : 'No matches'}</Text>
              <Text style={type.small}>{items.length === 0 ? 'Add your first piece to start matching outfits.' : 'Try a different search.'}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={s.item}>
            <View style={s.itemImg}>
              {item.imageUri ? <Image source={{ uri: item.imageUri }} style={s.itemPhoto} resizeMode="cover" /> : <Text style={{ fontSize: 32 }}>👗</Text>}
              {!!item.dominantColours?.length && (
                <View style={s.swatches}>
                  {item.dominantColours.map((c, i) => <View key={i} style={[s.swatch, { backgroundColor: c }]} />)}
                </View>
              )}
            </View>
            <View style={{ padding: 12, gap: 6 }}>
              <Text style={[type.h3, { textTransform: 'capitalize', fontSize: 15 }]} numberOfLines={1}>{item.type}</Text>
              <Text style={type.small} numberOfLines={1}>
                {[item.style, item.culturalOrigin].filter(Boolean).join(' · ')}
              </Text>
              <Select compact value={categoryOf(item)} options={CATEGORY_OPTIONS} onChange={(c) => changeCategory(item, c)} />
              <TouchableOpacity onPress={() => remove(item)} style={{ alignSelf: 'flex-end' }}>
                <Text style={[type.small, { color: colors.muted }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  search: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, backgroundColor: colors.surface, paddingHorizontal: 18, paddingVertical: 11, fontSize: 14, color: colors.text },
  preview: { height: 200, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  item: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow },
  itemImg: { aspectRatio: 4 / 5, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  itemPhoto: { width: '100%', height: '100%' },
  swatches: { position: 'absolute', left: 8, bottom: 8, flexDirection: 'row', gap: 4, paddingVertical: 4, paddingHorizontal: 6, borderRadius: radius.pill, backgroundColor: 'rgba(255,253,248,0.92)' },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)' },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 6 },
});
