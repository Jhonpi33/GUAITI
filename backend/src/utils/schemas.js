import Joi from 'joi';

const id = Joi.string().hex().length(24).required().messages({
  'string.hex': 'El identificador no es válido',
  'string.length': 'El identificador no es válido',
  'any.required': 'El identificador es obligatorio',
});

const correo = Joi.string()
  .trim()
  .email({ tlds: { allow: false } })
  .required()
  .messages({ 'string.email': 'El correo no tiene un formato válido', 'any.required': 'El correo es obligatorio' });

const password = Joi.string().min(8).max(72).required().messages({
  'string.min': 'La contraseña debe tener al menos 8 caracteres',
  'any.required': 'La contraseña es obligatoria',
});

/* ------------------------------- Auth ------------------------------- */
export const loginSchema = Joi.object({
  correo,
  password: Joi.string().required().messages({ 'any.required': 'La contraseña es obligatoria' }),
});

/* ------------------------------ Usuarios ---------------------------- */
export const crearUsuarioSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
  }),
  correo,
  password,
  rol: Joi.string().valid('admin', 'secretario', 'guia').required().messages({
    'any.only': 'El rol debe ser admin, secretario o guia',
    'any.required': 'El rol es obligatorio',
  }),
  activo: Joi.boolean(),
});

export const editarUsuarioSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120),
  correo,
  password: Joi.string().min(8).max(72).optional().allow(''),
  rol: Joi.string().valid('admin', 'secretario', 'guia'),
  activo: Joi.boolean(),
});

/* ------------------------------- Guías ------------------------------ */
export const crearGuiaSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'El nombre es obligatorio',
  }),
  telefono: Joi.string().trim().max(30).allow('', null),
  activo: Joi.boolean(),
  // El usuario con rol guia solo se exige cuando crearUsuario es true
  crearUsuario: Joi.boolean().default(false),
  correo: Joi.when('crearUsuario', {
    is: true,
    then: correo,
    otherwise: Joi.string().trim().email({ tlds: { allow: false } }).allow('', null).optional(),
  }),
  password: Joi.when('crearUsuario', {
    is: true,
    then: password,
    otherwise: Joi.string().allow('', null).optional(),
  }),
});

export const editarGuiaSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120),
  telefono: Joi.string().trim().max(30).allow('', null),
  activo: Joi.boolean(),
});

/* ------------------------------ Clientes ---------------------------- */
export const crearClienteSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'El nombre es obligatorio',
  }),
  cedula: Joi.string()
    .trim()
    .pattern(/^\d{6,12}$/)
    .required()
    .messages({
      'string.pattern.base': 'La cédula solo debe contener números (entre 6 y 12 dígitos)',
      'any.required': 'La cédula es obligatoria',
    }),
  telefono: Joi.string().trim().max(30).allow('', null),
  correo: Joi.string().trim().email({ tlds: { allow: false } }).allow('', null).messages({
    'string.email': 'El correo no tiene un formato válido',
  }),
});

export const editarClienteSchema = crearClienteSchema.fork(['nombre', 'cedula'], (s) => s.optional());

/* ----------------------------- Actividades -------------------------- */
export const actividadSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'El nombre es obligatorio',
  }),
  descripcion: Joi.string().allow('', null).max(2000),
  precioPorPersona: Joi.number().min(0).required().messages({
    'any.required': 'El precio por persona es obligatorio',
    'number.min': 'El precio no puede ser negativo',
  }),
  duracionMin: Joi.number().integer().min(0).allow(null),
  tipoRecurso: Joi.string().valid('cupo', 'moto').required().messages({
    'any.only': 'El tipo de recurso debe ser cupo o moto',
    'any.required': 'El tipo de recurso es obligatorio',
  }),
  imagenes: Joi.array().items(Joi.string().allow('', null)),
  activa: Joi.boolean(),
});

/* -------------------------------- Motos ----------------------------- */
export const motoSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'El nombre es obligatorio',
  }),
  estado: Joi.string().valid('disponible', 'mantenimiento', 'fuera_de_servicio').messages({
    'any.only': 'El estado debe ser disponible, mantenimiento o fuera_de_servicio',
  }),
  notas: Joi.string().allow('', null).max(1000),
});

export const estadoMotoSchema = Joi.object({
  estado: Joi.string()
    .valid('disponible', 'mantenimiento', 'fuera_de_servicio')
    .required()
    .messages({
      'any.only': 'El estado debe ser disponible, mantenimiento o fuera_de_servicio',
      'any.required': 'El estado es obligatorio',
    }),
});

/* ----------------------------- Parámetros --------------------------- */
export const parametroSchema = Joi.object({
  valor: Joi.required().messages({ 'any.required': 'El valor es obligatorio' }),
  descripcion: Joi.string().allow('', null).max(500),
});

/* ------------------------- Tarifas pago guía ------------------------ */
export const tarifaSchema = Joi.object({
  actividadId: id,
  unidad: Joi.string().valid('persona', 'moto').required().messages({
    'any.only': 'La unidad debe ser persona o moto',
    'any.required': 'La unidad es obligatoria',
  }),
  desde: Joi.number().integer().min(1).required().messages({
    'any.required': 'El valor mínimo de unidades (desde) es obligatorio',
    'number.min': "El campo 'desde' debe ser al menos 1",
  }),
  hasta: Joi.number().integer().min(1).allow(null),
  valor: Joi.number().min(0).required().messages({
    'any.required': 'El valor de la tarifa es obligatorio',
    'number.min': 'El valor de la tarifa no puede ser negativo',
  }),
  activa: Joi.boolean(),
});

export const idSchema = Joi.object({ id });
