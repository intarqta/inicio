// RadiationData.js
import React, { useEffect, useState } from 'react';

const RadiationData = ({ polygon }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRadiationData = async () => {
            if (!polygon) return;

            const params = new URLSearchParams({
                polygon: JSON.stringify(polygon),
                start: '20240101',               // Fecha de inicio
                end: '20240131',                 // Fecha de fin
                params: 'ALLSKY_SFC_SW_DWN',     // Radiación solar global
                format: 'JSON'
            });

            try {
                const response = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/area?${params}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchRadiationData();
    }, [polygon]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data) {
        return <div>No hay datos disponibles.</div>;
    }

    return (
        <div>
            <h1>Datos de Radiación Global</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default RadiationData;