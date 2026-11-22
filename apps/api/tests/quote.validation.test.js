import test from 'node:test';
import assert from 'node:assert/strict';
import { validarDatosCotizacion } from '../src/validation/quote.validation.js';

const concepto = (descripcion = 'Cambio de pantalla', cantidad = 1, precioUnitario = 100) => ({
    descripcion,
    cantidad,
    precioUnitario
});

test('calcula el total en centavos y normaliza los conceptos', () => {
    const resultado = validarDatosCotizacion({
        conceptos: [concepto('Pantalla', 2, 125.555), concepto('Mano de obra', 1, 50.1)],
        diasEstimados: 3
    });

    assert.equal(resultado.total, 301.22);
    assert.deepEqual(resultado.conceptos[0], {
        descripcion: 'Pantalla', cantidad: 2, precioUnitario: 125.56
    });
    assert.equal(resultado.diasEstimados, 3);
});

test('rechaza una lista vacía o con demasiados conceptos', () => {
    assert.throws(() => validarDatosCotizacion({ conceptos: [], diasEstimados: 1 }), /entre 1 y 20/);
    assert.throws(() => validarDatosCotizacion({
        conceptos: Array.from({ length: 21 }, () => concepto()), diasEstimados: 1
    }), /entre 1 y 20/);
});

test('rechaza tipos inválidos, valores no finitos y valores negativos', () => {
    assert.throws(() => validarDatosCotizacion({ conceptos: [concepto('xx', 1, NaN)], diasEstimados: 1 }), /precio unitario/);
    assert.throws(() => validarDatosCotizacion({ conceptos: [concepto('xx', 1, Infinity)], diasEstimados: 1 }), /precio unitario/);
    assert.throws(() => validarDatosCotizacion({ conceptos: [concepto('xx', 0, 1)], diasEstimados: 1 }), /cantidad/);
    assert.throws(() => validarDatosCotizacion({ conceptos: [concepto('xx', 1, -1)], diasEstimados: 1 }), /precio unitario/);
    assert.throws(() => validarDatosCotizacion({ conceptos: [concepto()], diasEstimados: 0 }), /días estimados/);
});

test('rechaza descripciones inválidas y totales fuera de límite', () => {
    assert.throws(() => validarDatosCotizacion({ conceptos: [concepto('x')], diasEstimados: 1 }), /descripción/);
    assert.throws(() => validarDatosCotizacion({
        conceptos: [concepto('Importe excesivo', 10000, 10000000)], diasEstimados: 1
    }), /excede el límite/);
});
