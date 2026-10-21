import api from './api';

/** Sube una imagen (cámara o archivo) y devuelve la URL para guardar en el registro. */
export function subirFoto(archivo) {
  const formulario = new FormData();
  formulario.append('archivo', archivo);
  return api.post('/uploads/foto', formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
