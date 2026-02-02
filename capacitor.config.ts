import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psingnio.quiz',
  appName: 'personality-quiz',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '371284904600-40l8dqsed8n6qgedgrgo8fqnl0enimvf.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      androidClientId: '371284904600-40l8dqsed8n6qgedgrgo8fqnl0enimvf.apps.googleusercontent.com',
    },
  },
};

export default config;
