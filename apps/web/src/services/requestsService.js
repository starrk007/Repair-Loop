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