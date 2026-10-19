import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AyahBadgeProps {
  number: string;
  size?: number;
}

export const AyahBadge: React.FC<AyahBadgeProps> = ({ number, size = 26 }) => {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.number,
          {
            fontSize: Math.max(10, Math.round(size * 0.44)),
          },
        ]}
      >
        {number}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.4,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    verticalAlign: 'middle',
  },
  number: {
    color: '#34D399',
    fontWeight: '700',
    fontFamily: 'NotoSansBengali_700Bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
