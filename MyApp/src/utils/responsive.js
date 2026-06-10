import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;

const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;

const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const rf = (size) => {
  if (Platform.OS === 'web') {
    const ratio = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.4);
    return Math.round(size * ratio);
  }
  const newSize = moderateScale(size);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const rw = (percent) => (SCREEN_WIDTH * percent) / 100;
export const rh = (percent) => (SCREEN_HEIGHT * percent) / 100;