import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import useCalculatePPNA from './CalcPPNA2';

// Función auxiliar para generar un color aleatorio (puedes personalizar o usar una paleta fija)
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Hook personalizado que procesa el CSV y devuelve el array de datasets
const useDryMatterProductivity = ({ csvUrl, quincenas, region, recurso}) => {
  const [csvData, setCsvData] = useState([]);
  const [aggregatedData, setDataHist] = useState([]);
  const [selectedResource, setDataRecurso] = useState([]);
  const [dominantRegion, setDataRegion] = useState([]);

  // Cargar y parsear el CSV al montar el hook
  useEffect(() => {
    fetch(csvUrl)
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setCsvData(result.data);
          }
        });
      })
      .catch(err => console.error("Error al cargar CSV:", err));
  }, [csvUrl]);

  // Filtrar los datos y almacenar la información relevante
  useMemo(() => {
    if (!csvData.length || !quincenas || quincenas.length === 0 || !region || !recurso)
      return;
    // Convertir las quincenas solicitadas a número
    const quincenasSolicitadas = quincenas.map(q => Number(q));
    // Filtrar filas que cumplen con los criterios de quincena, región y recurso
    const filteredData = csvData.filter(row => {
      const q = Number(row.quincena);
      return (
        quincenasSolicitadas.includes(q) &&
        row.Region === region.name &&
        row.Recurso === recurso.recurso
      );
    });
    setDataHist(filteredData);
    setDataRecurso(recurso);
    setDataRegion(region);
  }, [csvData, quincenas, region, recurso]);

  // Calcular PPNA usando el hook personalizado
  const calculatedPPNAData = useCalculatePPNA({ aggregatedData, selectedResource, dominantRegion});

  // Construir el array de datasets para Chart.js
  const datasets = useMemo(() => {
    if (!calculatedPPNAData) return [];
    // Agrupar los datos calculados por año
    const dataByYear = {};
    calculatedPPNAData.forEach(row => {
      const year = row.anio;
      const quincena = Number(row.quincena);
      const productividad = Number(row.PPNA);
      if (!dataByYear[year]) {
        dataByYear[year] = {};
      }
      dataByYear[year][quincena] = productividad;
    });

    const quincenasSolicitadas = quincenas.map(q => Number(q));
    console.log('Quincenas solicitadas', dataByYear)

    // Crear un dataset por cada año
    return Object.entries(dataByYear).map(([year, values]) => {
      const dataPoints = quincenasSolicitadas.map(q =>
        q in values ? values[q] : null
      );
      return {
        label: year,
        data: dataPoints,
        borderColor: getRandomColor(),
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.1,
      };
    });
  }, [recurso, region, aggregatedData, calculatedPPNAData, quincenas]);

  // Devolver el array de datasets para que el componente padre lo almacene en su estado
  return calculatedPPNAData;
};

export default useDryMatterProductivity;
