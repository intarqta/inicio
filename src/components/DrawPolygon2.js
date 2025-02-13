import React, { useState, useRef } from 'react';
import { MapContainer, Polygon, FeatureGroup, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import "./assets/leaflet.css";
import "./assets/leaflet.draw.css";
import Spinner from './Spinner';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el locale español
import 'bootstrap/dist/css/bootstrap.min.css';
import L from 'leaflet'
import { Chart, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, LineElement, PointElement);


const DrawMap = () => {
const [positions, setPositions] = useState([]);
  const [data, setDatos] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const chartRef = useRef(null); // Referencia para el gráfico
  const [loading, setLoading] = useState(false);
  const [thumbUrl, setThumbUrl] = useState(null);
  const chartContainerRef = useRef(null);

  // Campos para parámetros adicionales
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-09-30');
  const [recursoForrajero, setRecursoForrajero] = useState('');
  const [presenciaLenosas, setPresenciaLenosas] = useState(false);
  const [porcentajeLenosas, setPorcentajeLenosas] = useState(0);
  const [pastureAvailability, setPastureAvailability] = useState(null); // Almacenar datos de disponibilidad de pasto
  const [samplePoints, setSamplePoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  

  const sendCoordinates = async (geometry) => {
    try {
      const payload = {
        coordinates: [geometry],
        start_date: startDate,
        end_date: endDate,
        recurso_forrajero: recursoForrajero,
        presencia_leñosas: presenciaLenosas,
        porcentaje_leñosas: porcentajeLenosas,
      };
      
      console.log(payload)

      const response = await fetch('https://apigee-4ud9.onrender.com/api/ndvi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setShowChart(JSON.parse(data))
      setDatos(JSON.parse(data));
    } catch (error) {
      console.error('Error al enviar las coordenadas:', error);
    } finally {
      setLoading(false);
    }
  };



  const estimatePastureAvailability = async () => {
    if (positions.length === 0) {
      console.error('Por favor, dibuja un polígono primero.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        coordinates: [positions],
        start_date: startDate,
        end_date: endDate,
        recurso_forrajero: recursoForrajero,
        presencia_leñosas: presenciaLenosas,
        porcentaje_leñosas: porcentajeLenosas,
        sample_points: samplePoints.map(point => ({
          lat: point.lat,
          lng: point.lng,
          yield: point.yield
        })),
      };

      const response = await fetch('http://127.0.0.1:8000/api/disponibilidad/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setThumbUrl(data.thumb_url);
      } else {
        console.error('Error al estimar la disponibilidad de pasto:', response.statusText);
      }
    } catch (error) {
      console.error('Error al estimar la disponibilidad de pasto:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const _onCreate = (event) => {
    const { layer } = event;
    const newPositions = layer.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
    setPositions(newPositions);

    // // Enviar las coordenadas al servidor
    // setLoading(true);
    // sendCoordinates(newPositions);
  };
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    // Verificar si el clic está dentro del polígono
    if (positions.length > 0 && L.polygon(positions).getBounds().contains(e.latlng)) {
      setSelectedPoint({ lat, lng, yield: '' });
    }
  };

  const saveSamplePoint = () => {
    if (selectedPoint) {
      setSamplePoints([...samplePoints, selectedPoint]);
      setSelectedPoint(null);
    }
  };

  const chartData = {
    labels: data?.map(entry => format(new Date(entry.fecha), 'dd-MM-yyyy', { locale: es })),
    datasets: [
      {
        label: 'NDVI',
        data: data.map(entry => entry.NDVI),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  const applyChanges = () => {
    if (positions.length > 0) {
      setLoading(true);
      sendCoordinates(positions);
    } else {
      console.error('Por favor, dibuja un polígono primero.');
    }
  };
  // Componente para detectar clics en el mapa
  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };


  return (
    <div className="d-flex" style={{ height: '94vh',marginTop:'6vh'  }}>
      {/* Panel Izquierdo */}
      <div className="p-4 bg-light overflow-auto" style={{ width: '30%' }}>
        <h2 className="mb-4">Parámetros de NDVI</h2>
        <div className="form-group">
          <label>Fecha de Inicio:</label>
          <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-group mt-3">
          <label>Fecha de Fin:</label>
          <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="form-group mt-3">
          <label>Recurso Forrajero:</label>
          <input type="text" className="form-control" value={recursoForrajero} onChange={(e) => setRecursoForrajero(e.target.value)} placeholder="Ej: pastizal natural" />
        </div>
        <div className="form-group form-check mt-3">
          <input type="checkbox" className="form-check-input" id="presenciaLenosas" checked={presenciaLenosas} onChange={(e) => setPresenciaLenosas(e.target.checked)} />
          <label className="form-check-label" htmlFor="presenciaLenosas">Presencia de Leñosas</label>
        </div>
        <div className="form-group mt-3">
          <label>Porcentaje de Leñosas:</label>
          <input type="number" className="form-control" value={porcentajeLenosas} onChange={(e) => setPorcentajeLenosas(Number(e.target.value))} min="0" max="100" disabled={!presenciaLenosas} />
        </div>
        <h4>Puntos de Muestra</h4>
        {samplePoints.map((point, index) => (
          <div key={index} className="mb-3">
            <label>Punto {index + 1}</label>
            <div className="d-flex gap-2">
              <input
                type="number"
                value={point.lat}
                readOnly
                className="form-control"
              />
              <input
                type="number"
                value={point.lng}
                readOnly
                className="form-control"
              />
              <input
                type="number"
                value={point.yield}
                readOnly
                className="form-control"
              />
            </div>
          </div>
        ))}

        <button onClick={applyChanges} className="btn btn-primary mt-4 w-100">Aplicar</button>
        <button onClick={estimatePastureAvailability} className="btn btn-success mt-3 w-100">Estimar Disponibilidad de Pasto</button>

        {loading && <div className="text-center mt-4"><Spinner /></div>}

        {showChart && (
          <div ref={chartContainerRef} className="mt-5">
            <Line ref={chartRef} data={chartData} />
            <button onClick={() => {
              const link = document.createElement('a');
              link.href = chartRef.current.toBase64Image(); // Obtiene la imagen en base64
              link.download = 'chart.png'; // Nombre del archivo
              link.click(); // Simula el clic para descargar
            }} className="btn btn-secondary mt-3">Descargar Gráfico</button>
          </div>
        )}
      </div>

      {/* Panel Derecho: Mapa */}
      <div style={{ width: '70%' }}>
        <MapContainer center={[-31.5, -60.5]} zoom={7} style={{ height: '94vh', width: '100%'}}>
          <ReactLeafletGoogleLayer apiKey={process.env.REACT_APP_API} type={'hybrid'} />
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
          {selectedPoint && (
            <Marker position={[selectedPoint.lat, selectedPoint.lng]}>
              <Popup>
                <div>
                  <label>Producción (g/m²):</label>
                  <input
                    type="number"
                    value={selectedPoint.yield}
                    onChange={(e) => setSelectedPoint({ ...selectedPoint, yield: e.target.value })}
                    className="form-control mb-2"
                  />
                  <button onClick={saveSamplePoint} className="btn btn-primary w-100">Guardar Punto</button>
                </div>
              </Popup>
            </Marker>
          )}
          <MapClickHandler />
        </MapContainer>
      </div>
    </div>
  );
};

export default DrawMap;
