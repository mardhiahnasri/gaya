import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export interface PickedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
}

/** Opens the camera or gallery and resolves with a downsized image, or null if cancelled. */
export function pickImage(source: 'camera' | 'gallery', maxSize = 1024): Promise<PickedImage | null> {
  const launcher = source === 'camera' ? launchCamera : launchImageLibrary;
  return new Promise((resolve) => {
    launcher(
      { mediaType: 'photo', includeBase64: true, maxWidth: maxSize, maxHeight: maxSize, quality: 0.8 },
      (response) => {
        if (response.didCancel) return resolve(null);
        if (response.errorCode) {
          Alert.alert('Could not open photos', response.errorMessage || 'Please check app permissions.');
          return resolve(null);
        }
        const asset = response.assets?.[0];
        if (!asset?.base64) {
          Alert.alert('Image error', 'Could not read that image.');
          return resolve(null);
        }
        const mimeType = asset.type || 'image/jpeg';
        resolve({ base64: asset.base64, mimeType, dataUrl: `data:${mimeType};base64,${asset.base64}` });
      }
    );
  });
}
