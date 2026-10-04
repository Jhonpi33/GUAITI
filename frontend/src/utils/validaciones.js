/** Reglas de validación en español para q-form / q-input. */

export const reglas = {
  obligatorio: (valor) => (valor !== null && valor !== undefined && String(valor).trim() !== '') || 'Este campo es obligatorio',

  nombre: (valor) => (String(valor || '').trim().length >= 2) || 'El nombre debe tener al menos 2 caracteres',

  correo: (valor) =>
    !valor || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) || 'El correo no tiene un formato válido',

  correoObligatorio: (valor) =>
    (!!valor && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) || 'El correo es obligatorio y debe tener un formato válido',

  password: (valor) =>
    !valor || String(valor).length >= 8 || 'La contraseña debe tener al menos 8 caracteres',

  passwordObligatorio: (valor) =>
    (!!valor && String(valor).length >= 8) || 'La contraseña debe tener al menos 8 caracteres',

  cedula: (valor) =>
    (!!valor && /^\d{6,12}$/.test(String(valor).trim())) ||
    'La cédula solo debe contener números (entre 6 y 12 dígitos)',

  precio: (valor) =>
    (valor !== '' && valor !== null && !Number.isNaN(Number(valor)) && Number(valor) >= 0) ||
    'Ingrese un precio válido (número igual o mayor a 0)',

  enteroDesdeUno: (valor) =>
    (valor !== '' && Number.isInteger(Number(valor)) && Number(valor) >= 1) ||
    'Ingrese un número entero mayor o igual a 1',

  enteroDesdeCero: (valor) =>
    (valor !== '' && Number.isInteger(Number(valor)) && Number(valor) >= 0) ||
    'Ingrese un número entero mayor o igual a 0',
};
