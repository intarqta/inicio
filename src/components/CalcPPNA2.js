// useCalculatePPNA.js
import { useMemo } from 'react';

const useCalculatePPNA = ({ aggregatedData, selectedResource, dominantRegion}) => {
  const calculatedData = useMemo(() => {
    if (!aggregatedData || aggregatedData.length === 0 || !selectedResource) {
      return [];
    }
    return aggregatedData.map(row => {
      // Si faltan datos necesarios, asignamos PPNA como null
      if (row.NDVImax === null || row.meanTemperatura === null || row.meanRadiacion === null) {
        return { ...row, PPNA: null };
      }
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
          PPNA = (0.408 + 0.367 * apart) * 10;
          break;
        case "campoNatural_nea":
          fPAR = 0.007 * Math.exp(6.0 * NDVImod);
          fPAR = Math.max(0, Math.min(fPAR, 0.95));
          tempReduction = -0.002 * Math.pow(T, 2) + 0.130 * T - 1.000;
          tempReduction = Math.max(0, Math.min(tempReduction, 1));
          apart = fPAR * tempReduction * rad;
          PPNA = (10.977753 + 0.57714 * apart + 0.3532 * row.latitud) * 10;
          break;
        default:
          fPAR = 0.007 * Math.exp(6.0 * NDVImod);
          fPAR = Math.max(0, Math.min(fPAR, 0.95));
          tempReduction = -0.002 * Math.pow(T, 2) + 0.130 * T - 1.000;
          tempReduction = Math.max(0, Math.min(tempReduction, 0.95));
          apart = fPAR * tempReduction * rad;
          PPNA = (0.408 + 0.367 * apart) * 10;
          break;
      }

      const regionName = dominantRegion && dominantRegion.name ? dominantRegion.name : "Sin Región";
      const recursoName = selectedResource.recurso || "Sin recurso";

      return {
        ...row,
        NDVImod,
        fPAR,
        tempReduction,
        PPNA,
        region: regionName,
        recurso: recursoName,
      };
    });
  }, [aggregatedData, selectedResource, dominantRegion]);

  return calculatedData;
};

export default useCalculatePPNA;
