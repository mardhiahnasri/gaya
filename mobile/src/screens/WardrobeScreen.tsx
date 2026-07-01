import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getWardrobe, deleteFromWardrobe } from '../services/api';
import type { WardrobeItem } from '../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function WardrobeScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWardrobe = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWardrobe();
      setItems(data);
    } catch {
      Alert.alert('Error', 'Could not load wardrobe. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(loadWardrobe);

  const handleDelete = (id: string) => {
    Alert.alert('Remove Item', 'Remove this item from your wardrobe?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteFromWardrobe(id);
          setItems((prev) => prev.filter((i) => i.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.topBar}>
        <View>
          <Text style={styles.kicker}>CURATED</Text>
          <Text style={styles.title}>Wardrobe Archive</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.addBtnText}>+ Add Look</Text>
        </TouchableOpacity>
      </View>

      {!loading && items.length > 0 && (
        <Text style={styles.stats}>{items.length} pieces catalogued</Text>
      )}

      {loading ? (
        <ActivityIndicator color="#f59e0b" style={{ marginTop: 60 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👕</Text>
          <Text style={styles.emptyText}>No pieces yet</Text>
          <Text style={styles.emptySub}>Tap Add Look to start building your Cher-style digital closet</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id)}>
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={{ fontSize: 32 }}>👗</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.type}</Text>
                <View style={styles.swatchRow}>
                  {item.dominantColours.slice(0, 3).map((hex) => (
                    <View key={hex} style={[styles.swatch, { backgroundColor: hex }]} />
                  ))}
                </View>
                <Text style={styles.cardOrigin}>{item.culturalOrigin} / {item.style}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <Text style={styles.hint}>Long press a card to remove</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#0ea5e9',
    top: -90,
    right: -70,
    opacity: 0.22,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  kicker: { color: '#f59e0b', fontSize: 10, letterSpacing: 3, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: '#f8fafc', fontFamily: 'Georgia' },
  addBtn: { backgroundColor: '#f59e0b', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText: { color: '#0b1220', fontWeight: '800', fontSize: 12, letterSpacing: 0.8 },
  stats: { color: '#93c5fd', fontSize: 12, paddingHorizontal: 20, marginBottom: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#f8fafc', fontWeight: '700' },
  emptySub: { fontSize: 13, color: '#cbd5e1', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  list: { padding: 12, paddingBottom: 40 },
  row: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: '#111b31', borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2b3a55',
  },
  cardImage: { width: '100%', height: 140 },
  cardImagePlaceholder: {
    width: '100%', height: 140, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  cardBody: { padding: 10 },
  cardTitle: { color: '#f8fafc', fontWeight: '700', fontSize: 13, marginBottom: 6 },
  swatchRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#fff2' },
  cardOrigin: { fontSize: 11, color: '#fbbf24' },
  hint: { textAlign: 'center', color: '#64748b', fontSize: 11, paddingBottom: 10 },
});
