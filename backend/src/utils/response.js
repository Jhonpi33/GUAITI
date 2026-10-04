/**
 * Respuesta estándar de la API: { ok, data, message }
 */
export function responderOk(res, data = null, message = 'Operación exitosa', status = 200) {
  return res.status(status).json({ ok: true, data, message });
}

export function responderError(res, message = 'Error inesperado', status = 500, errores = null) {
  const cuerpo = { ok: false, data: null, message };
  if (errores) cuerpo.errores = errores;
  return res.status(status).json(cuerpo);
}

/**
 * Paginación estándar: ?page=1&limit=10
 */
export function paginar(query = {}, limiteDefecto = 10) {
  const pagina = Math.max(parseInt(query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(query.limit, 10) || limiteDefecto, 1), 100);
  const salto = (pagina - 1) * limite;
  return { pagina, limite, salto };
}

export function datosPaginados(items, total, pagina, limite) {
  return {
    items,
    total,
    pagina,
    limite,
    paginas: Math.max(Math.ceil(total / limite), 1),
  };
}
