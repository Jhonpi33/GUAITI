import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    cedula: {
      type: String,
      required: [true, 'La cédula es obligatoria'],
      unique: true,
      trim: true,
      index: true,
    },
    telefono: { type: String, default: '', trim: true },
    correo: { type: String, default: '', lowercase: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

clienteSchema.index({ nombre: 'text' });

export default mongoose.model('Cliente', clienteSchema);
