import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Custom Hook para manejar la carga y filtrado de departamentos y ciudades de Colombia
 * Utiliza la API pública de Colombia (https://api-colombia.com)
 *
 * @param {boolean} enabled - Si es true, carga los datos automáticamente
 * @param {string} departamentoSeleccionado - Nombre del departamento para filtrar ciudades
 * @returns {Object} - Estados y datos de ubicación
 */
const useColombiaLocation = (enabled = false, departamentoSeleccionado = "") => {
  const [departamentos, setDepartamentos] = useState([]);
  const [todosMunicipios, setTodosMunicipios] = useState([]);
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar departamentos y municipios desde la API de Colombia
  useEffect(() => {
    const fetchDepartamentosYMunicipios = async () => {
      if (!enabled) return;

      setLoading(true);
      setError(null);

      try {
        // Cargar departamentos
        const deptosResponse = await axios.get("https://api-colombia.com/api/v1/Department");
        console.log("Departamentos obtenidos:", deptosResponse.data);

        // ORDENAR DEPARTAMENTOS ALFABÉTICAMENTE (sin filtrar Bogotá)
        const departamentosOrdenados = deptosResponse.data.sort((a, b) =>
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );
        setDepartamentos(departamentosOrdenados);

        // Cargar todos los municipios
        const municipiosResponse = await axios.get("https://api-colombia.com/api/v1/City");
        console.log("Municipios obtenidos:", municipiosResponse.data);

        // ORDENAR MUNICIPIOS ALFABÉTICAMENTE (sin modificar datos de Bogotá)
        const municipiosOrdenados = municipiosResponse.data.sort((a, b) =>
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );
        setTodosMunicipios(municipiosOrdenados);

      } catch (error) {
        console.error("Error al cargar datos de ubicación:", error);
        setError("Error al cargar la información de ubicación. Verifica tu conexión a internet.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartamentosYMunicipios();
  }, [enabled]);

  // Función auxiliar para normalizar nombres (quitar tildes y convertir a mayúsculas)
  const normalizarNombre = (nombre) => {
    if (!nombre) return "";
    return nombre
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Eliminar tildes
  };

  // Filtrar municipios cuando cambia el departamento seleccionado
  useEffect(() => {
    if (!departamentoSeleccionado) {
      setMunicipiosFiltrados([]);
      return;
    }

    // Normalizar el departamento seleccionado para comparación
    const departamentoNormalizado = normalizarNombre(departamentoSeleccionado);

    // Buscar el ID del departamento seleccionado con comparación normalizada
    const departamento = departamentos.find(
      dept => normalizarNombre(dept.name) === departamentoNormalizado
    );

    if (!departamento) {
      console.error("Departamento no encontrado:", departamentoSeleccionado);
      console.log("Departamentos disponibles:", departamentos.map(d => d.name));
      setMunicipiosFiltrados([]);
      return;
    }

    console.log("Departamento seleccionado:", departamento);
    console.log("ID del departamento:", departamento.id);

    // Filtrar municipios por departamento Y ORDENAR ALFABÉTICAMENTE
    const municipiosDelDepartamento = todosMunicipios
      .filter(municipio => municipio.departmentId === departamento.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    console.log("Municipios filtrados para", departamentoSeleccionado, ":", municipiosDelDepartamento);
    setMunicipiosFiltrados(municipiosDelDepartamento);
  }, [departamentoSeleccionado, departamentos, todosMunicipios]);

  return {
    departamentos,
    todosMunicipios,
    municipiosFiltrados,
    loading,
    error,
  };
};

export default useColombiaLocation;
