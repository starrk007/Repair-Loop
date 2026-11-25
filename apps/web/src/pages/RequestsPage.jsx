import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarMisEquipos } from '../services/devicesService';
import {
  crearSolicitud,
  editarSolicitud,
  eliminarSolicitud,
  listarSolicitudes,
  listarSolicitudesAbiertas,
} from '../services/requestsService';
import {
  aceptarCotizacion,
  enviarCotizacion,
  listarCotizacionesSolicitud,
  listarMisCotizaciones,
  rechazarCotizacion,
} from '../services/quotesService';

function calcularComparadorInicial(precioReemplazo, costoReparacion) {
  if (typeof precioReemplazo !== 'number' || precioReemplazo <= 0) {
    return {
      disponible: false,
      mensaje: 'Registra un precio de reemplazo en el dispositivo para estimar el ahorro.',
    };
  }
  const diferencia = Number((precioReemplazo - costoReparacion).toFixed(2));
  const porcentaje = Number(((diferencia / precioReemplazo) * 100).toFixed(2));
  return {
    disponible: true,
    precioReemplazo,
    costoReparacion,
    diferencia,
    porcentaje,
    mensaje:
      diferencia < 0
        ? 'Reparar supera el precio de reemplazo registrado.'
        : 'Ahorro estimado frente a comprar un equipo nuevo.',
  };
}

export function RequestsPage() {
  const { datosPerfil } = useAuth();
  const [parametrosUrl] = useSearchParams();
  const navegar = useNavigate();

  const [misEquipos, setMisEquipos] = useState([]);
  const [listaPedidos, setListaPedidos] = useState([]);
  const [misCotizaciones, setMisCotizaciones] = useState([]);
  const [cargandoTodo, setCargandoTodo] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [avisoError, setAvisoError] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState('');

  const [pedidoNuevo, setPedidoNuevo] = useState({
    dispositivoId: parametrosUrl.get('dispositivoId') || '',
    descripcion: '',
  });

  const [solicitudEditando, setSolicitudEditando] = useState(null);
  const [textoEdicion, setTextoEdicion] = useState('');

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [cotizacionesSolicitud, setCotizacionesSolicitud] = useState([]);

  const [solicitudCotizando, setSolicitudCotizando] = useState(null);
  const [diasEstimados, setDiasEstimados] = useState(2);
  const [conceptosCotizacion, setConceptosCotizacion] = useState([
    { descripcion: '', cantidad: 1, precioUnitario: '' },
  ]);

  const esTecnico = datosPerfil?.rol === 'tecnico';

  const cargarInformacion = async () => {
    setCargandoTodo(true);
    setAvisoError('');
    try {
      if (esTecnico) {
        const [abiertas, enviadas] = await Promise.all([
          listarSolicitudesAbiertas(),
          listarMisCotizaciones(),
        ]);
        setListaPedidos(Array.isArray(abiertas) ? abiertas : []);
        setMisCotizaciones(Array.isArray(enviadas) ? enviadas : []);
      } else {
        const [pedidosCliente, equiposCliente] = await Promise.all([
          listarSolicitudes(),
          listarMisEquipos(),
        ]);
        setListaPedidos(Array.isArray(pedidosCliente) ? pedidosCliente : []);
        const listaEq = Array.isArray(equiposCliente) ? equiposCliente : [];
        setMisEquipos(listaEq);

        if (!pedidoNuevo.dispositivoId && listaEq.length > 0) {
          setPedidoNuevo((anterior) => ({
            ...anterior,
            dispositivoId: listaEq[0].id,
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
    if (datosPerfil?.rol) {
      cargarInformacion();
    }
  }, [datosPerfil?.rol]);

  const mandarSolicitud = async (evento) => {
    evento.preventDefault();
    setAvisoError('');
    setMensajeEstado('');
    setProcesando(true);

    try {
      await crearSolicitud({
        dispositivoId: pedidoNuevo.dispositivoId,
        descripcion: pedidoNuevo.descripcion,
      });
      setPedidoNuevo((anterior) => ({ ...anterior, descripcion: '' }));
      setMensajeEstado('Solicitud publicada correctamente');
      await cargarInformacion();
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo crear la solicitud');
    } finally {
      setProcesando(false);
    }
  };

  const guardarEdicion = async (solicitudId) => {
    setAvisoError('');
    setMensajeEstado('');
    setProcesando(true);
    try {
      await editarSolicitud(solicitudId, textoEdicion);
      setSolicitudEditando(null);
      setMensajeEstado('Solicitud actualizada');
      await cargarInformacion();
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo editar la solicitud');
    } finally {
      setProcesando(false);
    }
  };

  const borrarSolicitud = async (solicitudId) => {
    setAvisoError('');
    setMensajeEstado('');
    setProcesando(true);
    try {
      await eliminarSolicitud(solicitudId);
      if (solicitudSeleccionada?.id === solicitudId) {
        setSolicitudSeleccionada(null);
      }
      setMensajeEstado('Solicitud eliminada');
      await cargarInformacion();
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo eliminar la solicitud');
    } finally {
      setProcesando(false);
    }
  };

  const verCotizaciones = async (solicitud) => {
    setAvisoError('');
    setSolicitudSeleccionada(solicitud);
    try {
      const lista = await listarCotizacionesSolicitud(solicitud.id);
      setCotizacionesSolicitud(Array.isArray(lista) ? lista : []);
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudieron consultar las cotizaciones');
    }
  };

  const decidirCotizacion = async (cotizacionId, accion) => {
    setAvisoError('');
    setMensajeEstado('');
    setProcesando(true);
    try {
      if (accion === 'aceptar') {
        await aceptarCotizacion(cotizacionId);
        setMensajeEstado('Cotización aceptada y reparación asignada');
        navegar('/reparaciones');
      } else {
        await rechazarCotizacion(cotizacionId);
        setMensajeEstado('Cotización rechazada');
        if (solicitudSeleccionada) {
          await verCotizaciones(solicitudSeleccionada);
        }
      }
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo procesar la decisión');
    } finally {
      setProcesando(false);
    }
  };

  const agregarConcepto = () => {
    if (conceptosCotizacion.length < 20) {
      setConceptosCotizacion((prev) => [
        ...prev,
        { descripcion: '', cantidad: 1, precioUnitario: '' },
      ]);
    }
  };

  const quitarConcepto = (indice) => {
    if (conceptosCotizacion.length > 1) {
      setConceptosCotizacion((prev) => prev.filter((_, idx) => idx !== indice));
    }
  };

  const cambiarConcepto = (indice, campo, valor) => {
    setConceptosCotizacion((prev) =>
      prev.map((item, idx) => (idx === indice ? { ...item, [campo]: valor } : item))
    );
  };

  const mandarNuevaCotizacion = async (evento) => {
    evento.preventDefault();
    if (!solicitudCotizando) return;
    setAvisoError('');
    setMensajeEstado('');
    setProcesando(true);

    try {
      const payload = {
        diasEstimados: Number(diasEstimados),
        conceptos: conceptosCotizacion.map((c) => ({
          descripcion: c.descripcion,
          cantidad: Number(c.cantidad),
          precioUnitario: Number(c.precioUnitario),
        })),
      };

      await enviarCotizacion(solicitudCotizando.id, payload);
      setSolicitudCotizando(null);
      setConceptosCotizacion([{ descripcion: '', cantidad: 1, precioUnitario: '' }]);
      setDiasEstimados(2);
      setMensajeEstado('Cotización enviada al cliente');
      await cargarInformacion();
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo enviar la cotización');
    } finally {
      setProcesando(false);
    }
  };

  const equipoDeSolicitud = (dispositivoId) =>
    misEquipos.find((eq) => eq.id === dispositivoId);

  const totalBorrador = conceptosCotizacion.reduce(
    (acc, item) => acc + (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0),
    0
  );

  return (
    <main className="pagina-contenido">
      <h1>Solicitudes de Reparación</h1>

      {avisoError && <p className="texto-error">{avisoError}</p>}
      {mensajeEstado && <p className="texto-exito">{mensajeEstado}</p>}

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
                  name="dispositivoId"
                  value={pedidoNuevo.dispositivoId}
                  onChange={(e) =>
                    setPedidoNuevo((prev) => ({ ...prev, dispositivoId: e.target.value }))
                  }
                  required
                >
                  {misEquipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.marca} {equipo.modelo} ({equipo.tipo})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Descripción detallada de la falla (mínimo 10 caracteres)
                <textarea
                  name="descripcion"
                  value={pedidoNuevo.descripcion}
                  onChange={(e) =>
                    setPedidoNuevo((prev) => ({ ...prev, descripcion: e.target.value }))
                  }
                  minLength={10}
                  maxLength={2000}
                  rows={3}
                  placeholder="Explica qué ocurrió y desde cuándo falla el equipo"
                  required
                />
              </label>

              <button type="submit" disabled={procesando}>
                {procesando ? 'Publicando...' : 'Publicar solicitud'}
              </button>
            </form>
          )}
        </section>
      )}

      {esTecnico && solicitudCotizando && (
        <section className="panel-formulario">
          <div className="cabecera-tarjeta">
            <h2>Cotizar solicitud #{solicitudCotizando.id.slice(0, 6)}</h2>
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setSolicitudCotizando(null)}
            >
              Cancelar
            </button>
          </div>
          <p>{solicitudCotizando.descripcion}</p>

          <form onSubmit={mandarNuevaCotizacion} className="formulario-bloque">
            <label>
              Tiempo estimado (días enteros)
              <input
                type="number"
                min="1"
                max="3650"
                step="1"
                value={diasEstimados}
                onChange={(e) => setDiasEstimados(e.target.value)}
                required
              />
            </label>

            <div className="bloque-conceptos">
              <h3>Conceptos desglosados</h3>
              {conceptosCotizacion.map((concepto, indice) => (
                <div key={indice} className="fila-concepto">
                  <input
                    type="text"
                    placeholder="Descripción (ej. Cambio de pasta térmica)"
                    value={concepto.descripcion}
                    onChange={(e) => cambiarConcepto(indice, 'descripcion', e.target.value)}
                    minLength={2}
                    maxLength={500}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Cant."
                    min="1"
                    max="10000"
                    step="1"
                    value={concepto.cantidad}
                    onChange={(e) => cambiarConcepto(indice, 'cantidad', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio unit."
                    min="0"
                    step="0.01"
                    value={concepto.precioUnitario}
                    onChange={(e) => cambiarConcepto(indice, 'precioUnitario', e.target.value)}
                    required
                  />
                  {conceptosCotizacion.length > 1 && (
                    <button
                      type="button"
                      className="boton-secundario"
                      onClick={() => quitarConcepto(indice)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="boton-secundario" onClick={agregarConcepto}>
                Agregar concepto
              </button>
            </div>

            <p>Total estimado: ${totalBorrador.toFixed(2)}</p>

            <button type="submit" disabled={procesando}>
              {procesando ? 'Enviando...' : 'Enviar cotización'}
            </button>
          </form>
        </section>
      )}

      {!esTecnico && solicitudSeleccionada && (
        <section className="panel-formulario">
          <div className="cabecera-tarjeta">
            <h2>Cotizaciones para solicitud #{solicitudSeleccionada.id.slice(0, 6)}</h2>
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setSolicitudSeleccionada(null)}
            >
              Cerrar comparador
            </button>
          </div>
          <p>{solicitudSeleccionada.descripcion}</p>

          {cotizacionesSolicitud.length === 0 ? (
            <p className="espacio-superior">Aún no has recibido cotizaciones para esta solicitud.</p>
          ) : (
            <div className="rejilla-tarjetas">
              {cotizacionesSolicitud.map((cot) => {
                const equipo = equipoDeSolicitud(solicitudSeleccionada.dispositivoId);
                const ahorro = calcularComparadorInicial(equipo?.precioReemplazo, cot.total);

                return (
                  <article key={cot.id} className="tarjeta-item">
                    <div className="cabecera-tarjeta">
                      <h3>{cot.nombreTecnico || 'Técnico'}</h3>
                      <span className="etiqueta-estado">{cot.estado}</span>
                    </div>

                    <p>Tiempo estimado: {cot.diasEstimados} día(s)</p>
                    <ul className="lista-conceptos">
                      {cot.conceptos?.map((c, idx) => (
                        <li key={idx}>
                          {c.cantidad}x {c.descripcion} — ${c.precioUnitario}
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>Total cotizado: ${cot.total.toFixed(2)}</strong>
                    </p>

                    <div className="caja-ahorro">
                      <p>
                        <strong>Comparador de ahorro</strong>
                      </p>
                      {ahorro.disponible ? (
                        <>
                          <p>Precio reemplazo: ${ahorro.precioReemplazo.toFixed(2)}</p>
                          <p>Costo reparación: ${ahorro.costoReparacion.toFixed(2)}</p>
                          <p>
                            Diferencia: ${ahorro.diferencia.toFixed(2)} ({ahorro.porcentaje}%)
                          </p>
                          <p>{ahorro.mensaje}</p>
                        </>
                      ) : (
                        <p>{ahorro.mensaje}</p>
                      )}
                    </div>

                    {cot.estado === 'pendiente' && solicitudSeleccionada.estado === 'abierta' && (
                      <div className="fila-acciones">
                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() => decidirCotizacion(cot.id, 'aceptar')}
                        >
                          Aceptar
                        </button>
                        <button
                          type="button"
                          className="boton-secundario"
                          disabled={procesando}
                          onClick={() => decidirCotizacion(cot.id, 'rechazar')}
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="panel-listado">
        <h2>
          {esTecnico ? 'Solicitudes abiertas disponibles' : 'Mis solicitudes registradas'}
        </h2>

        {cargandoTodo ? (
          <p>Cargando solicitudes...</p>
        ) : listaPedidos.length === 0 ? (
          <p>No hay solicitudes registradas por el momento.</p>
        ) : (
          <div className="rejilla-tarjetas">
            {listaPedidos.map((pedido) => {
              const equipo = equipoDeSolicitud(pedido.dispositivoId);
              const yaCotizadaPorMi =
                esTecnico && misCotizaciones.some((c) => c.solicitudId === pedido.id);

              return (
                <article key={pedido.id} className="tarjeta-item">
                  <div className="cabecera-tarjeta">
                    <h3>Solicitud #{pedido.id.slice(0, 6)}</h3>
                    <span className="etiqueta-estado">{pedido.estado}</span>
                  </div>

                  {equipo && (
                    <p>
                      Equipo: {equipo.marca} {equipo.modelo}
                    </p>
                  )}

                  {solicitudEditando === pedido.id ? (
                    <div className="formulario-bloque">
                      <textarea
                        rows={3}
                        minLength={10}
                        maxLength={2000}
                        value={textoEdicion}
                        onChange={(e) => setTextoEdicion(e.target.value)}
                      />
                      <div className="fila-acciones">
                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() => guardarEdicion(pedido.id)}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() => setSolicitudEditando(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{pedido.descripcion}</p>
                  )}

                  {!esTecnico && (
                    <div className="fila-acciones">
                      <button
                        type="button"
                        onClick={() => verCotizaciones(pedido)}
                      >
                        Ver cotizaciones
                      </button>
                      {pedido.estado === 'abierta' && solicitudEditando !== pedido.id && (
                        <>
                          <button
                            type="button"
                            className="boton-secundario"
                            onClick={() => {
                              setSolicitudEditando(pedido.id);
                              setTextoEdicion(pedido.descripcion);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="boton-secundario"
                            disabled={procesando}
                            onClick={() => borrarSolicitud(pedido.id)}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {esTecnico && (
                    <div className="fila-acciones">
                      {yaCotizadaPorMi ? (
                        <span className="etiqueta-estado">Ya cotizada</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSolicitudCotizando(pedido)}
                        >
                          Cotizar falla
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {esTecnico && (
        <section className="panel-listado">
          <h2>Mis cotizaciones enviadas</h2>
          {misCotizaciones.length === 0 ? (
            <p>Aún no has enviado cotizaciones.</p>
          ) : (
            <div className="rejilla-tarjetas">
              {misCotizaciones.map((cot) => (
                <article key={cot.id} className="tarjeta-item">
                  <div className="cabecera-tarjeta">
                    <h3>Solicitud #{cot.solicitudId.slice(0, 6)}</h3>
                    <span className="etiqueta-estado">{cot.estado}</span>
                  </div>
                  <p>Total: ${cot.total.toFixed(2)}</p>
                  <p>Días estimados: {cot.diasEstimados}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}