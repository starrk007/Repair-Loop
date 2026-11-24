import { mandarPeticion } from './api';

export function listarSolicitudes() {
  return mandarPeticion('/repair-requests');
}

export function listarSolicitudesAbiertas() {
  return mandarPeticion('/repair-requests/open');
}

export function crearSolicitud(datosSolicitud) {
  return mandarPeticion('/repair-requests', {
    method: 'POST',
    body: JSON.stringify(datosSolicitud),
  });
}

export function editarSolicitud(solicitudId, descripcion) {
  return mandarPeticion(`/repair-requests/${solicitudId}`, {
    method: 'PATCH',
    body: JSON.stringify({ descripcion }),
  });
}

export function eliminarSolicitud(solicitudId) {
  return mandarPeticion(`/repair-requests/${solicitudId}`, {
    method: 'DELETE',
  });
}