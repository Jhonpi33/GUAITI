import mongoose from 'mongoose';

const bitacoraMotoSchema = new mongoose.Schema(
  {
    salidaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salida',
      required: [true, 'La salida es obligatoria'],
    },
    motoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Moto',
      required: [true, 'La moto es obligatoria'],
    },
    guiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guia',
      required: [true, 'El guía es obligatorio'],
    },
    fecha: { type: Date, required: [true, 'La fecha es obligatoria'] },
    lavada: { type: Boolean, default: false },
    revisada: { type: Boolean, default: false },
    tanqueada: { type: Boolean, default: false },
    conGasolina: { type: Boolean, default: false },
    conAceite: { type: Boolean, default: false },
    observaciones: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

bitacoraMotoSchema.index({ salidaId: 1, motoId: 1 }, { unique: true });
bitacoraMotoSchema.index({ guiaId: 1, fecha: -1 });

export default mongoose.model('BitacoraMoto', bitacoraMotoSchema);
