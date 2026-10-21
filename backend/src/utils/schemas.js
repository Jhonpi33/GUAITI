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

export const guiaIdSchema = Joi.object({ guiaId: id });

const idOpcional = Joi.string().hex().length(24).optional().messages({
  'string.hex': 'El identificador no es válido',
  'string.length': 'El identificador no es válido',
});

const fecha = Joi.date().required().messages({
  'any.required': 'La fecha es obligatoria',
  'date.base': 'La fecha no tiene un formato válido',
});

const fechaOpcional = Joi.date().optional().allow(null);

/* ============================ Fase 3 ============================ */

/* ------------------------------ Cascos -------------------------- */
export const cascoSchema = Joi.object({
  numero: Joi.number().integer().min(1).required().messages({
    'any.required': 'El número del casco es obligatorio',
    'number.min': 'El número del casco debe ser mayor a 0',
    'number.integer': 'El número del casco debe ser un entero',
  }),
  estado: Joi.string()
    .valid('disponible', 'en_uso', 'por_lavar', 'danado', 'perdido')
    .messages({ 'any.only': 'El estado debe ser disponible, en_uso, por_lavar, danado o perdido' }),
});

export const editarCascoSchema = Joi.object({
  numero: Joi.number().integer().min(1).messages({
    'number.min': 'El número del casco debe ser mayor a 0',
    'number.integer': 'El número del casco debe ser un entero',
  }),
  estado: Joi.string()
    .valid('disponible', 'en_uso', 'por_lavar', 'danado', 'perdido')
    .messages({ 'any.only': 'El estado debe ser disponible, en_uso, por_lavar, danado o perdido' }),
});

export const estadoCascoSchema = Joi.object({
  estado: Joi.string()
    .valid('disponible', 'en_uso', 'por_lavar', 'danado', 'perdido')
    .required()
    .messages({
      'any.only': 'El estado debe ser disponible, en_uso, por_lavar, danado o perdido',
      'any.required': 'El estado es obligatorio',
    }),
});

export const rangoCascosSchema = Joi.object({
  desde: Joi.number().integer().min(1).required().messages({
    'any.required': 'El número inicial del rango es obligatorio',
    'number.min': 'El número inicial del rango debe ser al menos 1',
  }),
  hasta: Joi.number().integer().min(1).required().messages({
    'any.required': 'El número final del rango es obligatorio',
    'number.min': 'El número final del rango debe ser al menos 1',
  }),
});

/* ------------------------------ Salidas ------------------------- */
export const crearSalidaSchema = Joi.object({
  guiaId: idOpcional,
  fecha,
  actividadId: id,
  personas: Joi.number().integer().min(1).required().messages({
    'any.required': 'La cantidad de personas es obligatoria',
    'number.min': 'La cantidad de personas debe ser al menos 1',
  }),
  motos: Joi.array().items(idOpcional).default([]),
  cascos: Joi.array().items(idOpcional).default([]),
  novedades: Joi.string().allow('', null).max(2000),
  excepcionMotos: Joi.boolean().default(false),
});

export const estadoSalidaSchema = Joi.object({
  estado: Joi.string().valid('en_curso', 'cerrada').required().messages({
    'any.only': 'El estado debe ser en_curso o cerrada',
    'any.required': 'El estado es obligatorio',
  }),
  novedades: Joi.string().allow('', null).max(2000),
  cascosEstado: Joi.array()
    .items(
      Joi.object({
        cascoId: id,
        estado: Joi.string()
          .valid('disponible', 'por_lavar', 'danado', 'perdido')
          .required()
          .messages({ 'any.only': 'El estado del casco debe ser disponible, por_lavar, danado o perdido' }),
      })
    )
    .default([]),
});

export const excepcionSalidaSchema = Joi.object({
  excepcionMotos: Joi.boolean().valid(true).required().messages({
    'any.only': 'Debe enviar excepcionMotos: true',
    'any.required': 'Debe enviar excepcionMotos: true',
  }),
});

/* ----------------------------- Adelantos ------------------------ */
export const adelantoSchema = Joi.object({
  monto: Joi.number().greater(0).required().messages({
    'any.required': 'El monto es obligatorio',
    'number.greater': 'El monto debe ser mayor a 0',
  }),
  motivo: Joi.string().trim().min(3).max(500).required().messages({
    'any.required': 'El motivo es obligatorio',
    'string.min': 'El motivo debe tener al menos 3 caracteres',
  }),
  fecha: fechaOpcional,
});

export const estadoAdelantoSchema = Joi.object({
  estado: Joi.string().valid('aprobado', 'rechazado').required().messages({
    'any.only': 'El estado debe ser aprobado o rechazado',
    'any.required': 'El estado es obligatorio',
  }),
});

/* ------------------------------ Bitácora ------------------------ */
export const bitacoraSchema = Joi.object({
  salidaId: id,
  motoId: id,
  fecha,
  lavada: Joi.boolean().default(false),
  revisada: Joi.boolean().default(false),
  tanqueada: Joi.boolean().default(false),
  conGasolina: Joi.boolean().default(false),
  conAceite: Joi.boolean().default(false),
  observaciones: Joi.string().allow('', null).max(1000),
});

export const editarBitacoraSchema = Joi.object({
  fecha: fechaOpcional,
  lavada: Joi.boolean(),
  revisada: Joi.boolean(),
  tanqueada: Joi.boolean(),
  conGasolina: Joi.boolean(),
  conAceite: Joi.boolean(),
  observaciones: Joi.string().allow('', null).max(1000),
});

/* -------------------------- Reportes de daño ------------------- */
export const reporteDanioSchema = Joi.object({
  fecha,
  motoId: idOpcional,
  equipo: Joi.string().trim().allow('', null).max(200),
  guiaId: idOpcional,
  descripcion: Joi.string().trim().min(3).max(2000).required().messages({
    'any.required': 'La descripción es obligatoria',
    'string.min': 'La descripción debe tener al menos 3 caracteres',
  }),
  gravedad: Joi.string().valid('leve', 'grave').default('leve').messages({
    'any.only': 'La gravedad debe ser leve o grave',
  }),
  fotos: Joi.array().items(Joi.string().allow('', null)).default([]),
});

export const estadoReporteDanioSchema = Joi.object({
  estado: Joi.string().valid('reportado', 'en_reparacion', 'resuelto').required().messages({
    'any.only': 'El estado debe ser reportado, en_reparacion o resuelto',
    'any.required': 'El estado es obligatorio',
  }),
});

/* ------------------------------- Gastos ------------------------- */
export const gastoSchema = Joi.object({
  fecha,
  tipo: Joi.string()
    .valid('implementos', 'baterias', 'combustible', 'repuestos', 'otros')
    .required()
    .messages({
      'any.only': 'El tipo debe ser implementos, baterias, combustible, repuestos u otros',
      'any.required': 'El tipo de gasto es obligatorio',
    }),
  valor: Joi.number().min(0).required().messages({
    'any.required': 'El valor del gasto es obligatorio',
    'number.min': 'El valor del gasto no puede ser negativo',
  }),
  descripcion: Joi.string().allow('', null).max(1000),
  fotoSoporte: Joi.string().allow('', null),
});

export const editarGastoSchema = Joi.object({
  fecha: Joi.date().optional().messages({
    'date.base': 'La fecha no tiene un formato válido',
  }),
  tipo: Joi.string()
    .valid('implementos', 'baterias', 'combustible', 'repuestos', 'otros')
    .messages({
      'any.only': 'El tipo debe ser implementos, baterias, combustible, repuestos u otros',
    }),
  valor: Joi.number().min(0).messages({
    'number.min': 'El valor del gasto no puede ser negativo',
  }),
  descripcion: Joi.string().allow('', null).max(1000),
  fotoSoporte: Joi.string().allow('', null),
});

/* --------------------------- Liquidaciones ---------------------- */
export const liquidacionSchema = Joi.object({
  guiaId: id,
  periodo: Joi.object({
    desde: fecha,
    hasta: fecha,
  })
    .required()
    .messages({ 'any.required': 'El período de la liquidación es obligatorio' }),
  salidasIds: Joi.array().items(idOpcional).default([]),
  descuentosPorPerdidas: Joi.number().min(0).default(0).messages({
    'number.min': 'Los descuentos por pérdidas no pueden ser negativos',
  }),
  fechaPago: fechaOpcional,
});

export const estadoLiquidacionSchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'pagada').required().messages({
    'any.only': 'El estado debe ser pendiente o pagada',
    'any.required': 'El estado es obligatorio',
  }),
  fechaPago: fechaOpcional,
});
