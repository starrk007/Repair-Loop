export const identificadorValido = valor =>
    typeof valor === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(valor);

export function validarDescripcionSolicitud(descripcion) {
    return typeof descripcion === 'string' &&
        descripcion.trim().length >= 10 &&
        descripcion.trim().length <= 2000;
}
