// MergedProductivityChart.jsx
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

// Función auxiliar para generar un color aleatorio
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function MergedProductivityChart({ 
  aggregatedData,         // Datos actuales con PPNA calculada (para el recurso seleccionado)
  aggregatedHistorical,   // JSON con los datos históricos de PPNA (variable de estado)
  selectedResource, 
  dominantRegion, 
  quincenas              // Array de quincenas en el orden definido por el usuario (pueden repetirse)
}) {
  // La variable aggregatedHistorical ya contiene los datos históricos
  const historicalData = aggregatedHistorical;

  // Serie actual: usa aggregatedData para el recurso actual
  const ppnaChartData = useMemo(() => {
    if (!aggregatedData || aggregatedData.length === 0 || !selectedResource) return null;
    const labels = aggregatedData.map(row => row.fechaQuincena);
    const dataset = {
      label: selectedResource.anio || 'PPNA Actual',
      data: aggregatedData.map(row => row.PPNA),
      borderColor: 'rgba(0,200,0,1)',
      borderWidth: 2,         // Línea gruesa para la serie actual
      pointRadius: 4,         // Puntos grandes
      fill: false,
      tension: 0.1,
    };
    return { labels, datasets: [dataset] };
  }, [aggregatedData, selectedResource, quincenas]);

  // Procesar los datos históricos agrupándolos por año y reordenándolos según quincenas
  const historicalProcessedDataByYear = useMemo(() => {
    if (!historicalData || historicalData.length === 0 || !quincenas || quincenas.length === 0) return {};
    // Agrupar por año (se asume que cada registro tiene la propiedad "anio")
    const grouped = historicalData.reduce((acc, row) => {
      const year = row.anio;
      if (!acc[year]) acc[year] = [];
      acc[year].push(row);
      return acc;
    }, {});
    // console.log('historicalProcessedDataByYear',quincenas)
    // Para cada año, recorrer el array de quincenas (manteniendo duplicados) y obtener el primer registro que coincida;
    // si no existe, insertar un objeto dummy con PPNA null.
    const orderedByYear = {};
    Object.keys(grouped).forEach(year => {
    const rows = grouped[year];
    const orderedRows = [];
    quincenas.forEach(q => {
        // Buscar la primera ocurrencia de la quincena (sin descartar si ya se encontró una previamente)
        const record = rows.find(r => Number(r.quincena) === Number(q));
        if (record) {
        orderedRows.push(record);
        } else {
        orderedRows.push({ quincena: q, PPNA: null, anio: year });
        }
    });
    orderedByYear[year] = orderedRows;
    });
    return orderedByYear;
  }, [historicalData, quincenas]);

  // Construir la serie histórica para el gráfico: cada dataset es un año
  const historicalChartData = useMemo(() => {
    if (!quincenas || quincenas.length === 0) return null;
    const labels = quincenas.map(q => `${q}`);
    const datasets = Object.entries(historicalProcessedDataByYear).map(([year, rows]) => ({
      label: year,
      data: rows.map(row => row.PPNA),
      borderColor: getRandomColor(),
      borderWidth: 1,         // Línea más delgada para históricos
      pointRadius: 2,         // Puntos más pequeños
      pointHoverRadius: 3,
      fill: false,
      tension: 0.1,
    }));
    return { labels, datasets };
  }, [historicalProcessedDataByYear, quincenas]);

  // Fusionar la serie actual con la histórica y extender los datos históricos
  const mergedChartData = useMemo(() => {
    if (!ppnaChartData || !historicalChartData) return null;
    // Extender cada dataset histórico para que tenga la misma cantidad de puntos que ppnaChartData.labels
    const extendedHistoricalDatasets = historicalChartData.datasets.map(ds => {
      const extendedData = ppnaChartData.labels.map((label, index) => {
        // Se usa el módulo para repetir cíclicamente los datos históricos
        const idx = index % ds.data.length;
        return ds.data[idx];
      });
      return {
        ...ds,
        data: extendedData,
        borderWidth: 1,
        pointRadius: 2,
        pointHoverRadius: 3,
      };
    });
    return {
      labels: ppnaChartData.labels, // Se asume que ambas series tienen las mismas etiquetas
      datasets: [
        ...ppnaChartData.datasets,
        ...extendedHistoricalDatasets,
      ]
    };
  }, [ppnaChartData, historicalChartData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false, 
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Productividad: PPNA Actual y Serie Histórica' },
      tooltip: { enabled: true, mode: 'nearest', intersect: false },
    },
    scales: {
      x: { title: { display: true, text: 'Quincena' } },
      y: { title: { display: true, text: 'PPNA (Kg/ha/dia)' }, beginAtZero: true },
    },
  }), []);
  // console.log("Recurso", dominantRegion)

  // Función para exportar a Excel los datos de la serie actual
  const exportToExcel = () => {
    if (!aggregatedData || aggregatedData.length === 0 || !selectedResource) return;
    // Crear una copia de los datos y eliminar los últimos 2 registros
    const filteredData = [...aggregatedData];
    if (filteredData.length > 2) {
      filteredData.splice(filteredData.length - 2, 2);
    }
    
    // Preparar los datos para el Excel
    const excelData = filteredData.map(row => ({
      Fecha: row.fechaQuincena,
      Quincena: row.quincena,
      PPNA: row.PPNA,
      Region: dominantRegion?.name || 'No especificada',
      Recurso: selectedResource?.recurso || 'No especificado',
      // Tipo: selectedResource?.tipo || 'No especificado',
      Año: selectedResource?.anio || new Date().getFullYear()
    }));
    
    // Crear una hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos PPNA");
    
    // Generar el archivo con un nombre descriptivo
    const fileName = `PPNA_${selectedResource?.recurso || 'recurso'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (!mergedChartData) return <p>Cargando datos...</p>;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-5px', left: '-5px', zIndex: 10 }}>
        <button 
          onClick={exportToExcel}
          style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '8px 15px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '14px',
            borderRadius: '2px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          Descargar Excel
        </button>
      </div>
      <Line data={mergedChartData} options={chartOptions} />
    </div>
  );
}

export default MergedProductivityChart;
