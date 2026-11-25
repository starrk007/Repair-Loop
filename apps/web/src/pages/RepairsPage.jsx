import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  avanzarEstadoReparacion,
  consultarAhorroReparacion,
  listarReparaciones,
} from '../services/repairsService';

const SIGUIENTE_ESTADO = {
  asignada: { valor: 'en_reparacion', etiqueta: 'Iniciar reparación' },
  en_reparacion: { valor: 'finalizada', etiqueta: 'Marcar como finalizada' },
};

export function RepairsPage() {
  const { datosPerfil } = useAuth();
  const [reparaciones, setReparaciones] = useState([]);
  const [ahorrosPorId, setAhorrosPorId] = useState({});
  const [observaciones, setObservaciones] = useState({});
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [avisoError, setAvisoError] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState('');

  const esTecnico = datosPerfil?.rol === 'tecnico';

  const cargarReparaciones = async () => {
    setCargando(true);
    setAvisoError('');
    try {
      const lista = await listarReparaciones();
      const arreglo = Array.isArray(lista) ? lista : [];
      setReparaciones(arreglo);

      const mapaAhorros = {};
      await Promise.all(
        arreglo.map(async (rep) => {
          try {
            mapaAhorros[rep.id] = await consultarAhorroReparacion(rep.id);
          } catch {
            mapaAhorros[rep.id] = null;
          }
        })
      );
      setAhorrosPorId(mapaAhorros);
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudieron cargar las reparaciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReparaciones();
  }, []);

  const registrarAvance = async (reparacionId, estadoSiguiente) => {
    setAvisoError('');
    setMensajeEstado('');
    setProcesando(true);

    try {
      const textoObs = observaciones[reparacionId] || '';
      await avanzarEstadoReparacion(reparacionId, estadoSiguiente, textoObs);
      setObservaciones((prev) => ({ ...prev, [reparacionId]: '' }));
      setMensajeEstado('Estado de reparación actualizado');
      await cargarReparaciones();
    } catch (fallo) {
      setAvisoError(fallo.message || 'No se pudo actualizar el estado');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <main className="pagina-contenido">
      <h1>Seguimiento de Reparaciones</h1>

      {avisoError && <p className="texto-error">{avisoError}</p>}
      {mensajeEstado && <p className="texto-exito">{mensajeEstado}</p>}

      <section className="panel-listado">
        <h2>{esTecnico ? 'Reparaciones asignadas' : 'Mis reparaciones'}</h2>

        {cargando ? (
          <p>Cargando reparaciones...</p>
        ) : reparaciones.length === 0 ? (
          <p>Aún no hay reparaciones activas.</p>
        ) : (
          <div className="lista-reparaciones">
            {reparaciones.map((rep) => {
              const siguiente = SIGUIENTE_ESTADO[rep.estado];
              const ahorro = ahorrosPorId[rep.id];

              return (
                <article key={rep.id} className="tarjeta-item">
                  <div className="cabecera-tarjeta">
                    <h3>
                      {rep.dispositivo?.marca} {rep.dispositivo?.modelo} ({rep.dispositivo?.tipo})
                    </h3>
                    <span className="etiqueta-estado">{rep.estado}</span>
                  </div>

                  <p>Cliente: {rep.nombreUsuario || rep.usuarioId}</p>
                  <p>Técnico asignado: {rep.nombreTecnico || rep.tecnicoId}</p>
                  <p>
                    Total acordado: ${rep.cotizacionAceptada?.total?.toFixed(2)} · Tiempo estimado:{' '}
                    {rep.cotizacionAceptada?.diasEstimados} día(s)
                  </p>

                  {ahorro && (
                    <div className="caja-ahorro">
                      <p>
                        <strong>Comparador de ahorro</strong>
                      </p>
                      {ahorro.disponible ? (
                        <>
                          <p>
                            Reemplazo: ${ahorro.precioReemplazo.toFixed(2)} · Reparación: $
                            {ahorro.costoReparacion.toFixed(2)}
                          </p>
                          <p>
                            Diferencia: ${ahorro.diferencia.toFixed(2)} ({ahorro.porcentaje}%)
                          </p>
                          <p>{ahorro.mensaje}</p>
                        </>
                      ) : (
                        <p>{ahorro.mensaje}</p>
                      )}
                    </div>
                  )}

                  <div className="bloque-historial">
                    <h3>Historial de avances</h3>
                    <ul className="lista-historial">
                      {rep.historial?.map((evento, idx) => (
                        <li key={idx}>
                          <strong>{evento.estado}</strong> — {evento.observacion} (
                          {evento.fecha ? new Date(evento.fecha).toLocaleString() : ''})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {esTecnico && siguiente && (
                    <div className="formulario-bloque">
                      <label>
                        Observación del avance (mínimo 2 caracteres)
                        <input
                          type="text"
                          placeholder="Ej. Diagnóstico confirmado y refacción instalada"
                          value={observaciones[rep.id] ?? ''}
                          onChange={(e) =>
                            setObservaciones((prev) => ({
                              ...prev,
                              [rep.id]: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() => registrarAvance(rep.id, siguiente.valor)}
                      >
                        {siguiente.etiqueta}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}