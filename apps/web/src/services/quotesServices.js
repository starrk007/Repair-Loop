import { mandarPeticion } from './api';

export function enviarCotizacion(solicitudId, datosCotizacion) {
  return mandarPeticion(`/repair-requests/${solicitudId}/quotes`, {
    method: 'POST',
    body: JSON.stringify(datosCotizacion),
  });
}

export function listarCotizacionesSolicitud(solicitudId) {
  return mandarPeticion(`/repair-requests/${solicitudId}/quotes`);
}

export function listarMisCotizaciones() {
  return mandarPeticion('/quotes');
}

export function aceptarCotizacion(cotizacionId) {
  return mandarPeticion(`/quotes/${cotizacionId}/accept`, {
    method: 'POST',
  });
}

export function rechazarCotizacion(cotizacionId) {
  return mandarPeticion(`/quotes/${cotizacionId}/reject`, {
    method: 'POST',
  });
}