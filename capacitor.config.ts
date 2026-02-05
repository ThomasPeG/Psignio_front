import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psingnio.quiz',
  appName: 'Psignio',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '661874119102-pnb89egen6einv28aetiftfrmpcmdi2h.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      androidClientId: '661874119102-16ijj8ep08k9umoll7ssbrf4v5tmdnls.apps.googleusercontent.com',
      iosClientId: '661874119102-pnb89egen6einv28aetiftfrmpcmdi2h.apps.googleusercontent.com',
    },
  },
};

export default config;
