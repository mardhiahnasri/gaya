// Android emulator: 10.0.2.2 routes to the host machine where Docker backend is running.
// Physical device: replace with your machine's LAN IP e.g. http://192.168.1.x:5050
export const API_BASE_URL = 'http://10.0.2.2:5050';

export const OCCASIONS = [
  { id: 'hari_raya', label: 'Hari Raya Aidilfitri', emoji: '🌙', culture: 'Malay' },
  { id: 'hari_raya_haji', label: 'Hari Raya Aidiladha', emoji: '🐑', culture: 'Malay' },
  { id: 'cny', label: 'Chinese New Year', emoji: '🧧', culture: 'Chinese' },
  { id: 'deepavali', label: 'Deepavali', emoji: '🪔', culture: 'Indian' },
  { id: 'thaipusam', label: 'Thaipusam', emoji: '🙏', culture: 'Indian' },
  { id: 'vesak', label: 'Vesak Day', emoji: '☸️', culture: 'Buddhist' },
  { id: 'wedding_malay', label: 'Malay Wedding', emoji: '💍', culture: 'Malay' },
  { id: 'wedding_chinese', label: 'Chinese Wedding', emoji: '🍾', culture: 'Chinese' },
  { id: 'wedding_indian', label: 'Indian Wedding', emoji: '🌺', culture: 'Indian' },
  { id: 'wedding_western', label: 'Western Wedding', emoji: '👗', culture: 'Western' },
  { id: 'formal_work', label: 'Formal / Office', emoji: '💼', culture: 'General' },
  { id: 'casual', label: 'Casual Day Out', emoji: '☀️', culture: 'General' },
  { id: 'night_out', label: 'Night Out', emoji: '🌃', culture: 'General' },
  { id: 'beach', label: 'Beach / Resort', emoji: '🏖️', culture: 'General' },
  { id: 'sports', label: 'Sports / Active', emoji: '🏃', culture: 'General' },
  { id: 'funeral', label: 'Funeral / Condolence', emoji: '🖤', culture: 'General' },
];

export const CULTURAL_CONTEXTS = [
  { id: 'any', label: 'Any / Mixed' },
  { id: 'malay', label: 'Malay / Muslim' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'indian', label: 'Indian / Hindu' },
  { id: 'western', label: 'Western' },
];
