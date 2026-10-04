import api from './api';

export function listarUsuarios(params = {}) {
  return api.get('/usuarios', { params });
}

export function crearUsuario(datos) {
  return api.post('/usuarios', datos);
}

export function actualizarUsuario(id, datos) {
  return api.put(`/usuarios/${id}`, datos);
}

/** No se borran usuarios: se activan o desactivan. */
export function cambiarActivoUsuario(id, activo) {
  return api.patch(`/usuarios/${id}/activo`, { activo });
}
