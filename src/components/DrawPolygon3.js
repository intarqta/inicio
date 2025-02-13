import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, Polygon, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import "./assets/leaflet.css";
import "./assets/leaflet.draw.css";
import Spinner from './Spinner';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, LineElement, PointElement);

const DrawMap = () => {
  const [positions, setPositions] = useState([]);
  const [data, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      setShowPanel(true);
    }
  }, [data]);

  const sendCoordinates = async (geometry) => {
    try {
      setLoading(true);

      const payload = {
        coordinates: [geometry],
        start_date: '2024-01-01',
        end_date: '2024-09-30'
      };

      // Llamada para evaluar el polígono en el backend
      const response = await fetch('http://127.0.0.1:8000/api/ndvi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      setDatos(responseData);
    } catch (error) {
      console.error('Error al enviar las coordenadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const _onCreate = (event) => {
    const { layer } = event;
    const newPositions = layer.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
    setPositions(newPositions);

    // Enviar las coordenadas al servidor
    sendCoordinates(newPositions);
  };

  const togglePanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  const chartData = {
    labels: data?.ndvi_data?.map(entry => format(new Date(entry.fecha), 'dd-MM-yyyy', { locale: es })),
    datasets: [
      {
        label: 'NDVI',
        data: data?.ndvi_data?.map(entry => entry.NDVI),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false,
      },
      {
        label: 'Temperatura',
        data: data?.nasa_power_data?.map(entry => entry.temperatura),
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false,
      },
      {
        label: 'Radiación',
        data: data?.nasa_power_data?.map(entry => entry.radiacion),
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Panel Izquierdo: Solo se muestra cuando `showPanel` es verdadero */}
      {showPanel && (
        <div
          style={{
            width: isPanelCollapsed ? '30px' : '30%',
            padding: isPanelCollapsed ? '0' : '20px',
            backgroundColor: '#f0f0f0',
            overflowY: 'auto',
            transition: 'width 0.3s',
          }}
        >
          <button onClick={togglePanel} style={{ marginBottom: '10px' }}>
            {isPanelCollapsed ? 'Expandir' : 'Contraer'} Panel
          </button>
          {!isPanelCollapsed && (
            <>
              {loading && <Spinner />}
              <div ref={chartContainerRef} style={{ marginTop: '20px' }}>
                <Line ref={chartRef} data={chartData} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Panel Derecho: Mapa */}
      <div style={{ width: showPanel ? (isPanelCollapsed ? '97%' : '70%') : '100%' }}>
        {loading && !showPanel && <Spinner style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }} />}
        <MapContainer center={[-31.5, -60.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <ReactLeafletGoogleLayer apiKey='YOUR_GOOGLE_API_KEY' type={'hybrid'} />
          <FeatureGroup>
            <EditControl
              onCreated={_onCreate}
              draw={{
                polygon: {
                  allowIntersection: false,
                  shapeOptions: { color: "blue" },
                },
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