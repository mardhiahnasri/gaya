import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProfile, saveProfile } from '../services/api';
import type { Profile } from '../services/api';
import { pickImage } from '../lib/image';
import { Busy, Button, Card, Label, Notice, Segmented, Select, layout } from '../components/ui';
import { colors, radius, type } from '../theme';

type Fields = Omit<Profile, 'bodyPhoto'>;

const opts = <T extends string>(values: readonly T[], labels: Partial<Record<T, string>> = {}) =>
  values.map((v) => ({ value: v, label: labels[v] ?? v }));

const SHAPES = opts(['not-sure', 'hourglass', 'pear', 'apple', 'rectangle', 'inverted-triangle'] as const, { 'not-sure': 'Not sure', 'inverted-triangle': 'inverted triangle' });
const AGES = opts(['', 'teen', '20s', '30s', '40s', '50s+'] as const, { '': 'Not set' });
const GENDERS = opts(['', 'female', 'male', 'non-binary'] as const, { '': 'Not set' });
const BUDGETS = opts(['', 'low', 'mid', 'high'] as const, { '': 'Not set' });
const SEASONS = opts(['', 'Spring', 'Summer', 'Autumn', 'Winter'] as const, { '': 'Not set' });
const MODESTY = [
  { value: 'none' as const, label: 'Any' },
  { value: 'modest' as const, label: 'Modest' },
  { value: 'hijab' as const, label: 'Hijab' },
];

const toFields = ({ bodyPhoto: _photo, ...rest }: Profile): Fields => rest;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <Label>{label}</Label>
      {children}
    </View>
  );
}

export function ProfileScreen() {
  const [saved, setSaved] = useState<Profile | null>(null);
  const [form, setForm] = useState<Fields | null>(null);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProfile()
        .then((p) => {
          setSaved(p);
          setForm(toFields(p));
          setNewPhoto(null);
          setRemovePhoto(false);
          setError(null);
        })
        .catch(() => setError('Could not load your profile. Is the backend running?'));
    }, [])
  );

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setOk(false);
  };
  const num = (v: string) => (v.trim() === '' ? null : Number(v));

  const takePhoto = async (source: 'camera' | 'gallery') => {
    const img = await pickImage(source, 1200);
    if (img) {
      setNewPhoto(img.dataUrl);
      setRemovePhoto(false);
      setOk(false);
    }
  };

  const submit = async () => {
    if (!form) return;
    setBusy(true);
    setError(null);
    try {
      const patch: Partial<Profile> = { ...form };
      if (newPhoto) patch.bodyPhoto = newPhoto;
      else if (removePhoto) patch.bodyPhoto = null;
      const next = await saveProfile(patch);
      setSaved(next);
      setForm(toFields(next));
      setNewPhoto(null);
      setRemovePhoto(false);
      setOk(true);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  const photo = newPhoto ?? (removePhoto ? null : saved?.bodyPhoto ?? null);

  return (
    <SafeAreaView style={layout.screen} edges={['top']}>
      <ScrollView contentContainerStyle={layout.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View>
          <Text style={type.h1}>Profile</Text>
          <Text style={type.small}>Used for try-on, fit checks and outfit scoring.</Text>
        </View>

        {error && <Notice tone="error">{error}</Notice>}
        {ok && <Notice>Profile saved.</Notice>}

        {!form ? (
          !error && <Busy message="Loading profile" />
        ) : (
          <>
            <Card>
              <Text style={type.h3}>Body photo</Text>
              <View style={s.photo}>
                {photo ? <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="contain" /> : <Text style={type.small}>Standing, facing the camera, plain background</Text>}
              </View>
              <View style={layout.row}>
                <Button title="Camera" onPress={() => takePhoto('camera')} style={{ flex: 1 }} />
                <Button title="Gallery" onPress={() => takePhoto('gallery')} style={{ flex: 1 }} />
              </View>
              {photo && (
                <TouchableOpacity
                  onPress={() => {
                    setNewPhoto(null);
                    setRemovePhoto(true);
                    setOk(false);
                  }}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Text style={[type.small, { color: colors.muted }]}>Remove photo</Text>
                </TouchableOpacity>
              )}
            </Card>

            <Card>
              <Text style={type.h3}>Style</Text>
              <View>
                <Label>Modesty</Label>
                <Segmented value={form.modesty} options={MODESTY} onChange={(v) => set('modesty', v)} />
              </View>
              <View>
                <Label>Culture / region</Label>
                <TextInput style={s.input} value={form.region} maxLength={40} placeholder="e.g. Malay, Kuala Lumpur" placeholderTextColor={colors.muted} onChangeText={(v) => set('region', v)} />
              </View>
              <View style={layout.row}>
                <Field label="Budget">
                  <Select value={form.budget ?? ''} options={BUDGETS} onChange={(v) => set('budget', (v || null) as Fields['budget'])} />
                </Field>
                <Field label="Colour season">
                  <Select value={form.colourSeason} options={SEASONS} onChange={(v) => set('colourSeason', v)} />
                </Field>
              </View>
            </Card>

            <Card>
              <Text style={type.h3}>About you</Text>
              <View style={layout.row}>
                <Field label="Gender">
                  <Select value={form.gender ?? ''} options={GENDERS} onChange={(v) => set('gender', (v || null) as Fields['gender'])} />
                </Field>
                <Field label="Age group">
                  <Select value={form.ageGroup ?? ''} options={AGES} onChange={(v) => set('ageGroup', (v || null) as Fields['ageGroup'])} />
                </Field>
              </View>
              <View>
                <Label>Body shape</Label>
                <Select value={form.bodyShape} options={SHAPES} onChange={(v) => set('bodyShape', v)} />
              </View>
            </Card>

            <Card>
              <Text style={type.h3}>Measurements and sizes</Text>
              <View style={layout.row}>
                <Field label="Height (cm)">
                  <TextInput style={s.input} keyboardType="numeric" value={form.heightCm?.toString() ?? ''} maxLength={3} onChangeText={(v) => set('heightCm', num(v))} />
                </Field>
                <Field label="Weight (kg)">
                  <TextInput style={s.input} keyboardType="numeric" value={form.weightKg?.toString() ?? ''} maxLength={3} onChangeText={(v) => set('weightKg', num(v))} />
                </Field>
              </View>
              <View style={layout.row}>
                <Field label="Top">
                  <TextInput style={s.input} value={form.topSize} maxLength={10} placeholder="M" placeholderTextColor={colors.muted} onChangeText={(v) => set('topSize', v)} />
                </Field>
                <Field label="Bottom">
                  <TextInput style={s.input} value={form.bottomSize} maxLength={10} placeholder="L" placeholderTextColor={colors.muted} onChangeText={(v) => set('bottomSize', v)} />
                </Field>
                <Field label="Shoes">
                  <TextInput style={s.input} value={form.shoeSize} maxLength={10} placeholder="38" placeholderTextColor={colors.muted} onChangeText={(v) => set('shoeSize', v)} />
                </Field>
              </View>
              <Text style={type.small}>Items with a different size than yours get a fit warning in the studio.</Text>
            </Card>

            <Button title="Save profile" variant="primary" loading={busy} onPress={submit} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  photo: { height: 260, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 12 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text },
});
