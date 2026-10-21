import mongoose from 'mongoose';

const cascoCuevaSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: [true, 'El número del casco es obligatorio'],
      unique: true,
      min: [1, 'El número del casco debe ser mayor a 0'],
    },
    estado: {
      type: String,
      enum: {
        values: ['disponible', 'en_uso', 'por_lavar', 'danado', 'perdido'],
        message: 'El estado debe ser disponible, en_uso, por_lavar, danado o perdido',
      },
      default: 'disponible',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

export default mongoose.model('CascoCueva', cascoCuevaSchema);
