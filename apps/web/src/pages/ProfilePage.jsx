import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  crearMiPerfil,
  guardarPerfilTecnico,
  traerPerfilTecnico,
} from '../services/profileService';

export function ProfilePage() {
  const { datosPerfil, recargarPerfil } = useAuth();

  const [fichaTaller, setFichaTaller] = useState({
    descripcion: '',
    servicios: '',
  });

  const [tienePerfilTecnico, setTienePerfilTecnico] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');
  const [avisoError, setAvisoError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarDatosTecnico = async () => {
      if (datosPerfil?.rol !== 'tecnico') {
        return;
      }
      try {
        const perfilTec = await traerPerfilTecnico();
        setFichaTaller({
          descripcion: perfilTec.descripcion || '',
          servicios: Array.isArray(perfilTec.servicios)
            ? perfilTec.servicios.join(', ')
            : '',
        });
        setTienePerfilTecnico(true);
      } catch {
        setTienePerfilTecnico(false);
      }
    };

    cargarDatosTecnico();
  }, [datosPerfil?.rol]);

  const cambiarTaller = (evento) => {
    const { name, value } = evento.target;
    setFichaTaller((anterior) => ({ ...anterior, [name]: value }));
  };

  const sincronizarUsuario = async () => {
    setMensajeEstado('');
    setAvisoError('');
    setGuardando(true);
    try {
      await crearMiPerfil({
        nombre: datosPerfil?.nombre || 'Usuario',
        rol: datosPerfil?.rol || 'usuario',
      });
      await recargarPerfil();
      setMensajeEstado('Perfil de usuario registrado en base de datos');
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo registrar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const enviarTaller = async (evento) => {
    evento.preventDefault();
    setMensajeEstado('');
    setAvisoError('');
    setGuardando(true);

    try {
      const listaServicios = fichaTaller.servicios
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      await guardarPerfilTecnico({
        descripcion: fichaTaller.descripcion,
        servicios: listaServicios,
      });

      setTienePerfilTecnico(true);
      setMensajeEstado('Perfil técnico guardado correctamente');
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo guardar el perfil técnico');
    } finally {
      setGuardando(false);
    }
  };

  const etiquetaRol = datosPerfil?.rol === 'tecnico' ? 'Técnico' : 'Cliente';

  return (
    <main className="pagina-contenido">
      <h1>Mi Perfil</h1>

      <section className="panel-formulario">
        <p>Nombre: {datosPerfil?.nombre}</p>
        <p>Correo registrado: {datosPerfil?.correo}</p>
        <p>Rol activo: {etiquetaRol}</p>

        {!datosPerfil?.fechaCreacion && (
          <div className="formulario-bloque">
            <button type="button" onClick={sincronizarUsuario} disabled={guardando}>
              Completar registro de perfil en servidor
            </button>
          </div>
        )}
      </section>

      {datosPerfil?.rol === 'tecnico' && (
        <section className="panel-formulario">
          <h2>Perfil profesional del técnico</h2>
          <form onSubmit={enviarTaller} className="formulario-bloque">
            <label>
              Descripción de experiencia y taller (mínimo 10 caracteres)
              <textarea
                name="descripcion"
                value={fichaTaller.descripcion}
                onChange={cambiarTaller}
                minLength={10}
                maxLength={1000}
                rows={4}
                required
                disabled={tienePerfilTecnico}
              />
            </label>

            <label>
              Servicios ofrecidos (separados por coma)
              <input
                type="text"
                name="servicios"
                value={fichaTaller.servicios}
                onChange={cambiarTaller}
                placeholder="Cambio de pantalla, Limpieza interna, Cambio de batería"
                required
                disabled={tienePerfilTecnico}
              />
            </label>

            {!tienePerfilTecnico && (
              <button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Registrar perfil técnico'}
              </button>
            )}
          </form>
        </section>
      )}

      {mensajeEstado && <p className="texto-exito">{mensajeEstado}</p>}
      {avisoError && <p className="texto-error">{avisoError}</p>}
    </main>
  );
}