import { mandarPeticion } from './api';

export function listarMisEquipos() {
  return mandarPeticion('/devices');
}

export function registrarEquipo(datosEquipo) {
  return mandarPeticion('/devices', {
    method: 'POST',
    body: JSON.stringify(datosEquipo),
  });
}

export function cambiarPrecioReemplazo(dispositivoId, precioReemplazo) {
  return mandarPeticion(`/devices/${dispositivoId}/replacement-price`, {
    method: 'PATCH',
    body: JSON.stringify({ precioReemplazo }),
  });
}