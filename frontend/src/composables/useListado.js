/**
 * Listado paginado con filtrado del lado del servidor (?q=&page=&limit=).
 * La búsqueda se debounced 400 ms antes de volver a consultar el backend.
 */
import { ref, watch } from 'vue';

export function useListado(obtener, opciones = {}) {
  const { limite = 10 } = opciones;

  const busqueda = ref('');
  const items = ref([]);
  const total = ref(0);
  const pagina = ref(1);
  const paginas = ref(1);
  const cargando = ref(false);

  let temporizador = null;

  async function cargar() {
    cargando.value = true;
    try {
      const { data } = await obtener({ q: busqueda.value, page: pagina.value, limit: limite });
      const contenido = data.data || {};
      items.value = contenido.items || [];
      total.value = contenido.total || 0;
      pagina.value = contenido.pagina || 1;
      paginas.value = contenido.paginas || 1;
    } catch {
      // El interceptor de services/api.js ya notificó el error en español
      items.value = [];
      total.value = 0;
      pagina.value = 1;
      paginas.value = 1;
    } finally {
      cargando.value = false;
    }
  }

  function buscar() {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      pagina.value = 1;
      cargar();
    }, 400);
  }

  function irPagina(destino) {
    pagina.value = destino;
    cargar();
  }

  watch(busqueda, buscar);

  return { busqueda, items, total, pagina, paginas, cargando, cargar, buscar, irPagina };
}
