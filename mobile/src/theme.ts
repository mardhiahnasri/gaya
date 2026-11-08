import { Platform } from 'react-native';

export const colors = {
  bg: '#f6f3ea',
  surface: '#fffdf8',
  border: '#e6e1d2',
  borderStrong: '#cfc8b4',
  text: '#25291f',
  muted: '#6f7566',
  accent: '#4f6b4a',
  accentStrong: '#3b5238',
  accentSoft: '#e5ecdc',
  accentLine: '#c9d8bd',
  danger: '#a8432f',
  dangerSoft: '#f8e8e3',
  pass: '#3d7a3a',
  passSoft: '#e3eed9',
  warn: '#b07a14',
  warnSoft: '#f6ecd0',
};

export const radius = { sm: 12, md: 16, pill: 999 };

export const shadow = {
  shadowColor: '#25291f',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export const fonts = {
  display: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
};

export const type = {
  h1: { fontFamily: fonts.display, fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5, color: colors.text },
  h3: { fontFamily: fonts.display, fontSize: 17, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text },
  small: { fontSize: 13, color: colors.muted },
  label: { fontSize: 11, fontWeight: '600' as const, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase' as const },
};

