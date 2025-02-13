// // ResourceCalculation.js
// import React, { useMemo } from 'react';
// import { Line } from 'react-chartjs-2';
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
// import 'chartjs-adapter-date-fns';
// import { Chart, CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Title, Filler } from 'chart.js';
// Chart.register(CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Title, Filler);
// /**
//  * Funciones de cálculo para fPAR según el modelo.
//  */
// function calculateFPAR_Pellegrini(NDVImod) {
//   // Ejemplo: fPAR = 1.1 * NDVImod - 0.1
//   return 0.007 * Math.exp(6.0 * NDVImod);
// }

// function calculateFPAR_Griguera(NDVImod) {
//   // Ejemplo: fPAR = 1.0 * NDVImod - 0.05
//   return 1.0 * NDVImod - 0.05;
// }

// function calculateFPAR_oneSoil(NDVImod) {
//   // Ejemplo: fPAR = 0.9 * NDVImod
//   return 0.9 * NDVImod;
// }

// /**
//  * Calcula el factor de reducción por temperatura.
//  * Supongamos que la temperatura óptima es 25°C y usamos una reducción lineal con coeficiente 0.03.
//  * Luego, se limita el valor al rango [0, 0.95].
//  * @param {number} meanTemperature 
//  * @returns {number} factor de reducción
//  */


// /**
//  * Función que procesa una fila completa según el valor de calibrado_en.
//  * Se usa un switch/case para determinar la serie de cálculos específicos.
//  *
//  * @param {Object} row Registro de la tabla agregada que contiene:
//  *   - maxNDVI: el NDVI máximo para ese grupo.
//  *   - meanTemperatura: la temperatura promedio del grupo.
//  *   - meanRadiacion: la radiación promedio del grupo.
//  * @param {string} calibrado Valor de selectedResource.calibrado_en.
//  * @param {string} region Valor a asignar en la columna "region" (por ejemplo, dominantRegion.name).
//  * @param {string} recurso Valor a asignar en la columna "recurso" (por ejemplo, selectedResource.recurso).
//  * @returns {Object} Registro procesado con las nuevas columnas.
//  */
// function processRowBasedOnCalibrado(row, calibrado, latitud, recurso) {
//   // Paso 1: NDVImod se define a partir del NDVI máximo.
//   const NDVImod = 0.173 + 0.7540 * row.maxNDVI;
//   const T = row.meanTemperatura;         // Temperatura promedio.
//   const rad = row.meanRadiacion;         // Radiación promedio.
//   let fPAR,apart, tempReduction, PPNA;

//   switch (calibrado) {
//     case "PPNA_campoNatural_pampaMesop":
//       // Fórmula específica para "Pampa Mesopotamica"
//       fPAR = calculateFPAR_Pellegrini(NDVImod);
//       fPAR = Math.max(0, Math.min(fPAR, 0.95));
//       // Fórmula de reducción por temperatura específica (ejemplo)
//       tempReduction = -0.002 * Math.pow(T, 2) + 0.130 * T - 1.000;
//       tempReduction = Math.max(0, Math.min(tempReduction, 0.95));
//       apart = fPAR * tempReduction * rad;
//       PPNA = 0.408 + 0.367 * apart;
//       break;
//     case "PPNA_campoNatural_NEA":
//       // Fórmula específica para "Pampa Mesopotamica"
//       fPAR = calculateFPAR_Pellegrini(NDVImod);
//       fPAR = Math.max(0, Math.min(fPAR, 0.95));
//       // Fórmula de reducción por temperatura específica (ejemplo)
//       tempReduction = -0.002 * Math.pow(T, 2) + 0.130 * T - 1.000;
//       tempReduction = Math.max(0, Math.min(tempReduction, 0.95));
//       apart = fPAR * tempReduction * rad;
//       PPNA = 10.977753 + 0.57714 * apart + 0.3532 * latitud;
//       break;
//     default:
//       break;
//   }
  
//   return {
//     ...row,
//     NDVImod,
//     fPAR,
//     tempReduction,
//     PPNA,
//     recurso,
//   };
// }

// /**
//  * Componente que procesa la tabla agregada ("aggregatedTable") utilizando un switch/case
//  * en función del valor de selectedResource.calibrado_en.
//  *
//  * @param {Object} props
//  *    - aggregatedTable: Array de objetos con la tabla agregada.
//  *    - selectedResource: Objeto que contiene información del recurso seleccionado, que incluye "calibrado_en" y "recurso".
//  *    - dominantRegion: Objeto con la región dominante, se usará su propiedad "name".
//  */
// function ResourceCalculation({ aggregatedTable, selectedResource, calibrado}) {
//   console.log(calibrado)
//   // if (!aggregatedTable || aggregatedTable.length === 0 || !selectedResource) {
//   //   return null;
//   // }
  
//   // Procesa cada registro usando la función selectora basada en calibrado_en.
//   const processedTable = aggregatedTable.map(row =>
//     processRowBasedOnCalibrado(
//       row,
//       calibrado,
//       selectedResource || "Sin recurso"
//     )
//   );
  
//   console.table(processedTable);
  
//   return (
//     <div>
//       <h3>Resultados del Cálculo</h3>
//       <pre>{JSON.stringify(processedTable, null, 2)}</pre>
//     </div>
//   );
// }

// export default ResourceCalculation;

// useCalcPPNAFunction.js
// import { useState, useEffect } from 'react';

/**
 * Hook que, a partir del recurso seleccionado (selectedResource),
 * devuelve una función de cálculo para PPNA y valores intermedios.
 *
 * La función devuelta recibe (row, latitud) y retorna un objeto con:
 * { PPNA, NDVImod, fPAR, tempReduction }.
 *
 * Los cálculos se realizan de forma diferente según el valor de selectedResource.calibrado_en.
 */


// function CalcPPNA({ aggregatedData, selectedResource, dominantRegion }) {
//   // // Si no hay datos o recurso, no se renderiza nada.
//   // if (!aggregatedData || aggregatedData.length === 0 || !selectedResource) {
//   //   return null;
//   // }
//   console.log('vessssssssssss',selectedResource)

//   // Procesar la tabla agregada una sola vez usando useMemo.
//   const processedData = useMemo(() => {
//     return aggregatedData.map(row => {
//       // Paso 1: Definir NDVImod a partir de row.maxNDVI.
//       // (En este ejemplo se transforma linealmente: NDVImod = 0.173 + 0.7540 * maxNDVI)
//       const NDVImod = 0.173 + 0.7540 * row.NDVImax;
//       const T = row.meanTemperatura;   // Temperatura promedio
//       const rad = row.meanRadiacion;   // Radiación promedio
//       let fPAR, tempReduction, PPNA, apart;
//       // Seleccionar el cálculo completo según el valor de calibrado_en.
//       switch (selectedResource.funcion) {
//         case "campoNatural_pampaMesop":
//           // Fórmula para "PPNA_campoNatural_pampaMesop"
//           fPAR = 0.008 * Math.exp(5.41 * NDVImod);
//           fPAR = Math.max(0, Math.min(fPAR, 0.95));
//           tempReduction = -0.002 * T + 0.130 * T - 1.000;
//           tempReduction = Math.max(0, Math.min(tempReduction, 1));
//           apart = fPAR * tempReduction  * rad;
//           PPNA = 0.408 + 0.367 * apart;
//           break;
//         case "campoNatural_nea":
//           // Fórmula para "PPNA_campoNatural_NEA"
//           fPAR = 0.007 * Math.exp(6.0 * NDVImod);
//           fPAR = Math.max(0, Math.min(fPAR, 0.95));
//           tempReduction = -0.002 * Math.pow(T, 2) + 0.130 * T - 1.000;
//           tempReduction = Math.max(0, Math.min(tempReduction, 1));
//           apart = fPAR * tempReduction  * rad;
//           PPNA = 10.977753 + 0.57714 * apart + 0.3532 * row.latitud;
//           break;
//         // Puedes agregar otros casos según el valor de calibrado_en.
//         default:
//           // Por defecto, se usa el modelo de "PPNA_campoNatural_pampaMesop"
//           fPAR = 0.007 * Math.exp(6.0 * NDVImod);
//           fPAR = Math.max(0, Math.min(fPAR, 0.95));
//           tempReduction = -0.002 * Math.pow(T, 2) + 0.130 * T - 1.000;
//           tempReduction = Math.max(0, Math.min(tempReduction, 0.95));
//           apart = fPAR * tempReduction * rad;
//           PPNA = 0.408 + 0.367 * apart;
//           break;
//       }

//       // Agregar las columnas "region" y "recurso"
//       const regionName = dominantRegion && dominantRegion.name ? dominantRegion.name : "Sin Región";
//       const recurso = selectedResource.recurso ? selectedResource.recurso : "Sin recurso";

//       return {
//         ...row,
//         NDVImod,
//         fPAR,
//         tempReduction,
//         PPNA,
//         region: regionName,
//         recurso: recurso,
//       };
//     });
//   }, [aggregatedData, selectedResource, dominantRegion]);

//   // Imprimir la tabla procesada en la consola para depuración.
//   console.table(processedData);

//   const efficiencyChartData = {
//     labels: processedData?.map(entry => new Date(entry.fechaNDVI)) || [],
//     datasets: [
//       {
//         label: 'PPNA (Kg/ha/dia)',
//         data: processedData?.map(entry => entry.PPNA) || [],
//         borderColor: 'rgba(0, 200, 0, 1)',
//         borderWidth: 2,
//         fill: false,
//       },
//     ],
//   };

//   const chartOptions = {
//       responsive: true,
//       interaction: { mode: 'index', intersect: false },
//       plugins: {
//         legend: { display: true, position: 'top' },
//         title: { display: true, text: 'PPNA' },
//         tooltip: { enabled: true, mode: 'nearest', intersect: false },
//         datalabels: {
//           display: true,
//           color: 'black',
//           align: 'top',
//           formatter: (value) => value.toFixed(2),
//         },
//       },
//       scales: {
//         y: { type: 'linear', position: 'left', title: { display: true, text: 'PPNA' }, min: 0 },
//       },
//     };

//     return (
//       <div>
//         <Line data={efficiencyChartData} options={chartOptions} />
//       </div>
//     );
//   }

// export default CalcPPNA;

// CalcPPNA.jsx
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

function CalcPPNA({ aggregatedData, selectedResource, dominantRegion }) {
  const processedData = useMemo(() => {
    if (!aggregatedData || aggregatedData.length === 0 || !selectedResource) {
      return [];
    }
    return aggregatedData.map(row => {
      const NDVImod = 0.173 + 0.7540 * row.NDVImax;
      const T = row.meanTemperatura;
      const rad = row.meanRadiacion;
      let fPAR, tempReduction, PPNA, apart;

      switch (selectedResource.funcion) {
        case "campoNatural_pampaMesop":
          fPAR = 0.008 * Math.exp(5.41 * NDVImod);
          fPAR = Math.max(0, Math.min(fPAR, 0.95));
          tempReduction = -0.002 * T + 0.130 * T - 1.000;
          tempReduction = Math.max(0, Math.min(tempReduction, 1));
          apart = fPAR * tempReduction * rad;
          PPNA = (0.408 + 0.367 * apart)*10;
          break;
        case "campoNatural_nea":
          fPAR = 0.007 * Math.exp(6.0 * NDVImod);
          fPAR = Math.max(0, Math.min(fPAR, 0.95));
          tempReduction = -0.002 * Math.pow(T, 2) + 0.130 * T - 1.000;
          tempReduction = Math.max(0, Math.min(tempReduction, 1));
          apart = fPAR * tempReduction * rad;
          PPNA = (10.977753 + 0.57714 * apart + 0.3532 * row.latitud)*10;
          break;
        default:
          fPAR = 0.007 * Math.exp(6.0 * NDVImod);
          fPAR = Math.max(0, Math.min(fPAR, 0.95));
          tempReduction = -0.002 * Math.pow(T, 2) + 0.130 * T - 1.000;
          tempReduction = Math.max(0, Math.min(tempReduction, 0.95));
          apart = fPAR * tempReduction * rad;
          PPNA = (0.408 + 0.367 * apart)*10;
          break;
      }

      const regionName = dominantRegion && dominantRegion.name ? dominantRegion.name : "Sin Región";
      const recurso = selectedResource.recurso || "Sin recurso";

      return {
        ...row,
        NDVImod,
        fPAR,
        tempReduction,
        PPNA,
        region: regionName,
        recurso: recurso,
      };
    });
  }, [aggregatedData, selectedResource, dominantRegion]);

  const efficiencyChartData = useMemo(() => ({
    labels: processedData.map(entry => entry.quincena),
    datasets: [
      {
        label: 'PPNA (Kg/ha/dia)',
        data: processedData.map(entry => entry.PPNA),
        borderColor: 'rgba(0, 200, 0, 1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  }), [processedData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false, 
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'PPNA' },
      tooltip: { enabled: true, mode: 'nearest', intersect: false },
      datalabels: {
        display: true,
        color: 'black',
        align: 'top',
        formatter: (value) => value.toFixed(2),
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Quincena' },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'PPNA (Kg/ha/dia)' },
        min: 0,
      },
    },
  }), []);

  if (!selectedResource || processedData.length === 0) return null;

  return (
    // El contenedor del gráfico se asegura de ocupar el 100% del ancho y alto asignado por su contenedor padre.
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={efficiencyChartData} options={chartOptions} />
    </div>
  );
}

export default CalcPPNA;
