import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radius, shadow, type } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={[type.label, { marginBottom: 8 }]}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  variant = 'default',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'primary';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const primary = variant === 'primary';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[s.btn, primary && s.btnPrimary, (disabled || loading) && { opacity: 0.5 }, style]}
    >
      {loading ? <ActivityIndicator size="small" color={primary ? '#fff' : colors.accent} /> : null}
      <Text style={[s.btnText, primary && { color: '#fff' }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: colors.accentStrong, fontWeight: '600' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'error' }) {
  const error = tone === 'error';
  return (
    <View style={[s.notice, error ? s.noticeError : s.noticeInfo]}>
      <Text style={{ color: error ? colors.danger : colors.accentStrong, fontSize: 14 }}>{children}</Text>
    </View>
  );
}

export function ScorePill({ score, tone, suffix, big }: { score: number; tone: 'pass' | 'warn' | 'fail'; suffix?: string; big?: boolean }) {
  const bg = { pass: colors.passSoft, warn: colors.warnSoft, fail: colors.dangerSoft }[tone];
  const fg = { pass: colors.pass, warn: colors.warn, fail: colors.danger }[tone];
  return (
    <View style={[s.pill, { backgroundColor: bg }, big && { paddingVertical: 6, paddingHorizontal: 18 }]}>
      <Text style={{ color: fg, fontWeight: '700', fontSize: big ? 26 : 14, fontFamily: big ? fonts.display : undefined }}>
        {score}
        {suffix ? <Text style={{ fontSize: 12, fontWeight: '500' }}>{suffix}</Text> : null}
      </Text>
    </View>
  );
}

/** Progress note with elapsed seconds, since a local AI model can take a minute or more. */
export function Busy({ message }: { message: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={s.busy}>
      <ActivityIndicator size="small" color={colors.accent} />
      <Text style={{ color: colors.accentStrong, fontSize: 14, flex: 1 }}>
        {message} ({seconds}s)
      </Text>
    </View>
  );
}

export interface Option<T extends string> {
  value: T;
  label: string;
}

/** Minimal dropdown: a flat field that opens a bottom sheet list. */
export function Select<T extends string>({
  value,
  options,
  onChange,
  compact,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  const caps = compact ? ('capitalize' as const) : ('none' as const);
  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setOpen(true)} style={[s.select, compact && { paddingVertical: 6 }]}>
        <Text style={[type.body, compact && { fontSize: 13 }, { flex: 1, textTransform: caps }]} numberOfLines={1}>
          {current?.label ?? value}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>⌄</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => {
                const on = item.value === value;
                return (
                  <TouchableOpacity
                    style={[s.option, on && { backgroundColor: colors.accentSoft }]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[type.body, { textTransform: caps }, on && { color: colors.accentStrong, fontWeight: '600' }]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <View style={s.segmented}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <TouchableOpacity key={o.value} activeOpacity={0.8} onPress={() => onChange(o.value)} style={[s.segment, on && s.segmentOn]}>
            <Text style={{ fontSize: 13, fontWeight: on ? '600' : '500', color: on ? colors.accentStrong : colors.muted }}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const layout = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
});

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 12, ...shadow },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  btnPrimary: { backgroundColor: colors.accent, borderColor: colors.accent, shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  btnText: { fontSize: 15, fontWeight: '600', color: colors.text },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { fontSize: 14, color: colors.text },
  notice: { borderRadius: radius.sm, padding: 12, borderWidth: 1 },
  noticeInfo: { backgroundColor: colors.accentSoft, borderColor: colors.accentLine },
  noticeError: { backgroundColor: colors.dangerSoft, borderColor: '#efcfc5' },
  pill: { alignSelf: 'flex-start', minWidth: 38, alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.sm, backgroundColor: colors.accentSoft },
  select: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(37,41,31,0.35)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '60%', backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 8 },
  option: { paddingVertical: 14, paddingHorizontal: 20 },
  segmented: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.pill, padding: 4, borderWidth: 1, borderColor: colors.border },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill },
  segmentOn: { backgroundColor: colors.surface, ...shadow },
});
