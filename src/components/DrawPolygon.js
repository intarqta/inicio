// DrawMap.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, Polygon, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import Spinner from './Spinner';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'chartjs-adapter-date-fns';
import ResourceSelector from './ResourceSelector';
import CalcPPNA from './CalcPPNA';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Title, Filler } from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Title, Filler);

const DrawMap = () => {
  // Estados para datos, dibujo y parámetros
  const [positions, setPositions] = useState([]);
  const [data, setData] = useState({});
  const [regions, setRegions] = useState([]);
  const [dominantRegion, setDominantRegion] = useState(null);
  // selectedResource se define cuando el usuario selecciona el recurso
  const [selectedResource, setSelectedResource] = useState(null);
  const [aggregatedTable, setAggregatedTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Parámetros adicionales
  const [startDate] = useState('2024-01-01');
  const [endDate] = useState('2024-09-30');
  const [recursoForrajero] = useState('Recurso X'); // Valor de ejemplo
  const [presenciaLenosas] = useState(false);
  const [porcentajeLenosas] = useState(0);
  // Suponemos que la latitud se fija o se obtiene de otra parte.
  const [latitud] = useState(-32.5);

  const chartRef = useRef(null);

  // Función para enviar coordenadas al backend
  const sendCoordinates = useCallback(async (geometry) => {
    setLoading(true);
    const payload = {
      coordinates: [geometry],
      start_date: startDate,
      end_date: endDate,
      recurso_forrajero: recursoForrajero,
      presencia_lenosas: presenciaLenosas,
      porcentaje_lenosas: porcentajeLenosas,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/ndvi/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Error en el backend: ${response.status}`);
      }
      const responseData = await response.json();
      setData(responseData);
      setRegions(responseData?.ndvi_data?.regions || []);
      setDominantRegion(responseData?.ndvi_data?.dominant_region || null);
      setShowPanel(true);
      console.log('Respuesta del backend:', responseData);
    } catch (error) {
      console.error('Error al enviar coordenadas:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, recursoForrajero, presenciaLenosas, porcentajeLenosas]);

  // Manejo del dibujo en el mapa
  const handleDrawCreate = useCallback((event) => {
    const { layer } = event;
    const coords = layer.getLatLngs()[0].map(({ lat, lng }) => [lng, lat]);
    setPositions(coords);
    sendCoordinates(coords);
  }, [sendCoordinates]);

  const togglePanel = () => {
    setIsPanelCollapsed(prev => !prev);
  };

  // Función para combinar los datos diarios: une nasa_power_data y ndvi_data.
  function createMergedTable(data) {
    const nasaData = data.nasa_power_data || [];
    const ndviData = (data.ndvi_data && data.ndvi_data.ndvi_data) || [];
    const mergedTable = nasaData.map(record => {
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
        latitud: record.latitud  // Se asume que nasaData incluye la propiedad latitud.
      };
    });
    return mergedTable;
  }

  // Función para calcular la media de un arreglo
  function average(arr) {
    if (arr.length === 0) return null;
    const sum = arr.reduce((acc, cur) => acc + cur, 0);
    return sum / arr.length;
  }

  /**
   * Agrupa los datos diarios combinados por año y quincena (del 1 al 24),
   * calcula la media de temperatura, la media de radiación y obtiene el máximo NDVI.
   * Se agregan las columnas "region" y "recurso" (tomadas de dominantRegion y selectedResource).
   */
  function aggregateDataWithExtras(data, regionValue, recursoValue) {
    if (!data || data.length === 0) return [];
    // Ordenar datos por fecha
    data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const lastRecord = data[data.length - 1];
    
    // Agregar "year" y "quincena" a cada registro.
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
      if (!groups[key]) groups[key] = [];
      groups[key].push(record);
    });
    
    // Calcular promedios y máximo NDVI para cada grupo.
    const aggregated = [];
    Object.keys(groups).forEach(key => {
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
      aggregated.push({
        region: regionValue,
        recurso: recursoValue,
        año: year,
        latitud: group[0].latitud,
        quincena: quincena,
        meanTemperatura: avgTemp,
        meanRadiacion: avgRad,
        NDVImax: maxNDVI,
        fechaNDVI: repDate,
        count: group.length
      });
    });
    
    // Filtrar grupos cuyos NDVImax sean null, salvo si corresponden al último registro.
    const filtered = aggregated.filter(item => item.NDVImax !== null || item.fechaNDVI === lastRecord.fecha);
    
    // Ordenar por año y quincena.
    filtered.sort((a, b) => {
      if (a.año !== b.año) return a.año - b.año;
      return a.quincena - b.quincena;
    });
    
    return filtered;
  }

  // Actualizar la tabla agregada cada vez que cambie data, dominantRegion o selectedResource.
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const merged = createMergedTable(data);
      const aggTable = aggregateDataWithExtras(
        merged,
        (dominantRegion && dominantRegion.name) || "Sin Región",
        selectedResource?.recurso || "Sin recurso"
      );
      setAggregatedTable(aggTable);
    }
  }, [data, dominantRegion, selectedResource]);

  // Construir los datos para la gráfica principal (NDVI, temperatura y radiación)
  const buildChartData = () => {
    const ndviEntries = data?.ndvi_data?.ndvi_data?.filter(entry => entry.NDVI !== null) || [];
    const ndviDates = ndviEntries.map(entry =>
      format(new Date(entry.fecha), 'dd-MM-yyyy', { locale: es })
    );
    const nasaEntries = data?.nasa_power_data?.filter(entry => {
      const dateStr = format(new Date(entry.fecha), 'dd-MM-yyyy', { locale: es });
      return ndviDates.includes(dateStr);
    }) || [];
    return {
      labels: ndviDates,
      datasets: [
        {
          label: 'NDVI',
          data: ndviEntries.map(entry => entry.NDVI),
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y2',
        },
        {
          label: 'Temperatura',
          data: nasaEntries.map(entry => entry.temperatura),
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y',
        },
        {
          label: 'Radiación',
          data: nasaEntries.map(entry => entry.radiacion),
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y',
        },
      ],
    };
  };

  const chartData = buildChartData();

  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'NDVI, Temperatura y Radiación' },
      tooltip: { enabled: true, mode: 'nearest', intersect: false },
      datalabels: {
        display: true,
        color: 'black',
        align: 'top',
        formatter: (value) => value.toFixed(2),
      },
    },
    scales: {
      y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperatura y Radiación' }, min: 0 },
      y2: { type: 'linear', position: 'right', title: { display: true, text: 'NDVI' }, grid: { drawOnChartArea: false }, min: 0 },
    },
  };


  // Renderizado condicional en el panel izquierdo.
  return (
    <div style={{ display: 'flex', height: '92vh', marginTop: '8vh' }}>
      {/* Panel Izquierdo */}
      {showPanel && (
        <div
          style={{
            width: isPanelCollapsed ? '50px' : '30%',
            padding: isPanelCollapsed ? '0' : '20px',
            backgroundColor: '#f0f0f0',
            overflowY: 'auto',
            transition: 'width 0.3s',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <button
            onClick={togglePanel}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
            }}
          >
            {isPanelCollapsed ? '⇒' : '⇐'}
          </button>
          {!isPanelCollapsed && (
            <>
              {loading && <Spinner />}
              <Line ref={chartRef} data={chartData} options={chartOptions} />
              {regions.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Regiones Detectadas</h3>
                  <ul>
                    {regions.map((region, index) => (
                      <li key={index}>
                        {region.name}: {region.percentage.toFixed(2)}%
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dominantRegion && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Región de Mayor Proporción</h3>
                  <p>
                    {dominantRegion.name}: {dominantRegion.percentage.toFixed(2)}%
                  </p>
                  {/* Selector de recursos */}
                  <ResourceSelector
                    dominantRegion={dominantRegion}
                    onSelectResource={setSelectedResource}
                    onSelectFunction={(funcValue) => {
                      console.log("Función seleccionada:", funcValue);
                    }}
                  />
                </div>
              )}
              {/* Renderizar CalcPPNA si se tiene recurso y la tabla agregada */}
              {selectedResource && aggregatedTable && aggregatedTable.length > 0 && (
                <CalcPPNA
                  aggregatedData={aggregatedTable}
                  selectedResource={selectedResource}
                  dominantRegion={dominantRegion}
                  latitud={latitud}
                />
              )}
            </>
          )}
        </div>
      )}
      {/* Panel Derecho: Mapa */}
      <div style={{ width: showPanel ? (isPanelCollapsed ? '97%' : '70%') : '100%' }}>
        {loading && !showPanel && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000,
            }}
          >
            <Spinner />
          </div>
        )}
        <MapContainer center={[-31.5, -60.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <ReactLeafletGoogleLayer apiKey={process.env.REACT_APP_API} type="hybrid" />
          <FeatureGroup>
            <EditControl
              onCreated={handleDrawCreate}
              draw={{
                polygon: { allowIntersection: false, shapeOptions: { color: 'blue' } },
              }}
            />
            {positions.length > 0 && <Polygon positions={positions} />}
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default DrawMap;
