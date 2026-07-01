import React from 'react';
import { View, StyleSheet } from 'react-native';

const SPOTS = [
  { top: 12, left: 8, w: 24, h: 18 },
  { top: 48, left: 30, w: 20, h: 14 },
  { top: 82, left: 10, w: 26, h: 18 },
  { top: 126, left: 36, w: 22, h: 16 },
  { top: 164, left: 8, w: 24, h: 18 },
  { top: 206, left: 28, w: 20, h: 14 },
  { top: 244, left: 10, w: 26, h: 18 },
  { top: 288, left: 34, w: 22, h: 16 },
  { top: 326, left: 8, w: 24, h: 18 },
  { top: 366, left: 30, w: 20, h: 14 },
  { top: 404, left: 10, w: 26, h: 18 },
  { top: 446, left: 34, w: 22, h: 16 },
  { top: 486, left: 10, w: 24, h: 18 },
  { top: 524, left: 30, w: 20, h: 14 },
  { top: 564, left: 12, w: 26, h: 18 },
  { top: 604, left: 34, w: 22, h: 16 },
];

function SideStrip({ right }: { right?: boolean }) {
  return (
    <View style={[styles.strip, right ? styles.right : styles.left]}>
      {SPOTS.map((spot, idx) => (
        <View
          key={`${right ? 'r' : 'l'}-${idx}`}
          style={[
            styles.spot,
            {
              top: spot.top,
              left: spot.left,
              width: spot.w,
              height: spot.h,
              transform: [{ rotate: `${(idx % 5) * 7 - 10}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

export function LeopardSides() {
  return (
    <>
      <SideStrip />
      <SideStrip right />
    </>
  );
}

const styles = StyleSheet.create({
  strip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 66,
    backgroundColor: '#d9b89a',
    borderColor: '#7d5f4b',
    borderWidth: 1,
    overflow: 'hidden',
  },
  left: { left: 0 },
  right: { right: 0 },
  spot: {
    position: 'absolute',
    backgroundColor: '#7d4238',
    borderRadius: 16,
    opacity: 0.82,
  },
});
