import test from 'node:test';
import assert from 'node:assert/strict';
import { validarAvanceReparacion, siguienteEstadoReparacion } from '../src/validation/repair.validation.js';
import { calcularAhorro } from '../src/validation/savings.validation.js';
import { validarPrecioReemplazo } from '../src/validation/money.validation.js';

test('solo permite transiciones lineales y observaciones válidas', () => {
    assert.deepEqual(validarAvanceReparacion('en_reparacion', 'Se inició el diagnóstico.'), {
        estado: 'en_reparacion', observacion: 'Se inició el diagnóstico.'
    });
    assert.equal(siguienteEstadoReparacion('asignada', 'en_reparacion'), 'en_reparacion');
    assert.throws(() => siguienteEstadoReparacion('asignada', 'finalizada'), /siguiente estado/);
    assert.throws(() => validarAvanceReparacion('cancelada', 'No aplica.'), /no es válido/);
    assert.throws(() => validarAvanceReparacion('en_reparacion', ''), /observación/);
});

test('calcula ahorro positivo en centavos', () => {
    const ahorro = calcularAhorro(2000.5, 1250.25);
    assert.equal(ahorro.disponible, true);
    assert.equal(ahorro.diferencia, 750.25);
    assert.equal(ahorro.porcentaje, 37.5);
});

test('representa ahorro negativo y referencia ausente sin inventar valores', () => {
    const negativo = calcularAhorro(1000, 1250);
    assert.equal(negativo.diferencia, -250);
    assert.match(negativo.mensaje, /supera/);

    const ausente = calcularAhorro(null, 1250);
    assert.deepEqual(ausente, {
        disponible: false,
        mensaje: 'No se puede estimar el ahorro porque falta un precio de reemplazo válido.'
    });
});

test('valida el precio de reemplazo con precisión de centavos', () => {
    assert.equal(validarPrecioReemplazo(1499.995), 1500);
    assert.throws(() => validarPrecioReemplazo(0), /positivo/);
    assert.throws(() => validarPrecioReemplazo(Infinity), /válido/);
});
