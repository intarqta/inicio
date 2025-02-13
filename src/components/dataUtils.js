// dataUtils.js

/**
 * Calcula el promedio de un arreglo.
 * @param {number[]} arr 
 * @returns {number|null} Promedio o null si el arreglo está vacío.
 */
export const average = (arr) => {
    if (arr.length === 0) return null;
    return arr.reduce((acc, cur) => acc + cur, 0) / arr.length;
  };
  
  /**
   * Crea una tabla combinada a partir de los datos de nasa_power_data y ndvi_data.
   * @param {object} data 
   * @returns {object[]} Tabla combinada.
   */
  export const createMergedTable = (data) => {
    const nasaData = data.nasa_power_data || [];
    const ndviData = (data.ndvi_data && data.ndvi_data.ndvi_data) || [];
    return nasaData.map(record => {
      const ndviRecord = ndviData.find(ndviItem => {
        if (ndviItem.fecha) {
          return ndviItem.fecha.substring(0, 10) === record.fecha;
        }
        return false;
      });
      return {
        fecha: record.fecha,
        temperatura: record.temperatura,
        radiacion: record.radiacion,
        NDVI: ndviRecord ? ndviRecord.NDVI : null,
        latitud: record.latitud,
      };
    });
  };
  
  /**
   * Agrupa los datos diarios combinados por año y quincena, calculando promedios y el máximo NDVI.
   * Se añaden las propiedades "region" y "recurso" a cada registro.
   * @param {object[]} data 
   * @param {string} regionValue 
   * @param {string} recursoValue 
   * @returns {object[]} Datos agregados.
   */
  export const aggregateDataWithExtras = (data, regionValue, recursoValue) => {
    if (!data || data.length === 0) return [];
    // Ordenar datos por fecha
    data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const lastRecord = data[data.length - 1];
  
    // Agregar "year" y "quincena" a cada registro
    const withQuincena = data.map(record => {
      const d = new Date(record.fecha);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const quincena = (month - 1) * 2 + (day <= 15 ? 1 : 2);
      return { ...record, year, quincena };
    });
  
    // Agrupar por "year-quincena"
    const groups = {};
    withQuincena.forEach(record => {
      const key = `${record.year}-${record.quincena}`;
      groups[key] = groups[key] || [];
      groups[key].push(record);
    });
  
    // Calcular promedios y máximo NDVI para cada grupo
    const aggregated = Object.keys(groups).map(key => {
      const group = groups[key];
      const avgTemp = average(group.map(r => r.temperatura));
      const avgRad = average(group.map(r => r.radiacion));
      const validNdvi = group.filter(r => r.NDVI !== null && r.NDVI !== undefined);
      let maxNDVI = null;
      let repDate = null;
      if (validNdvi.length > 0) {
        maxNDVI = validNdvi.reduce((max, r) => (r.NDVI > max ? r.NDVI : max), validNdvi[0].NDVI);
        repDate = validNdvi.find(r => r.NDVI === maxNDVI).fecha;
      }
      const { year, quincena } = group[0];
      return {
        region: regionValue,
        recurso: recursoValue,
        año: year,
        latitud: group[0].latitud,
        quincena,
        meanTemperatura: avgTemp,
        meanRadiacion: avgRad,
        NDVImax: maxNDVI,
        fechaNDVI: repDate,
        count: group.length,
      };
    });
  
    // Filtrar grupos sin valor de NDVI, salvo el correspondiente al último registro
    const filtered = aggregated.filter(item => item.NDVImax !== null || item.fechaNDVI === lastRecord.fecha);
    // Ordenar por año y quincena
    filtered.sort((a, b) => a.año - b.año || a.quincena - b.quincena);
    return filtered;
  };
  