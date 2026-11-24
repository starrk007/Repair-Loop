import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cambiarPrecioReemplazo,
  listarMisEquipos,
  registrarEquipo,
} from '../services/devicesService';

export function DevicesPage() {
  const [listaEquipos, setListaEquipos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [enviandoEquipo, setEnviandoEquipo] = useState(false);
  const [avisoError, setAvisoError] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState('');
  const [preciosEditados, setPreciosEditados] = useState({});

  const [equipoNuevo, setEquipoNuevo] = useState({
    tipo: 'Laptop',
    marca: '',
    modelo: '',
    precioReemplazo: '',
  });

  const cargarEquipos = async () => {
    setCargandoLista(true);
    setAvisoError('');
    try {
      const equipos = await listarMisEquipos();
      const lista = Array.isArray(equipos) ? equipos : [];
      setListaEquipos(lista);
      const mapaPrecios = {};
      lista.forEach((eq) => {
        mapaPrecios[eq.id] = eq.precioReemplazo ?? '';
      });
      setPreciosEditados(mapaPrecios);
    } catch (fallo) {
      setAvisoError(fallo.message || 'Error al cargar dispositivos');
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cambiarDatoEquipo = (evento) => {
    const { name, value } = evento.target;
    setEquipoNuevo((anterior) => ({ ...anterior, [name]: value }));
  };

  const guardarEquipo = async (evento) => {
    evento.preventDefault();
    setAvisoError('');
    setMensajeEstado('');
    setEnviandoEquipo(true);

    try {
      const cuerpo = {
        tipo: equipoNuevo.tipo,
        marca: equipoNuevo.marca,
        modelo: equipoNuevo.modelo,
        ...(equipoNuevo.precioReemplazo !== ''
          ? { precioReemplazo: Number(equipoNuevo.precioReemplazo) }
          : {}),
      };

      await registrarEquipo(cuerpo);

      setEquipoNuevo({
        tipo: 'Laptop',
        marca: '',
        modelo: '',
        precioReemplazo: '',
      });

      setMensajeEstado('Dispositivo registrado correctamente');
      await cargarEquipos();
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo registrar el dispositivo');
    } finally {
      setEnviandoEquipo(false);
    }
  };

  const actualizarPrecioEquipo = async (dispositivoId) => {
    setAvisoError('');
    setMensajeEstado('');
    const valorNumerico = Number(preciosEditados[dispositivoId]);

    try {
      await cambiarPrecioReemplazo(dispositivoId, valorNumerico);
      setMensajeEstado('Precio de referencia actualizado');
      await cargarEquipos();
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo actualizar el precio de reemplazo');
    }
  };

  return (
    <main className="pagina-contenido">
      <h1>Mis Dispositivos</h1>

      <section className="panel-formulario">
        <h2>Registrar dispositivo</h2>
        <form onSubmit={guardarEquipo} className="formulario-bloque">
          <label>
            Tipo de dispositivo
            <select name="tipo" value={equipoNuevo.tipo} onChange={cambiarDatoEquipo}>
              <option value="Laptop">Laptop</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Tablet">Tablet</option>
              <option value="Consola">Consola</option>
              <option value="PC Escritorio">PC Escritorio</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label>
            Marca
            <input
              type="text"
              name="marca"
              value={equipoNuevo.marca}
              onChange={cambiarDatoEquipo}
              placeholder="Ej. Acer, Samsung, Sony"
              maxLength={100}
              required
            />
          </label>

          <label>
            Modelo
            <input
              type="text"
              name="modelo"
              value={equipoNuevo.modelo}
              onChange={cambiarDatoEquipo}
              placeholder="Ej. Nitro 5 AN515"
              maxLength={100}
              required
            />
          </label>

          <label>
            Precio de referencia de reemplazo (MXN, opcional)
            <input
              type="number"
              name="precioReemplazo"
              value={equipoNuevo.precioReemplazo}
              onChange={cambiarDatoEquipo}
              min="0.01"
              step="0.01"
              placeholder="Ej. 18500"
            />
          </label>

          {avisoError && <p className="texto-error">{avisoError}</p>}
          {mensajeEstado && <p className="texto-exito">{mensajeEstado}</p>}

          <button type="submit" disabled={enviandoEquipo}>
            {enviandoEquipo ? 'Registrando...' : 'Agregar dispositivo'}
          </button>
        </form>
      </section>

      <section className="panel-listado">
        <h2>Equipos registrados</h2>
        {cargandoLista ? (
          <p>Cargando dispositivos...</p>
        ) : listaEquipos.length === 0 ? (
          <p>Aún no tienes dispositivos registrados.</p>
        ) : (
          <div className="rejilla-tarjetas">
            {listaEquipos.map((equipo) => (
              <article key={equipo.id} className="tarjeta-item">
                <h3>
                  {equipo.marca} {equipo.modelo}
                </h3>
                <p>Tipo: {equipo.tipo}</p>
                <p>
                  Precio de reemplazo:{' '}
                  {equipo.precioReemplazo !== null
                    ? `$${equipo.precioReemplazo.toFixed(2)}`
                    : 'Sin referencia'}
                </p>

                <div className="fila-compacta">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Nuevo precio"
                    value={preciosEditados[equipo.id] ?? ''}
                    onChange={(e) =>
                      setPreciosEditados((prev) => ({
                        ...prev,
                        [equipo.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => actualizarPrecioEquipo(equipo.id)}
                  >
                    Fijar precio
                  </button>
                </div>

                <Link to={`/solicitudes?dispositivoId=${equipo.id}`}>Reportar falla</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}