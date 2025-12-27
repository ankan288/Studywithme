const API_URL = process.env.API_URL || 'http://localhost:3000';

export const api = {
  baseUrl: API_URL,
  
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`);
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
