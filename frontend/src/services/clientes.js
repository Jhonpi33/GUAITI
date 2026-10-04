import api from './api';

export function listarClientes(params = {}) {
  return api.get('/clientes', { params });
}

export function crearCliente(datos) {
  return api.post('/clientes', datos);
}

export function actualizarCliente(id, datos) {
  return api.put(`/clientes/${id}`, datos);
}

export function eliminarCliente(id) {
  return api.delete(`/clientes/${id}`);
}
