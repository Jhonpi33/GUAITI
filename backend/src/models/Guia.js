import mongoose from 'mongoose';

const guiaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    telefono: { type: String, default: '', trim: true },
    activo: { type: Boolean, default: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

guiaSchema.index({ nombre: 1 });

export default mongoose.model('Guia', guiaSchema);
