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

// API de Capturas (Staging) - Nueva arquitectura
export const capturasAPI = {
  // POST /capturas - Ingesta de datos reportados por líderes con procesamiento automático
  // Campos requeridos: identificacion_reportada, lider_identificacion
  // Campos opcionales: nombre_reportado, apellido_reportado, celular_reportado, email_reportado,
  //                    departamento_reportado, ciudad_reportada, barrio_reportado, direccion_reportada
  create: (data) => apiService.post('/capturas', data),
  // GET /capturas - Consultar capturas con filtros opcionales
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/capturas${queryString ? '?' + queryString : ''}`);
  },
  // GET /capturas?lider_identificacion=123 - Filtrar por líder
  getByLeader: (liderIdentificacion) =>
    apiService.get(`/capturas?lider_identificacion=${liderIdentificacion}`),
  // GET /capturas?votante_identificacion=456 - Filtrar por votante
  getByVotante: (votanteIdentificacion) =>
    apiService.get(`/capturas?votante_identificacion=${votanteIdentificacion}`)
};

// API de Variantes - Gestión de diferentes versiones de datos
export const variantesAPI = {
  // GET /variantes - Consultar variantes por líder
  getByLeader: (liderIdentificacion) =>
    apiService.get(`/variantes?lider_identificacion=${liderIdentificacion}`),
  // GET /variantes?votante_identificacion=456 - Consultar variantes de un votante
  getByVotante: (votanteIdentificacion) =>
    apiService.get(`/variantes?votante_identificacion=${votanteIdentificacion}`),
  // GET /variantes/metricas - Métricas de calidad de datos
  getMetricas: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/variantes/metricas${queryString ? '?' + queryString : ''}`);
  }
};

// API de Asignaciones N:M - Relación votante-líder
export const asignacionesAPI = {
  // POST /asignaciones - Asignar votante a líder
  create: (data) => apiService.post('/asignaciones', data),
  // GET /asignaciones - Listar asignaciones con filtros
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/asignaciones${queryString ? '?' + queryString : ''}`);
  },
  // DELETE /asignaciones - Desasignar votante de líder
  delete: (votanteId, liderId) =>
    apiService.delete(`/asignaciones?votante_identificacion=${votanteId}&lider_identificacion=${liderId}`)
};

// API de Incidencias - Gestión de conflictos y duplicados
export const incidenciasAPI = {
  // GET /incidencias - Consultar incidencias con filtros
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/incidencias${queryString ? '?' + queryString : ''}`);
  },
  // GET /votantes/:id/incidencias - Incidencias de un votante específico
  getByVotante: (votanteId) => apiService.get(`/votantes/${votanteId}/incidencias`),
  // POST /incidencias - Crear incidencia manual
  create: (data) => apiService.post('/incidencias', data),
  // PUT /incidencias/:id/resolver - Resolver incidencia
  resolve: (id, resolucion) => apiService.put(`/incidencias/${id}/resolver`, { resolucion })
};

// API de Logs - Auditoría
export const logsAPI = {
  // GET /logs - Obtener logs de auditoría
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/logs${queryString ? '?' + queryString : ''}`);
  }
};