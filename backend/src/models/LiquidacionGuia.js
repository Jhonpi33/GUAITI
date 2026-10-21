import mongoose from 'mongoose';

const liquidacionGuiaSchema = new mongoose.Schema(
  {
    guiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guia',
      required: [true, 'El guía es obligatorio'],
    },
    periodo: {
      desde: { type: Date, required: [true, 'La fecha inicial del período es obligatoria'] },
      hasta: { type: Date, required: [true, 'La fecha final del período es obligatoria'] },
    },
    salidas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Salida' }],
    adelantos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Adelanto' }],
    adelantosDescontados: { type: Number, default: 0, min: 0 },
    descuentosPorPerdidas: { type: Number, default: 0, min: 0 },
    base: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    fechaPago: { type: Date, default: null },
    estado: {
      type: String,
      enum: {
        values: ['pendiente', 'pagada'],
        message: 'El estado debe ser pendiente o pagada',
      },
      default: 'pendiente',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

liquidacionGuiaSchema.index({ guiaId: 1, estado: 1 });

export default mongoose.model('LiquidacionGuia', liquidacionGuiaSchema);
