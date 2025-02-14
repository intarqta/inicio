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
* Formatea una fecha en formato dd-MM-YY.
* @param {Date} date 
* @returns {string} Fecha formateada.
*/
const formatDate = (date) => {
if (!(date instanceof Date)) return "";
const day = date.getDate().toString().padStart(2, '0');
const month = (date.getMonth() + 1).toString().padStart(2, '0');
const year = date.getFullYear().toString().slice(-2);
return `${day}-${month}-${year}`;
};

/**
* Dado un año y una quincena, calcula la fecha mediana para esa quincena.
* La lógica es: para la primera quincena (quincena impar) se usa el día 8,
* y para la segunda (quincena par) se calcula la mediana entre el 16 y el último día del mes.
* @param {number} year 
* @param {number} quincena 
* @returns {Date}
*/
const getFechaQuincena = (year, quincena) => {
const month = Math.ceil(quincena / 2); // Recupera el mes a partir de la quincena (1-indexado)
if (quincena % 2 === 1) {
  // Primera quincena: día mediano fijo en 8
  return new Date(year, month - 1, 8);
} else {
  // Segunda quincena: calcular mediana entre 16 y último día del mes
  const lastDay = new Date(year, month, 0).getDate();
  const medianDay = Math.floor((16 + lastDay) / 2);
  return new Date(year, month - 1, medianDay);
}
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
* Se añaden las propiedades "region", "recurso" y "fechaQuincena" (formateada en "dd-MM-YY") a cada registro.
* Posteriormente, se extiende el array agregando dos grupos extra con valores nulos para las variables
* (salvo quincena, año y fechaQuincena), teniendo en cuenta que luego de la quincena 24 se reinicia a 1.
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

// Agregar "year", "quincena" y "fechaQuincena" a cada registro
const withQuincena = data.map(record => {
  const d = new Date(record.fecha);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // Mes en formato 1-indexado
  const day = d.getDate();
  const quincena = (month - 1) * 2 + (day <= 15 ? 1 : 2);
  
  let medianDay;
  if (day <= 15) {
    // Para la primera quincena, el día mediano es el 8
    medianDay = 8;
  } else {
    // Para la segunda quincena, calcular el último día del mes
    const lastDay = new Date(year, month, 0).getDate();
    // Se calcula la mediana entre el día 16 y el último día
    medianDay = Math.floor((16 + lastDay) / 2);
  }
  
  // Crear la fecha mediana. Recordar que en Date el mes es 0-indexado
  const fechaQuincena = new Date(year, month - 1, medianDay);

  return { ...record, year, quincena, fechaQuincena };
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
  const { year, quincena, fechaQuincena } = group[0];
  return {
    region: regionValue,
    recurso: recursoValue,
    año: year,
    latitud: group[0].latitud,
    quincena,
    fechaQuincena: formatDate(fechaQuincena),
    meanTemperatura: avgTemp,
    meanRadiacion: avgRad,
    NDVImax: maxNDVI,
    fechaNDVI: repDate,
    count: group.length,
  };
});

// Ordenar por año y quincena
aggregated.sort((a, b) => a.año - b.año || a.quincena - b.quincena);

// Extender el array agregando 2 quincenas extra con valores nulos para el resto de las variables
if (aggregated.length > 0) {
  const lastGroup = aggregated[aggregated.length - 1];
  const lastQuincena = lastGroup.quincena;
  const lastYear = lastGroup.año;
  // Calcular la siguiente quincena
  const next1 = (lastQuincena % 24) + 1;
  const next1Year = (lastQuincena === 24) ? lastYear + 1 : lastYear;
  const next2 = (next1 % 24) + 1;
  const next2Year = (next1 === 24) ? next1Year + 1 : next1Year;

  const extra1 = {
    region: regionValue,
    recurso: recursoValue,
    año: next1Year,
    latitud: null,
    quincena: next1,
    fechaQuincena: formatDate(getFechaQuincena(next1Year, next1)),
    meanTemperatura: null,
    meanRadiacion: null,
    NDVImax: null,
    fechaNDVI: null,
    count: 0,
  };

  const extra2 = {
    region: regionValue,
    recurso: recursoValue,
    año: next2Year,
    latitud: null,
    quincena: next2,
    fechaQuincena: formatDate(getFechaQuincena(next2Year, next2)),
    meanTemperatura: null,
    meanRadiacion: null,
    NDVImax: null,
    fechaNDVI: null,
    count: 0,
  };

  aggregated.push(extra1, extra2);
  // Volver a ordenar por año y quincena
  aggregated.sort((a, b) => a.año - b.año || a.quincena - b.quincena);
}

return aggregated;
};

// /**
//  * Calcula el promedio de un arreglo.
//  * @param {number[]} arr 
//  * @returns {number|null} Promedio o null si el arreglo está vacío.
//  */
// export const average = (arr) => {
//   if (arr.length === 0) return null;
//   return arr.reduce((acc, cur) => acc + cur, 0) / arr.length;
// };

// /**
// * Formatea una fecha en formato dd-MM-YY.
// * @param {Date} date 
// * @returns {string} Fecha formateada.
// */
// const formatDate = (date) => {
// if (!(date instanceof Date)) return "";
// const day = date.getDate().toString().padStart(2, '0');
// const month = (date.getMonth() + 1).toString().padStart(2, '0');
// const year = date.getFullYear().toString().slice(-2);
// return `${day}-${month}-${year}`;
// };

// /**
// * Crea una tabla combinada a partir de los datos de nasa_power_data y ndvi_data.
// * @param {object} data 
// * @returns {object[]} Tabla combinada.
// */
// export const createMergedTable = (data) => {
//   const nasaData = data.nasa_power_data || [];
//   const ndviData = (data.ndvi_data && data.ndvi_data.ndvi_data) || [];
//   return nasaData.map(record => {
//     const ndviRecord = ndviData.find(ndviItem => {
//       if (ndviItem.fecha) {
//         return ndviItem.fecha.substring(0, 10) === record.fecha;
//       }
//       return false;
//     });
//     return {
//       fecha: record.fecha,
//       temperatura: record.temperatura,
//       radiacion: record.radiacion,
//       NDVI: ndviRecord ? ndviRecord.NDVI : null,
//       latitud: record.latitud,
//     };
//   });
// };

// /**
// * Agrupa los datos diarios combinados por año y quincena, calculando promedios y el máximo NDVI.
// * Se añaden las propiedades "region", "recurso" y "fechaQuincena" (formateada en "dd-MM-YY") a cada registro.
// * @param {object[]} data 
// * @param {string} regionValue 
// * @param {string} recursoValue 
// * @returns {object[]} Datos agregados.
// */
// export const aggregateDataWithExtras = (data, regionValue, recursoValue) => {
// if (!data || data.length === 0) return [];
// // Ordenar datos por fecha
// data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
// const lastRecord = data[data.length - 1];

// // Agregar "year", "quincena" y "fechaQuincena" a cada registro
// const withQuincena = data.map(record => {
//   const d = new Date(record.fecha);
//   const year = d.getFullYear();
//   const month = d.getMonth() + 1; // Mes en formato 1-indexado
//   const day = d.getDate();
//   const quincena = (month - 1) * 2 + (day <= 15 ? 1 : 2);
  
//   let medianDay;
//   if (day <= 15) {
//     // Para la primera quincena, el día mediano es el 8
//     medianDay = 8;
//   } else {
//     // Para la segunda quincena, calcular el último día del mes
//     const lastDay = new Date(year, month, 0).getDate();
//     // Se calcula la mediana entre el día 16 y el último día
//     medianDay = Math.floor((16 + lastDay) / 2);
//   }
  
//   // Crear la fecha mediana. Recordar que en Date el mes es 0-indexado
//   const fechaQuincena = new Date(year, month - 1, medianDay);

//   return { ...record, year, quincena, fechaQuincena };
// });

// // Agrupar por "year-quincena"
// const groups = {};
// withQuincena.forEach(record => {
//   const key = `${record.year}-${record.quincena}`;
//   groups[key] = groups[key] || [];
//   groups[key].push(record);
// });

// // Calcular promedios y máximo NDVI para cada grupo
// const aggregated = Object.keys(groups).map(key => {
//   const group = groups[key];
//   const avgTemp = average(group.map(r => r.temperatura));
//   const avgRad = average(group.map(r => r.radiacion));
//   const validNdvi = group.filter(r => r.NDVI !== null && r.NDVI !== undefined);
//   let maxNDVI = null;
//   let repDate = null;
//   if (validNdvi.length > 0) {
//     maxNDVI = validNdvi.reduce((max, r) => (r.NDVI > max ? r.NDVI : max), validNdvi[0].NDVI);
//     repDate = validNdvi.find(r => r.NDVI === maxNDVI).fecha;
//   }
//   const { year, quincena, fechaQuincena } = group[0];
//   return {
//     region: regionValue,
//     recurso: recursoValue,
//     año: year,
//     latitud: group[0].latitud,
//     quincena,
//     fechaQuincena: formatDate(fechaQuincena), // Se devuelve la fecha formateada "dd-MM-YY"
//     meanTemperatura: avgTemp,
//     meanRadiacion: avgRad,
//     NDVImax: maxNDVI,
//     fechaNDVI: repDate,
//     count: group.length,
//   };
// });

// // Filtrar grupos sin valor de NDVI, salvo el correspondiente al último registro
// const filtered = aggregated; //.filter(item => item.NDVImax !== null || item.fechaNDVI === lastRecord.fecha);
// // Ordenar por año y quincena
// filtered.sort((a, b) => a.año - b.año || a.quincena - b.quincena);
// return filtered;
// };
