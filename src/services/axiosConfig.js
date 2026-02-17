import axios from 'axios';

// Configuración base de axios
const axiosInstance = axios.create({
  baseURL: 'https://backend-node-soft360-production.up.railway.app',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUEST: Agregar headers automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    // Agregar x-user-id desde localStorage si existe
    const userId = localStorage.getItem('user_id');
    if (userId) {
      config.headers['x-user-id'] = userId;
    }

    // Agregar timestamp para debugging (opcional)
    config.headers['x-request-time'] = new Date().toISOString();

    // Log de la petición en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔵 ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor de RESPONSE: Manejo de errores global
axiosInstance.interceptors.response.use(
  (response) => {
    // Log de respuesta exitosa en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Manejo de errores HTTP
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const { status, data } = error.response;

      console.error(`❌ Error ${status}:`, {
        url: error.config?.url,
        method: error.config?.method,
        message: data?.error || data?.message || 'Error desconocido',
        data: data,
      });

      // Personalizar mensajes de error según el código de estado
      switch (status) {
        case 400:
          error.userMessage = data?.error || 'Datos inválidos. Verifica la información enviada.';
          break;
        case 401:
          error.userMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          // Aquí podrías redirigir al login si tienes autenticación
          break;
        case 403:
          error.userMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          error.userMessage = data?.error || 'Recurso no encontrado.';
          break;
        case 409:
          error.userMessage = data?.error || 'Conflicto: El recurso ya existe.';
          break;
        case 410:
          error.userMessage = data?.message || 'Este endpoint ya no está disponible.';
          break;
        case 500:
          error.userMessage = 'Error del servidor. Intenta nuevamente más tarde.';
          break;
        default:
          error.userMessage = data?.error || `Error ${status}: ${data?.message || 'Error desconocido'}`;
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('❌ No se recibió respuesta del servidor:', error.request);
      error.userMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    } else {
      // Algo pasó al configurar la petición
      console.error('❌ Error al configurar la petición:', error.message);
      error.userMessage = 'Error al procesar la solicitud.';
    }

    return Promise.reject(error);
  }
);

// Funciones auxiliares para manejar usuarios
export const setUserId = (userId) => {
  if (userId) {
    localStorage.setItem('user_id', userId);
  } else {
    localStorage.removeItem('user_id');
  }
};

export const getUserId = () => {
  return localStorage.getItem('user_id');
};

export const clearUserId = () => {
  localStorage.removeItem('user_id');
};

// Exportar la instancia configurada
export default axiosInstance;

// También exportar axios original por si se necesita
export { axios };
