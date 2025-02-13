// ResourceSelector.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';

const ResourceSelector = ({ dominantRegion, onSelectResource }) => {
  const [resourceMapping, setResourceMapping] = useState({});
  const [showOtros, setShowOtros] = useState(false);

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch('/resources.csv');
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const mapping = {};
            result.data.forEach((row) => {
              // Validamos que existan los campos necesarios
              if (row.region && row.calibrado_en && row.recurso && row.funcion) {
                const resource = {
                  recurso: row.recurso.trim(),
                  funcion: row.funcion.trim(),
                };
                const regionKey = row.region.trim();
                const calibradoEn = row.calibrado_en.trim();
                // Si "region" coincide con "calibrado_en", se agrupa bajo esa región; de lo contrario, en "otros".
                if (regionKey === calibradoEn) {
                  mapping[regionKey] = mapping[regionKey]
                    ? [...mapping[regionKey], resource]
                    : [resource];
                } else {
                  mapping['otros'] = mapping['otros']
                    ? [...mapping['otros'], resource]
                    : [resource];
                }
              }
            });
            setResourceMapping(mapping);
          },
          error: (error) => console.error('Error al parsear CSV:', error),
        });
      } catch (error) {
        console.error('Error al cargar el archivo CSV:', error);
      }
    };

    fetchCSV();
  }, []);

  const handleSelectChange = useCallback(
    (e) => {
      const selected = e.target.value;
      if (selected) {
        try {
          const resourceObj = JSON.parse(selected);
          onSelectResource(resourceObj);
        } catch (error) {
          console.error('Error al parsear el recurso seleccionado:', error);
          onSelectResource(null);
        }
      } else {
        onSelectResource(null);
      }
    },
    [onSelectResource]
  );

  const regionResources = useMemo(() => {
    return dominantRegion && resourceMapping[dominantRegion.name]
      ? resourceMapping[dominantRegion.name]
      : [];
  }, [dominantRegion, resourceMapping]);

  const otrosResources = useMemo(() => {
    return showOtros && resourceMapping['otros']
      ? resourceMapping['otros']
      : [];
  }, [showOtros, resourceMapping]);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '5px' }}>
        <input
          type="checkbox"
          checked={showOtros}
          onChange={() => setShowOtros((prev) => !prev)}
          style={{ marginRight: '5px' }}
        />
        Mostrar otros recursos
      </label>
      <select
        onChange={handleSelectChange}
        style={{
          display: 'block',
          width: '100%',
          padding: '5px 10px',
          border: 'none',
          borderRadius: '5px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
        }}
      >
        <option value="">Seleccione un recurso...</option>
        {dominantRegion && regionResources.length > 0 && (
          <optgroup label={`Recursos de ${dominantRegion.name}`}>
            {regionResources.map((res, index) => (
              <option key={`region-${index}`} value={JSON.stringify(res)}>
                {res.recurso}
              </option>
            ))}
          </optgroup>
        )}
        {otrosResources.length > 0 && (
          <optgroup label="Otros">
            {otrosResources.map((res, index) => (
              <option key={`otros-${index}`} value={JSON.stringify(res)}>
                {res.recurso}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
};

export default ResourceSelector;

// ResourceSelector.jsx
// import React, { useState, useEffect } from 'react';
// import Papa from 'papaparse';

// const ResourceSelector = ({ dominantRegion, onSelectResource}) => {
//   const [recurseForage, setRecurseForage] = useState({});
//   const [showOtros, setShowOtros] = useState(false);

//   useEffect(() => {
//     // Suponemos que el CSV se encuentra en public/resources.csv y tiene las columnas:
//     // region, calibrado_en, recurso, funcion (entre otras)
//     fetch('/resources.csv')
//       .then((response) => response.text())
//       .then((csvText) => {
//         Papa.parse(csvText, {
//           header: true,
//           complete: (result) => {
//             const mapping = {};
//             result.data.forEach((row) => {
//               // Validamos que existan los campos necesarios
//               if (row.region && row.calibrado_en && row.recurso && row.funcion) {
//                 const resource = {
//                   recurso: row.recurso.trim(),
//                   funcion: row.funcion.trim()
//                 };
//                 // Si el valor de "region" coincide con "calibrado_en", se agrupa bajo esa región.
//                 if (row.region.trim() === row.calibrado_en.trim()) {
//                   const key = row.region.trim();
//                   mapping[key] = mapping[key] ? [...mapping[key], resource] : [resource];
//                 } else {
//                   mapping['otros'] = mapping['otros'] ? [...mapping['otros'], resource] : [resource];
//                 }
//               }
//             });
//             setRecurseForage(mapping);
//           },
//           error: (error) => console.error('Error al parsear CSV:', error),
//         });
//       })
//       .catch((error) => console.error('Error al cargar el archivo CSV:', error));
//   }, []);

//   return (
//     <div>
//       <label style={{ display: 'block', marginBottom: '5px' }}>
//         <input
//           type="checkbox"
//           checked={showOtros}
//           onChange={() => setShowOtros((prev) => !prev)}
//           style={{ marginRight: '5px' }}
//         />
//         Mostrar otros recursos
//       </label>
//       <select
//         onChange={(e) => {
//           const selected = e.target.value;
//           if (selected) {
//             const resourceObj = JSON.parse(selected);
//             onSelectResource(resourceObj);
//           } else {
//             onSelectResource(null);
//           }
//         }}
//         style={{
//           display: 'block',
//           width: '100%',
//           padding: '5px 10px',
//           border: 'none',
//           borderRadius: '5px',
//           boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
//           cursor: 'pointer',
//         }}
//       >
//         <option value="">Seleccione un recurso...</option>
//         {dominantRegion && recurseForage[dominantRegion.name] && (
//           <optgroup label={`Recursos de ${dominantRegion.name}`}>
//             {recurseForage[dominantRegion.name].map((res, index) => (
//               <option key={`region-${index}`} value={JSON.stringify(res)}>
//                 {res.recurso}
//               </option>
//             ))}
//           </optgroup>
//         )}
//         {showOtros && recurseForage['otros'] && (
//           <optgroup label="Otros">
//             {recurseForage['otros'].map((res, index) => (
//               <option key={`otros-${index}`} value={JSON.stringify(res)}>
//                 {res.recurso}
//               </option>
//             ))}
//           </optgroup>
//         )}
//       </select>
//     </div>
//   );
// };

// export default ResourceSelector;

