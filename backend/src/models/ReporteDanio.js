import mongoose from 'mongoose';

const reporteDanioSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: [true, 'La fecha es obligatoria'] },
    motoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Moto', default: null },
    equipo: { type: String, default: '', trim: true },
    guiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guia',
      required: [true, 'El guía es obligatorio'],
    },
    descripcion: { type: String, required: [true, 'La descripción es obligatoria'], trim: true },
    fotos: { type: [String], default: [] },
    gravedad: {
      type: String,
      enum: {
        values: ['leve', 'grave'],
        message: 'La gravedad debe ser leve o grave',
      },
      default: 'leve',
    },
    estado: {
      type: String,
      enum: {
        values: ['reportado', 'en_reparacion', 'resuelto'],
        message: 'El estado debe ser reportado, en_reparacion o resuelto',
      },
      default: 'reportado',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

reporteDanioSchema.index({ guiaId: 1, fecha: -1 });
reporteDanioSchema.index({ motoId: 1 });

export default mongoose.model('ReporteDanio', reporteDanioSchema);
