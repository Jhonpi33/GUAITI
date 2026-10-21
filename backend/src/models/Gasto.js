import mongoose from 'mongoose';

const gastoSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: [true, 'La fecha es obligatoria'] },
    tipo: {
      type: String,
      enum: {
        values: ['implementos', 'baterias', 'combustible', 'repuestos', 'otros'],
        message: 'El tipo debe ser implementos, baterias, combustible, repuestos u otros',
      },
      required: [true, 'El tipo de gasto es obligatorio'],
    },
    valor: {
      type: Number,
      required: [true, 'El valor del gasto es obligatorio'],
      min: [0, 'El valor del gasto no puede ser negativo'],
    },
    descripcion: { type: String, default: '', trim: true },
    fotoSoporte: { type: String, default: '' },
    registradoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario que registra el gasto es obligatorio'],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

gastoSchema.index({ fecha: -1 });
gastoSchema.index({ tipo: 1 });

export default mongoose.model('Gasto', gastoSchema);
