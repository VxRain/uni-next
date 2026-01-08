import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter';
import { client } from './generatedApi/client.gen';

client.setConfig({
  adapter: createUniAppAxiosAdapter(),
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 配置拦截器
client.instance.interceptors.request.use((config) => {
  const token = uni.getStorageSync('token');
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

client.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.msg || '请求失败';
    uni.showToast({ title: msg, icon: 'none' });
    return Promise.reject(error);
  }
);

export * from './generatedApi/sdk.gen';
export * from './generatedApi/types.gen';
