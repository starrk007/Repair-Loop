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