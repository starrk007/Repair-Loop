import { auth } from '../config/firebase';

const rutaServidor = import.meta.env.VITE_API_URL || '/api/v1';

export async function mandarPeticion(ruta, configuracion = {}) {
  const usuarioActual = auth.currentUser;
  const llaveSesion = usuarioActual ? await usuarioActual.getIdToken() : null;

  const cabeceras = {
    'Content-Type': 'application/json',
    ...(llaveSesion ? { Authorization: `Bearer ${llaveSesion}` } : {}),
    ...configuracion.headers,
  };

  const respuesta = await fetch(`${rutaServidor}${ruta}`, {
    ...configuracion,
    headers: cabeceras,
  });

  const infoRespuesta = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok || infoRespuesta.success === false) {
    throw new Error(infoRespuesta.error || infoRespuesta.message || `Fallo ${respuesta.status} al conectar`);
  }

  return infoRespuesta.data !== undefined ? infoRespuesta.data : infoRespuesta;
}