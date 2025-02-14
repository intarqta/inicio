import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, Polygon, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import Spinner from './Spinner';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import { Line } from 'react-chartjs-2';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import 'chartjs-adapter-date-fns';
import ResourceSelector from './ResourceSelector';
import useCalcPPNA from './CalcPPNA';
import useDryMatterProductivity from './DataHist';
import MergedProductivityChart from './MergeChart';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Title, Filler } from 'chart.js';
import { createMergedTable, aggregateDataWithExtras } from './dataUtils';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, TimeScale, Tooltip, Legend, Title, Filler);

// Parámetros inmutables
const RECURSO_FORRAJERO = 'Recurso X';
const PRESENCIA_LENOSAS = false;
const PORCENTAJE_LENOSAS = 0;
const LATITUD = -32.5;

const Mapa = () => {
  // Estados para datos, coordenadas y configuración
  const [positions, setPositions] = useState([]);
  const [data, setData] = useState({});
  const [regions, setRegions] = useState([]);
  const [dominantRegion, setDominantRegion] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [aggregatedTable, setAggregatedTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  // Declaración del estado para las quincenas
  const [selectedQuincenas, setSelectedQuincenas] = useState([]);
  const [aggregatedHistorical, setAggregatedHistorical] = useState([]);
  const [aggregatedActual, setAggregatedActual] = useState([]);
  

  const chartRef = useRef(null);

  // Función para enviar al backend las coordenadas y el rango de fechas
  const sendCoordinates = useCallback(async (geometry) => {
    setLoading(true);
    const payload = {
      coordinates: [geometry],
      start_date: startDate,
      end_date: endDate,
      recurso_forrajero: RECURSO_FORRAJERO,
      presencia_lenosas: PRESENCIA_LENOSAS,
      porcentaje_lenosas: PORCENTAJE_LENOSAS,
    };

    try {
      const response = await fetch('https://apigee-4ud9.onrender.com/api/ndvi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
      },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Error en el backend: ${response.status}`);
      }
      const responseData = await response.json();
      setData(responseData);
      setRegions(responseData?.ndvi_data?.regions || []);
      setDominantRegion(responseData?.ndvi_data?.dominant_region || null);
      console.log('Respuesta del backend:', responseData);
    } catch (error) {
      console.error('Error al enviar coordenadas:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);
  //=============================== Permite obtener un array con las quinsenas selccionadas por el usuario

    // Extraer las quincenas únicas desde aggregatedData
    useEffect(() => {
      if (aggregatedTable && aggregatedTable.length > 0) {
        const todasLasQuincenas = aggregatedTable.map(item => item.quincena);
        setSelectedQuincenas(todasLasQuincenas);
      }
    }, [aggregatedTable]);
  //====================================================================================================
  // Manejo de la creación del polígono
  const handleDrawCreate = useCallback((event) => {
    const { layer } = event;
    // Convertir coordenadas de [lat, lng] a [lng, lat]
    const coords = layer.getLatLngs()[0].map(({ lat, lng }) => [lng, lat]);
    setPositions(coords);
    sendCoordinates(coords);
  }, [sendCoordinates]);

  const togglePanel = useCallback(() => {
    setIsPanelCollapsed(prev => !prev);
  }, []);

  const buildChartData = useCallback(() => {
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
  }, [data]);

  const chartData = useMemo(() => buildChartData(), [buildChartData]);

  // Solo mostramos el gráfico si hay datos válidos
  const hasChartData = data?.ndvi_data?.ndvi_data && data.ndvi_data.ndvi_data.length > 0;

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'NDVI, Temperatura y Radiación' },
      tooltip: { enabled: true, mode: 'nearest', intersect: false },
    },
    scales: {
      y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperatura y Radiación' }, min: 0 },
      y2: { type: 'linear', position: 'right', title: { display: true, text: 'NDVI' }, grid: { drawOnChartArea: false }, min: 0 },
    },
  }), []);

  // ===================== Estilos Mejorados =====================
  const sidebarStyle = {
    width: isPanelCollapsed ? '50px' : '30%',
    padding: isPanelCollapsed ? '0' : '20px',
    background: 'linear-gradient(135deg, #ffffff, #f0f4f8)',
    color: '#333',
    overflowY: 'auto',
    transition: 'width 0.3s',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRight: '1px solid #e0e0e0',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
  };

  const titleStyle = {
    fontSize: '1.8em',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#2c3e50'
  };

  const instructionsStyle = {
    fontSize: '1em',
    margin: '0 0 20px 0',
    color: '#7f8c8d'
  };

  const formStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  };

  const labelStyle = { fontWeight: 'bold', display: 'block', marginBottom: '5px' };

  const inputStyle = {
    borderRadius: '4px',
    border: '1px solid #ccc',
    padding: '8px',
    width: '100%',
    marginBottom: '10px',
  };

  const buttonStyle = {
    backgroundColor: '#2980b9',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    padding: '10px 15px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%',
  };

  const chartContainerStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
    height: '45vh', // 3 veces la altura original (60% * 3)
    transition: 'height 0.3s',
    padding: '10px',
    position: 'relative',
    marginBottom: '20px'
  };

  // Botón para expandir/contraer el panel principal (siempre visible en el sidebar)
  const panelToggleButtonStyle = {
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
  };

  // ============================== Calculo de PPNA del rango de fecha definido por el usuario =================================== //

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


      // Llamas al hook para obtener el array de datos procesados
  const datasetsPPNAactual = useCalcPPNA({ 
    aggregatedData: aggregatedTable,
    selectedResource,
    dominantRegion 
  });

  // Actualizas el estado cuando datasetsPPNAactual cambie
  useEffect(() => {
    if (datasetsPPNAactual?.length > 0) {
      setAggregatedActual(datasetsPPNAactual);
    }
  }, [datasetsPPNAactual]);

  // =============   Calculo de PPNA hitorico para el mismo rango de fecha definido por el usuario =================================== //
  // Llamas al hook para obtener el dataset
  const datasets = useDryMatterProductivity({ 
    csvUrl: '/ndviRegional_1.csv', 
    quincenas: selectedQuincenas, 
    recurso: selectedResource, 
    region: dominantRegion
  });

  // Actualizas el estado cuando 'datasets' cambia
  useEffect(() => {
    if (datasets.length > 0) {
      setAggregatedHistorical(datasets);
    }
  }, [datasets]);

  console.log("Datos historico de PPNA", aggregatedHistorical)
//================================================== Fin de calculo de PPNA Historico ========================================

  // Condición para mostrar el gráfico de NDVI, temperatura y radiación
  const shouldShowChart = hasChartData && aggregatedTable && aggregatedTable.length > 0;

  return (
    <div style={{ display: 'flex', height: '92vh', marginTop: '8vh' }}>
      {/* Panel Izquierdo */}
      <div style={sidebarStyle}>
        <button onClick={togglePanel} style={panelToggleButtonStyle}>
          {isPanelCollapsed ? '⇒' : '⇐'}
        </button>
        {!isPanelCollapsed && (
          <>
            {/* Encabezado con título y guía (se oculta al dibujar el polígono) */}
            <div style={headerStyle}>
              <h1 style={titleStyle}>Mi Plataforma Forrajera</h1>
              {positions.length === 0 && (
                <p style={instructionsStyle}>
                  Guía: Dibuje un polígono en el mapa para comenzar a obtener datos de NDVI, temperatura y radiación.
                </p>
              )}
            </div>
            {/* Formulario de fechas */}
            <div style={formStyle}>
              <label style={labelStyle}>
                Fecha Inicio:
                <input
                  type="date"
                  style={inputStyle}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label style={labelStyle}>
                Fecha Fin:
                <input
                  type="date"
                  style={inputStyle}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
              {positions.length > 0 && (
                <button onClick={() => sendCoordinates(positions)} style={buttonStyle}>
                  Actualizar Consulta
                </button>
              )}
            </div>
            {loading && <Spinner />}
            {/* Se muestra el gráfico solo si existen datos */}
            {shouldShowChart && (
              <div style={chartContainerStyle}>
                <Line ref={chartRef} data={chartData} options={chartOptions} />
              </div>
            )}
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
                <ResourceSelector
                  dominantRegion={dominantRegion}
                  onSelectResource={setSelectedResource}
                  onSelectFunction={(funcValue) => {
                    console.log("Función seleccionada:", funcValue);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
      {/* Panel Derecho: Mapa y, opcionalmente, el gráfico expandido */}
      <div style={{
          width: showPanel ? (isPanelCollapsed ? '97%' : '70%') : '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f8f9fa'
        }}>
        <div style={{ height: showChart && shouldShowChart ? '40%' : '100%', transition: 'height 0.3s' }}>
          {loading && !showPanel && (
            <div style={{
              maxHeight:"30vh",
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000,
            }}>
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
        {/* Botón de expandir el gráfico, posicionado sobre el mapa en la esquina inferior derecha cuando está contraído */}
        {(!showChart && selectedResource) && (
          <div style={{ pointerEvents: 'none' }}>
            <button
              onClick={() => setShowChart(true)}
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                zIndex: 1000, // z-index bajo para no bloquear el mapa
                pointerEvents: 'auto', // el botón captura el click
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                padding: '10px 15px',
                cursor: 'pointer'
              }}
            >
              Expandir gráfico
            </button>
          </div>
        )}
       {/* Contenedor del gráfico PPNA: ocupa 60% de la altura cuando se muestra */}
        {showChart && selectedResource && (
        <div
            style={{
            height: '60%',
            transition: 'height 0.3s',
            backgroundColor: '#fff',
            padding: '10px',
            position: 'relative',
            marginBottom: '20px'
            }}
        >
            <button
            onClick={() => setShowChart(false)}
            style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                zIndex: 1000,
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                padding: '5px 10px',
                cursor: 'pointer'
            }}
            >
            Contraer gráfico
            </button>
            <MergedProductivityChart 
              aggregatedData={aggregatedActual}
              aggregatedHistorical={aggregatedHistorical}  // Variable de estado con datos históricos
              selectedResource={selectedResource}
              dominantRegion={dominantRegion}
              quincenas={selectedQuincenas}
            />
        </div>
        )}
      </div>
    </div>
  );
};

export default Mapa;
