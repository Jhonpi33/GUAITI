import mongoose from 'mongoose';

const actividadSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    descripcion: { type: String, default: '' },
    precioPorPersona: {
      type: Number,
      required: [true, 'El precio por persona es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    duracionMin: { type: Number, default: null, min: 0 },
    tipoRecurso: {
      type: String,
      enum: {
        values: ['cupo', 'moto'],
        message: 'El tipo de recurso debe ser cupo o moto',
      },
      required: true,
      default: 'cupo',
    },
    imagenes: { type: [String], default: [] },
    activa: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

actividadSchema.index({ nombre: 1 });

export default mongoose.model('Actividad', actividadSchema);
