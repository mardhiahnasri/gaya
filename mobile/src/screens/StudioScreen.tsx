import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OCCASIONS } from '../constants/config';
import { getProfile, getWardrobe, matchOutfits, renderOutfit, reviewOutfit, saveProfile, scoreOutfit } from '../services/api';
import type { MatchedOutfit, OutfitRender, OutfitReview, OutfitScore, StyleProfile, WardrobeItem } from '../services/api';
import { pickImage } from '../lib/image';
import { SECTIONS, categoryOf, scoreTone, toggleItem } from '../lib/outfit';
import { Busy, Button, Card, Label, Notice, ScorePill, Segmented, Select, layout } from '../components/ui';
import { colors, radius, type } from '../theme';

const OCCASION_OPTIONS = OCCASIONS.map((o) => ({ value: o.id, label: `${o.emoji} ${o.label}` }));
const PROFILE_OPTIONS: { value: StyleProfile; label: string }[] = [
  { value: 'none', label: 'Any' },
  { value: 'modest', label: 'Modest' },
  { value: 'hijab', label: 'Hijab' },
];

function Thumb({ item, size }: { item?: WardrobeItem; size: number }) {
  const box = { width: size, height: size * 1.25, borderRadius: 8 };
  return item?.imageUri ? (
    <Image source={{ uri: item.imageUri }} style={[box, s.thumb]} />
  ) : (
    <View style={[box, s.thumb, s.thumbPh]}>
      <Text style={{ color: colors.muted, fontWeight: '600', textTransform: 'uppercase' }}>{item?.type?.[0]}</Text>
    </View>
  );
}

export function StudioScreen() {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[] | null>(null);
  const [occasion, setOccasion] = useState('casual');
  const [profile, setProfileState] = useState<StyleProfile>('none');
  const [selected, setSelected] = useState<string[]>([]);
  const [matches, setMatches] = useState<MatchedOutfit[] | null>(null);
  const [matching, setMatching] = useState(false);
  const [rules, setRules] = useState<OutfitScore | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [render, setRender] = useState<OutfitRender | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<OutfitReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  useFocusEffect(
    useCallback(() => {
      getWardrobe()
        .then((items) => {
          setWardrobe(items);
          setSelected((ids) => ids.filter((id) => items.some((i) => i.id === id)));
        })
        .catch(() => setError('Could not load your wardrobe. Is the backend running?'));
      getProfile()
        .then((p) => {
          setProfileState(p.modesty);
          setBody(p.bodyPhoto);
        })
        .catch(() => {});
    }, [])
  );

  const byId = useMemo(() => new Map((wardrobe ?? []).map((i) => [i.id, i])), [wardrobe]);
  const picked = selected.map((id) => byId.get(id)).filter((i): i is WardrobeItem => Boolean(i));

  // Any change to the outfit invalidates the previous render and review; the rules re-run live.
  useEffect(() => {
    runId.current++;
    setRender(null);
    setReview(null);
    setRendering(false);
    setReviewing(false);
    if (selected.length === 0) {
      setRules(null);
      return;
    }
    const t = setTimeout(() => {
      scoreOutfit(selected, occasion, profile).then(setRules).catch(() => setRules(null));
    }, 200);
    return () => clearTimeout(t);
  }, [selected, occasion, profile]);

  const autoMatch = async () => {
    setMatching(true);
    setError(null);
    try {
      setMatches(await matchOutfits(occasion, profile));
    } catch {
      setError('Could not match outfits.');
    } finally {
      setMatching(false);
    }
  };

  const setProfile = (modesty: StyleProfile) => {
    setProfileState(modesty);
    saveProfile({ modesty }).catch(() => setError('Could not save your style profile.'));
  };

  // The body photo lives in the backend profile so web and mobile share it.
  const pickBody = async (source: 'camera' | 'gallery') => {
    const img = await pickImage(source, 1200);
    if (!img) return;
    try {
      setBody((await saveProfile({ bodyPhoto: img.dataUrl })).bodyPhoto);
    } catch {
      setError('Could not save your body photo.');
    }
  };

  const removeBody = async () => {
    setBody(null);
    await saveProfile({ bodyPhoto: null }).catch(() => setError('Could not remove your body photo.'));
  };

  const tryOn = async () => {
    if (!body || selected.length === 0) return;
    const id = ++runId.current;
    setRendering(true);
    setError(null);
    setRender(null);
    setReview(null);
    try {
      const result = await renderOutfit(selected, occasion);
      if (id !== runId.current) return;
      setRender(result);
      if (result.status !== 'ready' || !result.previewImageBase64) {
        setError('The try-on service is unavailable right now. Try again in a few minutes.');
        return;
      }
      setRendering(false);
      setReviewing(true);
      try {
        const r = await reviewOutfit({ base64: result.previewImageBase64, mimeType: 'image/jpeg' }, selected, occasion, profile, result.tryonId);
        if (id === runId.current) setReview(r);
      } catch {
        if (id === runId.current) setError('The try-on worked, but the stylist review failed. Check that the AI model is running.');
      }
    } catch {
      if (id === runId.current) setError('Try-on failed. The free Hugging Face Space may be busy, so try again shortly.');
    } finally {
      if (id === runId.current) {
        setRendering(false);
        setReviewing(false);
      }
    }
  };

  const empty = wardrobe !== null && wardrobe.length === 0;

  return (
    <SafeAreaView style={layout.screen} edges={['top']}>
      <ScrollView contentContainerStyle={layout.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={type.h1}>Outfit studio</Text>
          <Text style={type.small}>Mix and match what you own, then see it on you.</Text>
        </View>

        {empty && <Notice>Your wardrobe is empty. Add some pieces first.</Notice>}
        {error && <Notice tone="error">{error}</Notice>}

        <Card>
          <View>
            <Label>Occasion</Label>
            <Select
              value={occasion}
              options={OCCASION_OPTIONS}
              onChange={(v) => {
                setOccasion(v);
                setMatches(null);
              }}
            />
          </View>
          <View>
            <Label>Style profile</Label>
            <Segmented
              value={profile}
              options={PROFILE_OPTIONS}
              onChange={(v) => {
                setProfile(v);
                setMatches(null);
              }}
            />
          </View>
        </Card>

        <Card>
          <View style={layout.rowBetween}>
            <Text style={type.h3}>Suggested for you</Text>
            <Button title="Auto-match" loading={matching} disabled={empty} onPress={autoMatch} />
          </View>
          {matches === null && <Text style={type.small}>Builds outfits from your wardrobe and ranks them by fashion rules{profile === 'hijab' ? ' and hijab / modest dressing' : profile === 'modest' ? ' and modest dressing' : ''}.</Text>}
          {matches?.length === 0 && <Text style={type.small}>No complete outfits yet. You need a top and bottom, or a dress{profile !== 'none' ? ', that meet your style profile' : ''}.</Text>}
          {matches?.map((m, idx) => {
            const active = m.itemIds.join() === selected.join();
            return (
              <TouchableOpacity key={idx} activeOpacity={0.8} onPress={() => setSelected(m.itemIds)} style={[s.match, active && s.matchActive]}>
                <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
                  {m.itemIds.map((id) => (
                    <Thumb key={id} item={byId.get(id)} size={44} />
                  ))}
                </View>
                <ScorePill score={m.score} tone={scoreTone(m.score)} />
              </TouchableOpacity>
            );
          })}
        </Card>

        <Card>
          <Text style={type.h3}>Your wardrobe</Text>
          {SECTIONS.map((sec) => {
            const items = (wardrobe ?? []).filter((i) => categoryOf(i) === sec.id);
            if (items.length === 0) return null;
            return (
              <View key={sec.id}>
                <Label>{sec.label}</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {items.map((item) => {
                    const on = selected.includes(item.id);
                    return (
                      <TouchableOpacity key={item.id} activeOpacity={0.8} onPress={() => setSelected((ids) => toggleItem(ids, item, byId))} style={[s.pick, on && s.pickOn]}>
                        <Thumb item={item} size={80} />
                        <Text style={[type.small, { width: 80, fontSize: 12 }]} numberOfLines={1}>{item.type}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            );
          })}
        </Card>

        <Card>
          <View style={layout.rowBetween}>
            <Text style={type.h3}>Current outfit</Text>
            {selected.length > 0 && (
              <TouchableOpacity onPress={() => setSelected([])}>
                <Text style={type.small}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {picked.length === 0 ? (
            <Text style={type.small}>Pick pieces from your wardrobe, or choose a suggestion.</Text>
          ) : (
            <View style={layout.row}>
              {picked.map((p) => (
                <View key={p.id} style={s.piece}>
                  <Text style={{ fontSize: 13, color: colors.text, textTransform: 'capitalize' }}>{p.type}</Text>
                </View>
              ))}
            </View>
          )}
          {rules && (
            <>
              <View style={layout.row}>
                <ScorePill big score={rules.score} tone={scoreTone(rules.score)} />
                <Text style={type.small}>Fashion check{profile !== 'none' ? ` · ${profile} profile` : ''}</Text>
              </View>
              {rules.checks.map((c) => (
                <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={[s.dot, { backgroundColor: c.status === 'pass' ? colors.pass : c.status === 'warn' ? colors.warn : colors.danger }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[type.body, { fontWeight: '600' }]}>{c.label}</Text>
                    <Text style={type.small}>{c.detail}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </Card>

        <Card>
          <Text style={type.h3}>Try it on</Text>
          <View style={s.body}>
            {body ? <Image source={{ uri: body }} style={{ width: '100%', height: '100%' }} resizeMode="contain" /> : <Text style={type.small}>Add a full-body photo, standing, plain background</Text>}
          </View>
          <View style={layout.row}>
            <Button title="Camera" onPress={() => pickBody('camera')} style={{ flex: 1 }} />
            <Button title="Gallery" onPress={() => pickBody('gallery')} style={{ flex: 1 }} />
          </View>
          {body && (
            <TouchableOpacity onPress={removeBody} style={{ alignSelf: 'flex-start' }}>
              <Text style={type.small}>Remove photo</Text>
            </TouchableOpacity>
          )}
          {rendering ? <Busy message="Dressing you in this outfit. This can take a few minutes" /> : <Button title="Try on my body" variant="primary" disabled={!body || selected.length === 0 || reviewing} onPress={tryOn} />}
          {render?.previewImageBase64 && <Image source={{ uri: `data:image/jpeg;base64,${render.previewImageBase64}` }} style={s.result} resizeMode="contain" />}
          {render?.warnings.map((w, i) => <Notice key={i}>{w}</Notice>)}
          {reviewing && <Busy message="Stylist is reviewing the look" />}
          {review && (
            <View style={{ gap: 12 }}>
              <View style={layout.row}>
                <ScorePill big score={review.score} suffix="/10" tone={scoreTone(review.score * 10)} />
                <Text style={[type.body, { fontWeight: '600', flex: 1 }]}>{review.verdict}</Text>
              </View>
              {([['Works well', review.strengths], ['Could be better', review.issues], ['Try this', review.swaps]] as const).map(([title, list]) =>
                list?.length ? (
                  <View key={title}>
                    <Label>{title}</Label>
                    {list.map((t, i) => <Text key={i} style={[type.body, { marginBottom: 4 }]}>• {t}</Text>)}
                  </View>
                ) : null
              )}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  thumb: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  thumbPh: { alignItems: 'center', justifyContent: 'center' },
  match: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  matchActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  pick: { gap: 4, padding: 3, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  pickOn: { borderColor: colors.accent },
  piece: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  body: { height: 260, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 12 },
  result: { width: '100%', height: 420, borderRadius: radius.md, backgroundColor: colors.bg },
});
