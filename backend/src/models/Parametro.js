import mongoose from 'mongoose';

const parametroSchema = new mongoose.Schema(
  {
    clave: { type: String, required: [true, 'La clave es obligatoria'], unique: true, trim: true },
    valor: { type: mongoose.Schema.Types.Mixed, required: [true, 'El valor es obligatorio'] },
    descripcion: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

export default mongoose.model('Parametro', parametroSchema);
