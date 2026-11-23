export function calcularAhorro(precioReemplazo, costoReparacion) {
    if (typeof precioReemplazo !== 'number' || !Number.isFinite(precioReemplazo) || precioReemplazo <= 0) {
        return { disponible: false, mensaje: 'No se puede estimar el ahorro porque falta un precio de reemplazo válido.' };
    }
    const reemplazoCentavos = Math.round(precioReemplazo * 100);
    const reparacionCentavos = Math.round(costoReparacion * 100);
    const diferenciaCentavos = reemplazoCentavos - reparacionCentavos;
    const porcentaje = Math.round((diferenciaCentavos / reemplazoCentavos) * 10000) / 100;
    return {
        disponible: true,
        estimacion: true,
        precioReemplazo: reemplazoCentavos / 100,
        costoReparacion: reparacionCentavos / 100,
        diferencia: diferenciaCentavos / 100,
        porcentaje,
        mensaje: diferenciaCentavos < 0
            ? 'Reparar supera el precio de reemplazo.'
            : 'Estimación basada en el precio de reemplazo registrado.'
    };
}
