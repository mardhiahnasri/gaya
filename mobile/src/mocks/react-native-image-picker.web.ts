// Web polyfill for react-native-image-picker.
// Uses a hidden <input type="file"> instead of the native camera/gallery.

function openFilePicker(callback: (response: any) => void, capture?: string) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  if (capture) input.setAttribute('capture', capture);

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) {
      callback({ didCancel: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      callback({
        assets: [
          {
            uri: URL.createObjectURL(file),
            base64,
            fileName: file.name,
            type: file.type,
          },
        ],
      });
    };
    reader.readAsDataURL(file);
  };

  input.click();
}

export function launchCamera(_options: any, callback: (response: any) => void) {
  openFilePicker(callback, 'environment');
}

export function launchImageLibrary(_options: any, callback: (response: any) => void) {
  openFilePicker(callback);
}
