import { mandarPeticion } from './api';

export function listarReparaciones() {
  return mandarPeticion('/repairs');
}

export function avanzarEstadoReparacion(reparacionId, estado, observacion) {
  return mandarPeticion(`/repairs/${reparacionId}/status`, {
    method: 'POST',
    body: JSON.stringify({ estado, observacion }),
  });
}

export function consultarAhorroReparacion(reparacionId) {
  return mandarPeticion(`/repairs/${reparacionId}/savings`);
}