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
      <View style={styles.topBar}>
        <View>
          <Text style={styles.kicker}>ARCHIVE</Text>
          <Text style={styles.title}>Cher Closet</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#fbbf24" style={{ marginTop: 60 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👕</Text>
          <Text style={styles.emptyText}>Your closet is empty</Text>
          <Text style={styles.emptySub}>Tap Add to capture your first statement piece</Text>
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
                <Text style={styles.cardOrigin}>{item.culturalOrigin}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <Text style={styles.hint}>Long press an item to remove it</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 3, borderBottomColor: '#2244d4',
    backgroundColor: '#2d1b4e',
  },
  kicker: { color: '#fbbf24', fontSize: 9, letterSpacing: 2, marginBottom: 4, fontWeight: '900' },
  title: { fontSize: 24, fontWeight: '900', color: '#f8fafc', fontFamily: 'Georgia' },
  addBtn: { backgroundColor: '#2244d4', borderRadius: 0, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderColor: '#fbbf24' },
  addBtnText: { color: '#f8fafc', fontWeight: '900', fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#f8fafc', fontWeight: '900' },
  emptySub: { fontSize: 13, color: '#b5c5ff', marginTop: 6, textAlign: 'center', paddingHorizontal: 40, fontWeight: '600' },
  list: { paddingHorizontal: 10, paddingBottom: 40 },
  row: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1, backgroundColor: '#2a2247', borderRadius: 0, overflow: 'hidden',
    borderWidth: 2, borderColor: '#2244d4',
  },
  cardImage: { width: '100%', height: 140 },
  cardImagePlaceholder: {
    width: '100%', height: 140, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2244d4',
  },
  cardBody: { padding: 10, backgroundColor: '#2a2247' },
  cardTitle: { color: '#f8fafc', fontWeight: '900', fontSize: 12, marginBottom: 6 },
  swatchRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  swatch: { width: 16, height: 16, borderRadius: 0, borderWidth: 2, borderColor: '#2244d4' },
  cardOrigin: { fontSize: 10, color: '#fbbf24', fontWeight: '700' },
  hint: { textAlign: 'center', color: '#7a8aaa', fontSize: 10, paddingBottom: 10, fontWeight: '600' },
});
