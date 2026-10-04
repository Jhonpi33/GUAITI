import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: [true, 'La contraseña es obligatoria'], select: false },
    rol: {
      type: String,
      enum: {
        values: ['admin', 'secretario', 'guia'],
        message: 'El rol debe ser admin, secretario o guia',
      },
      required: true,
      default: 'guia',
    },
    activo: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

usuarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export default mongoose.model('Usuario', usuarioSchema);
