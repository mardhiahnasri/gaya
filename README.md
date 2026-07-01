# Gaya 👗✨ 
### Your Retro AI-Powered Wardrobe Assistant

A stylish, retro 90s-inspired web and mobile app for managing your wardrobe, getting AI-powered outfit suggestions, and virtually trying on clothes using Gemini AI and computer vision.

![Retro Design](https://img.shields.io/badge/Design-Retro%2090s-fbbf24?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active%20Development-2244d4?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 🎨 Features

- **📸 Smart Clothing Analysis** - Upload a photo of any clothing item, Gemini AI analyzes it and extracts:
  - Clothing type and description
  - Dominant colors with names
  - Fabric type and style
  - Cultural origin and suitability occasions
  
- **✨ AI Outfit Suggestions** - Get personalized outfit recommendations for any occasion with:
  - Gemini AI-powered styling suggestions
  - Color harmony analysis
  - Styling tips and tricks
  - Occasion and cultural context awareness
  
- **🪞 Virtual Try-On** - Preview outfits on your photo using Hugging Face's IDM-VTON model

- **🎭 Color Analysis** - Check color compatibility and harmony for your wardrobe

- **💾 Persistent Wardrobe** - Save all your clothing items and access them anytime

- **🌈 Retro UI Design** - Bold, geometric 90s Cher closet aesthetic with:
  - Square corners everywhere
  - 2-3px cobalt borders
  - Heavy 900-weight typography
  - Bright color palette: `#1a1a2e`, `#2244d4`, `#fbbf24`, `#b5c5ff`

---

## 🏗️ Architecture

```
gaya/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── analyze.js      # Clothing analysis with Gemini
│   │   │   ├── suggest.js      # Outfit suggestions
│   │   │   ├── tryon.js        # Virtual try-on
│   │   │   └── wardrobe.js     # Wardrobe CRUD
│   │   ├── services/
│   │   │   ├── gemini.js       # Gemini API integration
│   │   │   └── virtualTryOn.js # Hugging Face integration
│   │   └── index.js
│   └── Dockerfile
│
├── web/              # React Native Web + Vite
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx          # Home with occasion picker modal
│   │   │   ├── CameraScreen.tsx        # Auto-save clothing items
│   │   │   ├── WardrobeScreen.tsx      # View saved items (2-column grid)
│   │   │   ├── OccasionScreen.tsx      # Pick occasion & cultural context
│   │   │   ├── SuggestionScreen.tsx    # AI outfit suggestions + empty state
│   │   │   ├── ColourScreen.tsx        # Color harmony analysis
│   │   │   └── TryOnScreen.tsx         # Virtual try-on preview
│   │   ├── navigation/AppNavigator.tsx # Bottom tab navigator
│   │   ├── services/api.ts             # Axios API client
│   │   └── constants/config.ts         # Config & occasion data
│   └── Dockerfile
│
├── mobile/           # React Native (iOS/Android compatible)
│   ├── src/          # (Same structure as web)
│   ├── Dockerfile.android
│   └── ios/
│
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI**: Google Gemini API
- **Computer Vision**: Hugging Face IDM-VTON (virtual try-on)
- **Storage**: JSON file persistence (wardrobe.json)

### Frontend
- **Framework**: React Native Web
- **Build Tool**: Vite
- **Navigation**: React Navigation
- **Styling**: React Native StyleSheet
- **Language**: TypeScript
- **HTTP**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **API Port**: 5050 (backend)
- **Web Port**: 5173 (Vite dev server)

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development without Docker)
- Google Gemini API key
- (Optional) Hugging Face token for virtual try-on

### 1. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
HF_TOKEN=your_huggingface_token_optional
```

### 2. Start with Docker
```bash
docker compose up --build
```

- **Backend**: http://localhost:5050
- **Frontend**: http://localhost:5173

### 3. Or Run Locally

**Backend:**
```bash
cd backend
npm install
GEMINI_API_KEY=your_key node src/index.js
```

**Frontend:**
```bash
cd web
npm install
npm run dev
```

---

## 📱 Usage

### 1. **Add Clothing** 👕
- Navigate to "Add Clothes" tab
- Take photo or upload from gallery
- Gemini AI analyzes the item
- **Automatically saved** to your wardrobe
- Choose "Continue Shopping" or "Go to Wardrobe"

### 2. **Get Outfit Ideas** ✨
- From Home screen, tap "Get Outfit Ideas"
- Select occasion and cultural context in the modal
- If wardrobe is empty, either:
  - Add real clothing items, OR
  - Try demo with sample outfits
- View AI-generated suggestions with color harmony and styling tips

### 3. **Check Your Wardrobe** 👗
- View all saved items in 2-column grid
- Long-press to delete items
- Add button to quickly add more clothing

### 4. **Analyze Colors** 🎨
- Input hex color codes
- Use preset cultural palettes (Hari Raya, CNY, Deepavali, etc.)
- Get compatibility scores and suggestions

### 5. **Virtual Try-On** 🪞
- Upload your full-body photo
- Select garments from wardrobe
- See how they look on you
- Get fit notes and styling suggestions

---

## 🎨 Retro UI Design System

### Color Palette
- **Base Background**: `#1a1a2e` (Charcoal)
- **Header Background**: `#2d1b4e` (Purple)
- **Card Background**: `#2a2247` (Medium Purple)
- **Primary Action**: `#2244d4` (Cobalt Blue)
- **Text Accent**: `#b5c5ff` (Bright Indigo)
- **Highlight**: `#fbbf24` (Amber Gold)
- **Primary Text**: `#f8fafc` (Off-white)

### Typography
- **Headers/Titles**: Font weight 900 (very heavy)
- **Body text**: Font weight 600-700
- **Font family**: Georgia for brand text, system font for UI

### Geometry
- **Border Radius**: 0 everywhere (hard square corners)
- **Border Width**: 2-3px (bold, prominent)
- **Active States**: Cobalt background with amber border

### Components
- Action buttons: Cobalt (#2244d4) with amber border
- Secondary buttons: Transparent with cobalt border
- Cards: Medium purple (#2a2247) with cobalt borders
- Tab bar: 3px cobalt top border, height 80px

---

## 📁 Project Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx          # Landing page with action cards + occasion modal
│   ├── CameraScreen.tsx        # Photo upload & auto-save to wardrobe
│   ├── WardrobeScreen.tsx      # Grid view of saved clothing items
│   ├── OccasionScreen.tsx      # Occasion and cultural context picker
│   ├── SuggestionScreen.tsx    # AI outfit suggestions + empty state with actions
│   ├── ColourScreen.tsx        # Color analysis and harmony checker
│   └── TryOnScreen.tsx         # Virtual try-on interface
├── navigation/
│   └── AppNavigator.tsx        # Bottom tab navigation with 4 tabs
├── services/
│   └── api.ts                  # Axios API client with all endpoints
├── constants/
│   └── config.ts               # API config, occasions, cultural contexts
├── mocks/
│   ├── react-native-image-picker.web.ts
│   └── react-native-reanimated.web.ts
└── App.tsx / main.tsx
```

---

## 🔌 API Endpoints

### Analyze
- `POST /api/analyze/clothing` - Analyze a clothing item
- `POST /api/analyze/colours` - Analyze color compatibility

### Suggest
- `POST /api/suggest/outfits` - Get outfit suggestions for occasion

### Wardrobe
- `GET /api/wardrobe` - Fetch all wardrobe items
- `POST /api/wardrobe` - Add item to wardrobe
- `DELETE /api/wardrobe/:id` - Remove item from wardrobe

### Virtual Try-On
- `POST /api/tryon/preview` - Generate try-on preview

---

## 💾 Data Persistence

- **Wardrobe items** stored in `backend/wardrobe.json` (persists across restarts)
- **Uploads** stored in `backend/uploads/` (if configured)
- Frontend uses in-memory state + API calls

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙌 Acknowledgments

- **Gemini API** for AI clothing analysis and outfit suggestions
- **Hugging Face** for the IDM-VTON virtual try-on model
- **React Native** community for cross-platform components
- Inspired by 90s fashion and Cher Horowitz's iconic closet scene

---

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with details
3. Include screenshots if applicable

---

**Made with ❤️ by Mardhiah Najwa**

*Dress me. 👗✨*
