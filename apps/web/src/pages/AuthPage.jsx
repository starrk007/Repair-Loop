import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { iniciarSesion, crearCuenta } = useAuth();
  const navegar = useNavigate();

  const [esRegistro, setEsRegistro] = useState(false);
  const [cajaDatos, setCajaDatos] = useState({
    nombre: '',
    correo: '',
    clave: '',
    rol: 'usuario',
  });
  const [avisoError, setAvisoError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;
    setCajaDatos((previo) => ({ ...previo, [name]: value }));
  };

  const mandarFormulario = async (evento) => {
    evento.preventDefault();
    setAvisoError('');
    setProcesando(true);

    try {
      if (esRegistro) {
        await crearCuenta(cajaDatos);
      } else {
        await iniciarSesion({
          correo: cajaDatos.correo,
          clave: cajaDatos.clave,
        });
      }
      navegar('/perfil');
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo completar el acceso');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <main className="contenedor-acceso">
      <section className="tarjeta-acceso">
        <h1>RepairLoop</h1>
        <p>{esRegistro ? 'Crea tu cuenta para comenzar' : 'Ingresa a tu cuenta'}</p>

        <div className="pestanas-acceso">
          <button
            type="button"
            className={!esRegistro ? 'activa' : ''}
            onClick={() => setEsRegistro(false)}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={esRegistro ? 'activa' : ''}
            onClick={() => setEsRegistro(true)}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={mandarFormulario}>
          {esRegistro && (
            <label>
              Nombre completo
              <input
                type="text"
                name="nombre"
                value={cajaDatos.nombre}
                onChange={actualizarCampo}
                minLength={2}
                maxLength={100}
                required
              />
            </label>
          )}

          <label>
            Correo electrónico
            <input
              type="email"
              name="correo"
              value={cajaDatos.correo}
              onChange={actualizarCampo}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="clave"
              value={cajaDatos.clave}
              onChange={actualizarCampo}
              minLength={6}
              required
            />
          </label>

          {esRegistro && (
            <label>
              Tipo de cuenta
              <select name="rol" value={cajaDatos.rol} onChange={actualizarCampo}>
                <option value="usuario">Usuario</option>
                <option value="tecnico">Técnico</option>
              </select>
            </label>
          )}

          {avisoError && <p className="texto-error">{avisoError}</p>}

          <button type="submit" disabled={procesando}>
            {procesando ? 'Cargando...' : esRegistro ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}