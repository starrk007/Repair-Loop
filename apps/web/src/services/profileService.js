import { mandarPeticion } from './api';

export function traerMiPerfil() {
  return mandarPeticion('/users/me');
}

export function crearMiPerfil(datosPerfil) {
  return mandarPeticion('/users/me', {
    method: 'POST',
    body: JSON.stringify(datosPerfil),
  });
}

export function traerPerfilTecnico() {
  return mandarPeticion('/technicians/me');
}

export function guardarPerfilTecnico(datosTecnico) {
  return mandarPeticion('/technicians/me', {
    method: 'POST',
    body: JSON.stringify(datosTecnico),
  });
}