import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './index.css';

// Importar leaflet y leaflet-draw
import L from 'leaflet';
import 'leaflet-draw';

// Configuración de Leaflet-draw en castellano
L.drawLocal = { 
  draw: {
    toolbar: {
      // #TODO: this should be reorganized where actions are nested in actions
      // ex: actions.undo  or actions.cancel
      actions: {
        title: 'Cancelar dibujo',
        text: 'Cancelar'
      },
      finish: {
        title: 'Terminar dibujo',
        text: 'Terminar'
      },
      undo: {
       title: 'Borrar el último punto dibujado',
        text: 'Borrar último'
      },
      buttons: {
        polyline: 'Dibujar línea',
        polygon: 'Dibujar polígono',
        rectangle: 'Dibujar rectángulo',
        circle: 'Dibujar círculo',
        marker: 'Dibujar marcador'
      }
    },
    handlers: {
      circle: {
        tooltip: {
          start: 'Haga clic y arrastre para dibujar el círculo.'
        },
        radius: 'Radio'
      },
      circlemarker: {
        tooltip: {
          start: ''
        }
      },
      marker: {
        tooltip: {
          start: 'Haga clic para colocar el marcador.'
        }
      },
      polygon: {
        tooltip: {
          start: 'Haga clic para comenzar a dibujar el polígono.',
          cont: 'Haga clic para continuar dibujando el polígono.',
          end: 'Haga clic en el primer punto para cerrar el polígono.'
        }
      },
      polyline: {
        error: '<strong>Error:</strong> Los bordes de la línea no pueden cruzarse!',
        tooltip: {
          start: 'Haga clic para comenzar a dibujar la línea.',
          cont: 'Haga clic para continuar dibujando la línea.',
          end: 'Haga clic en el último punto para finalizar la línea.'
        }
      },
      rectangle: {
        tooltip: {
          start: 'Haga clic y arrastre para dibujar el rectángulo.'
        }
      },
      simpleshape: {
        tooltip: {
          end: ''
        }
      }
    }
  },
  edit: {
    toolbar: {
      actions: {
        save: {
          title: 'Guardar cambios',
          text: 'Guardar'
        },
        cancel: {
          title: 'Cancelar edición, descartar cambios',
          text: 'Cancelar'
        },
        clearAll: {
          title: 'Borrar todos los elementos',
          text: 'Borrar todo'
        }
      },
      buttons: {
        edit: 'Editar elementos',
        editDisabled: 'No hay elementos para editar',
        remove: 'Borrar elementos',
        removeDisabled: 'No hay elementos para borrar'
      }
    },
    handlers: {
      edit: {
        tooltip: {
          text: 'Arrastre los puntos para editar el elemento.',
          subtext: 'Haga clic en cancelar para deshacer los cambios.'
        }
      },
      remove: {
        tooltip: {
          text: 'Haga clic en un elemento para borrarlo.'
        }
      }
    }
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
