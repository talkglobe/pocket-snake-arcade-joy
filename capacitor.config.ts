
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.pocketsnakearcadejoy',
  appName: 'Snake Game',
  webDir: 'dist',
  server: {
    url: 'https://3c79a023-7d46-48ba-b9e3-0a07dce42b7b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#111827",
      showSpinner: false
    }
  }
};

export default config;
