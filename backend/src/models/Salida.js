import mongoose from 'mongoose';

const salidaSchema = new mongoose.Schema(
  {
    guiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guia',
      required: [true, 'El guía es obligatorio'],
    },
    fecha: { type: Date, required: [true, 'La fecha es obligatoria'] },
    actividadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Actividad',
      required: [true, 'La actividad es obligatoria'],
    },
    personas: {
      type: Number,
      required: [true, 'La cantidad de personas es obligatoria'],
      min: [1, 'La cantidad de personas debe ser al menos 1'],
    },
    motos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Moto' }],
    cascos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CascoCueva' }],
    estado: {
      type: String,
      enum: {
        values: ['abierta', 'en_curso', 'cerrada'],
        message: 'El estado debe ser abierta, en_curso o cerrada',
      },
      default: 'abierta',
    },
    novedades: { type: String, default: '' },
    excepcionMotos: { type: Boolean, default: false },
    liquidacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiquidacionGuia', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

salidaSchema.index({ guiaId: 1, fecha: -1 });
salidaSchema.index({ estado: 1 });
salidaSchema.index({ liquidacionId: 1 });

export default mongoose.model('Salida', salidaSchema);
