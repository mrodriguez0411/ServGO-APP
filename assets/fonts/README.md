# Fonts

This directory should contain the following font files:

1. `SpaceGrotesk-Bold.ttf` - Bold weight of Space Grotesk font
2. `DMSans-Regular.ttf` - Regular weight of DM Sans font
3. `DMSans-Medium.ttf` - Medium weight of DM Sans font

## How to add fonts:

1. Download the required font files (ensure you have the proper license)
2. Place them in this directory
3. The app will automatically load them on startup

## Alternative: Using Google Fonts (recommended)

You can also use the `@expo-google-fonts` packages instead of local font files by updating the `App.tsx` file to use:

```typescript
import {
  useFonts,
  SpaceGrotesk_700Bold,
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dev';

// Then in your component:
const [fontsLoaded] = useFonts({
  'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
  'DMSans-Regular': DMSans_400Regular,
  'DMSans-Medium': DMSans_500Medium,
});
```

Then install the required packages:
```bash
npx expo install @expo-google-fonts/space-grotesk @expo-google-fonts/dm-sans
```
