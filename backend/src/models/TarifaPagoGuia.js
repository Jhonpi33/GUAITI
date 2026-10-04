import mongoose from 'mongoose';

const tarifaPagoGuiaSchema = new mongoose.Schema(
  {
    actividadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Actividad',
      required: [true, 'La actividad es obligatoria'],
    },
    unidad: {
      type: String,
      enum: {
        values: ['persona', 'moto'],
        message: 'La unidad debe ser persona o moto',
      },
      required: true,
    },
    // Rango de unidades al que aplica la tarifa (desde inclusive, hasta inclusive; hasta = null significa "sin límite")
    desde: { type: Number, required: true, min: 1 },
    hasta: { type: Number, default: null, min: 1 },
    // Valor pagado al guía por cada unidad dentro del rango
    valor: { type: Number, required: [true, 'El valor de la tarifa es obligatorio'], min: 0 },
    activa: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

tarifaPagoGuiaSchema.index({ actividadId: 1, unidad: 1, desde: 1 });

export default mongoose.model('TarifaPagoGuia', tarifaPagoGuiaSchema);
