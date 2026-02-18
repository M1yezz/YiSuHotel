import Taro from '@tarojs/taro';

const baseURL = 'http://localhost:3000'; // Adjust for real device debugging if needed

const request = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', url: string, data?: any) => {
  const token = Taro.getStorageSync('token');
  const header: any = {
    'content-type': 'application/json'
  };
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await Taro.request({
      url: baseURL + url,
      method,
      data,
      header
    });
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
        return res.data;
    } else if (res.statusCode === 401) {
        Taro.removeStorageSync('token');
        Taro.navigateTo({ url: '/pages/login/index' });
        throw new Error('Unauthorized');
    } else {
        throw new Error(res.data?.message || `Request failed with status code ${res.statusCode}`);
    }
  } catch (error) {
    console.error('API Error:', error);
    Taro.showToast({ title: error.message || 'Network Error', icon: 'none' });
    throw error;
  }
};

const client = {
  get: (url: string, params?: any) => {
      let finalUrl = url;
      if (params) {
          const query = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
          finalUrl += `?${query}`;
      }
      return request('GET', finalUrl);
  },
  post: (url: string, data?: any) => request('POST', url, data),
  put: (url: string, data?: any) => request('PUT', url, data),
  patch: (url: string, data?: any) => request('PATCH', url, data),
  delete: (url: string) => request('DELETE', url)
};

export default client;
