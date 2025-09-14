// api.js - Servicio API reutilizable

class ApiService {
  constructor() {
    this.baseURL = 'https://backend-node-soft360-production.up.railway.app';
  }

  // Método base para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos HTTP específicos
  async get(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post(endpoint, data = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  async patch(endpoint, data = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }
}

// Crear una instancia única (Singleton)
const apiService = new ApiService();

export default apiService;

// También puedes exportar métodos específicos si prefieres
export const { get, post, put, delete: del, patch } = apiService;

// Métodos específicos para tu aplicación
export const leadersAPI = {
  getAll: () => apiService.get('/lideres'),
  getById: (id) => apiService.get(`/lideres/${id}`),
  create: (data) => apiService.post('/lideres', data),
  update: (id, data) => apiService.put(`/lideres/${id}`, data),
  delete: (id) => apiService.delete(`/lideres/${id}`)
};

export const recommendedAPI = {
  getById: (id) => apiService.get(`/recomendados/${id}`),
  create: (data) => apiService.post('/recomendados', data),
  update: (id, data) => apiService.put(`/recomendados/${id}`, data),
  delete: (id) => apiService.delete(`/recomendados/${id}`)
};

export const votersAPI = {
  getByLeader: (leaderId) => apiService.get(`/votantes/por-lider-detalle?lider=${leaderId}`),
  create: (data) => apiService.post('/votantes', data),
  update: (id, data) => apiService.put(`/votantes/${id}`, data),
  delete: (id) => apiService.delete(`/votantes/${id}`)
};