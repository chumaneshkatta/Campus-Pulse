import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const demoEntityCollection = () => ({
  list: async () => [],
  filter: async () => [],
  get: async () => null,
  update: async () => null,
  updateMany: async () => ({ ok: true }),
  subscribe: () => () => {},
});

const demoBase44 = {
  auth: {
    me: async () => ({
      id: 'local-demo-user',
      full_name: 'Demo Athlete',
      email: 'demo@unisport.local',
    }),
    redirectToLogin: () => null,
    setToken: () => null,
    loginWithProvider: () => null,
    resetPasswordRequest: async () => null,
    register: async () => null,
    verifyOtp: async () => ({ access_token: 'demo-token' }),
    resendOtp: async () => null,
    resetPassword: async () => null,
  },
  entities: new Proxy({}, {
    get: (_, entityName) => {
      if (typeof entityName === 'string') {
        return demoEntityCollection();
      }
      return demoEntityCollection();
    },
  }),
};

// Create a real client only when the app is configured; otherwise keep a safe local-demo client
export const base44 = appId ? createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
}) : demoBase44;
