import 'dotenv/config';
import mongoose from 'mongoose';
import Usuario from './src/models/Usuario.js';
import Guia from './src/models/Guia.js';

await mongoose.connect(process.env.MONGODB_URI);
const usuario = await Usuario.findOne({ correo: 'guia@guaiti.com' });
console.log('usuario:', usuario ? { id: usuario._id.toString(), nombre: usuario.nombre, rol: usuario.rol } : 'NO EXISTE');
const guia = await Guia.findOne({ nombre: 'Jhon' });
console.log('ficha guia:', guia ? { id: guia._id.toString(), nombre: guia.nombre, usuarioId: guia.usuarioId } : 'NO EXISTE');

if (usuario && guia) {
  await Guia.updateOne({ _id: guia._id }, { $set: { usuarioId: usuario._id } });
  await Guia.updateMany({ _id: { $ne: guia._id }, usuarioId: usuario._id }, { $set: { usuarioId: null } });
  const actualizado = await Guia.findById(guia._id);
  console.log('OK vinculado:', actualizado.nombre, '->', actualizado.usuarioId.toString());
}

await mongoose.disconnect();
