// DryMatterProductivityChart.jsx
import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';

// Función auxiliar para generar un color aleatorio (puedes personalizar o usar una paleta fija)
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const DryMatterProductivityChart = ({ csvUrl, quincenas }) => {
  const [csvData, setCsvData] = useState([]);

  // Cargar y parsear el CSV al montar el componente
  useEffect(() => {
    fetch('/ndviRegional_1')
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

  // Procesar los datos: filtrar por quincenas solicitadas y agrupar por año.
  const chartData = useMemo(() => {
    if (!csvData.length || !quincenas || quincenas.length === 0) return null;

    // Asegurarse de que las quincenas solicitadas estén en formato numérico
    const quincenasSolicitadas = quincenas.map(q => Number(q));

    // Filtrar los datos para conservar solo las filas cuyas quincenas estén en el arreglo solicitado.
    const filteredData = csvData.filter(row => {
      // Se asume que la columna "quincena" se puede convertir a número.
      const q = Number(row.quincena);
      return quincenasSolicitadas.includes(q);
    });

    // Agrupar por año
    const dataByYear = {};
    filteredData.forEach(row => {
      const year = row.year; // Asumimos que la columna "year" existe
      const quincena = Number(row.quincena);
      const productividad = Number(row.productividad); // Se convierte a número
      if (!dataByYear[year]) {
        dataByYear[year] = {};
      }
      // Guardamos la productividad según la quincena (si hay más de un registro para la misma quincena, podrías promediarlo o escoger uno)
      dataByYear[year][quincena] = productividad;
    });

    // Las etiquetas del eje x serán las quincenas solicitadas ordenadas ascendentemente (se puede personalizar, por ejemplo "Q1", "Q2", etc.)
    const labels = quincenasSolicitadas.sort((a, b) => a - b).map(q => `Quincena ${q}`);

    // Crear datasets: cada año tendrá una línea en el gráfico
    const datasets = Object.entries(dataByYear).map(([year, values]) => {
      // Para cada quincena solicitada, se busca el valor correspondiente; si no existe se puede asignar null (para que Chart.js deje un espacio)
      const dataPoints = quincenasSolicitadas.map(q => (q in values ? values[q] : null));
      return {
        label: year,
        data: dataPoints,
        borderColor: getRandomColor(),
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.1,
      };
    });

    return { labels, datasets };
  }, [csvData, quincenas]);

  if (!chartData) return <p>Cargando datos...</p>;

  return (
    <div>
      <Line data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Productividad de Materia Seca Histórica' }
        },
        scales: {
          x: { title: { display: true, text: 'Quincena' } },
          y: { title: { display: true, text: 'Productividad (Kg/ha)' }, beginAtZero: true }
        }
      }} />
    </div>
  );
};

export default DryMatterProductivityChart;
