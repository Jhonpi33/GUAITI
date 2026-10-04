import mongoose from 'mongoose';

const motoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
    estado: {
      type: String,
      enum: {
        values: ['disponible', 'mantenimiento', 'fuera_de_servicio'],
        message: 'El estado debe ser disponible, mantenimiento o fuera_de_servicio',
      },
      default: 'disponible',
    },
    notas: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

export default mongoose.model('Moto', motoSchema);
