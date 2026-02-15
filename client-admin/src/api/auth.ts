import client from './client';

export const login = (data: any) => client.post('/auth/login', data);
export const register = (data: any) => client.post('/auth/register', data);
