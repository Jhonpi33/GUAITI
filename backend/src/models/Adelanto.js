import mongoose from 'mongoose';

const adelantoSchema = new mongoose.Schema(
  {
    guiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guia',
      required: [true, 'El guía es obligatorio'],
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto debe ser mayor a 0'],
    },
    motivo: { type: String, required: [true, 'El motivo es obligatorio'], trim: true },
    fecha: { type: Date, default: Date.now },
    estado: {
      type: String,
      enum: {
        values: ['solicitado', 'aprobado', 'rechazado', 'descontado'],
        message: 'El estado debe ser solicitado, aprobado, rechazado o descontado',
      },
      default: 'solicitado',
    },
    liquidacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiquidacionGuia', default: null },
    aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

adelantoSchema.index({ guiaId: 1, estado: 1 });
adelantoSchema.index({ liquidacionId: 1 });

export default mongoose.model('Adelanto', adelantoSchema);
