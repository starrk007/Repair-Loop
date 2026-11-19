import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarMisEquipos } from '../services/devicesService';
import {
  crearSolicitud,
  listarSolicitudes,
  listarSolicitudesAbiertas,
} from '../services/requestsService';

export function RequestsPage() {
  const { datosPerfil } = useAuth();
  const [parametrosUrl] = useSearchParams();

  const [misEquipos, setMisEquipos] = useState([]);
  const [listaPedidos, setListaPedidos] = useState([]);
  const [cargandoTodo, setCargandoTodo] = useState(true);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [avisoError, setAvisoError] = useState('');

  const [pedidoNuevo, setPedidoNuevo] = useState({
    deviceId: parametrosUrl.get('deviceId') || '',
    description: '',
  });

  const esTecnico = datosPerfil?.role === 'technician';

  const cargarInformacion = async () => {
    setCargandoTodo(true);
    setAvisoError('');
    try {
      if (esTecnico) {
        const abiertas = await listarSolicitudesAbiertas();
        setListaPedidos(Array.isArray(abiertas) ? abiertas : []);
      } else {
        const [pedidosCliente, equiposCliente] = await Promise.all([
          listarSolicitudes(),
          listarMisEquipos(),
        ]);

        setListaPedidos(Array.isArray(pedidosCliente) ? pedidosCliente : []);
        const listaEq = Array.isArray(equiposCliente) ? equiposCliente : [];
        setMisEquipos(listaEq);

        if (!pedidoNuevo.deviceId && listaEq.length > 0) {
          setPedidoNuevo((anterior) => ({
            ...anterior,
            deviceId: listaEq[0].id,
          }));
        }
      }
    } catch (fallo) {
      setAvisoError(fallo.message || 'Error al cargar las solicitudes');
    } finally {
      setCargandoTodo(false);
    }
  };

  useEffect(() => {
    if (datosPerfil?.role) {
      cargarInformacion();
    }
  }, [datosPerfil?.role]);

  const cambiarDatoPedido = (evento) => {
    const { name, value } = evento.target;
    setPedidoNuevo((anterior) => ({ ...anterior, [name]: value }));
  };

  const mandarSolicitud = async (evento) => {
    evento.preventDefault();
    setAvisoError('');
    setEnviandoPedido(true);

    try {
      await crearSolicitud({
        deviceId: pedidoNuevo.deviceId,
        description: pedidoNuevo.description,
      });
      setPedidoNuevo((anterior) => ({
        ...anterior,
        description: '',
      }));
      await cargarInformacion();
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo crear la solicitud');
    } finally {
      setEnviandoPedido(false);
    }
  };

  return (
    <main className="pagina-contenido">
      <h1>Solicitudes de Reparación</h1>

      {!esTecnico && (
        <section className="panel-formulario">
          <h2>Nueva solicitud de falla</h2>
          {misEquipos.length === 0 ? (
            <p>Primero debes registrar un dispositivo en la sección Mis Dispositivos.</p>
          ) : (
            <form onSubmit={mandarSolicitud} className="formulario-bloque">
              <label>
                Dispositivo afectado
                <select
                  name="deviceId"
                  value={pedidoNuevo.deviceId}
                  onChange={cambiarDatoPedido}
                  required
                >
                  {misEquipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.brand} {equipo.model} ({equipo.type})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Descripción detallada de la falla (mínimo 10 caracteres)
                <textarea
                  name="description"
                  value={pedidoNuevo.description}
                  onChange={cambiarDatoPedido}
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  placeholder="Explica qué ocurrió y desde cuándo falla el equipo"
                  required
                />
              </label>

              {avisoError && <p className="texto-error">{avisoError}</p>}

              <button type="submit" disabled={enviandoPedido}>
                {enviandoPedido ? 'Publicando...' : 'Publicar solicitud'}
              </button>
            </form>
          )}
        </section>
      )}

      <section className="panel-listado">
        <h2>
          {esTecnico
            ? 'Solicitudes abiertas disponibles'
            : 'Mis solicitudes registradas'}
        </h2>

        {cargandoTodo ? (
          <p>Cargando solicitudes...</p>
        ) : listaPedidos.length === 0 ? (
          <p>No hay solicitudes registradas por el momento.</p>
        ) : (
          <div className="rejilla-tarjetas">
            {listaPedidos.map((pedido) => (
              <article key={pedido.id} className="tarjeta-item">
                <div className="cabecera-tarjeta">
                  <h3>Solicitud #{pedido.id.slice(0, 6)}</h3>
                  <span className="etiqueta-estado">{pedido.status || 'open'}</span>
                </div>
                <p>{pedido.description}</p>
                <p>Dispositivo ID: {pedido.deviceId}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}