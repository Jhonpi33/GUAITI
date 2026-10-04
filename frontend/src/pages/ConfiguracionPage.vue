<template>
  <q-page padding class="pagina-listado q-pa-md">
    <div class="text-h5 q-mb-md">Configuración</div>

    <q-card flat bordered class="tarjeta-tabla">
      <q-tabs
        v-model="pestana"
        dense
        active-color="primary"
        indicator-color="primary"
        align="left"
        class="text-grey-5"
        narrow-indicator
      >
        <q-tab name="parametros" label="Parámetros" icon="tune" />
        <q-tab v-if="auth.esAdmin" name="tarifas" label="Tarifas de pago" icon="payments" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="pestana" animated class="bg-transparent">
        <!-- ======================= Parámetros ======================= -->
        <q-tab-panel name="parametros" class="q-pa-none">
          <div class="q-pa-md">
            <q-input
              v-model="busqueda"
              outlined
              dense
              clearable
              label="Buscar parámetro"
              placeholder="Escriba una clave o descripción..."
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <q-table
            flat
            class="tarjeta-tabla"
            row-key="_id"
            :rows="items"
            :columns="columnasParametros"
            :loading="cargando"
            :pagination="{ page: 1, rowsPerPage: 0 }"
            no-data-label="No hay parámetros para mostrar"
            loading-label="Cargando..."
          >
            <template #body-parametro="props">
              <div>
                <div>{{ etiquetaParametro(props.row.clave) }}</div>
                <div class="text-caption text-grey-6">{{ props.row.clave }}</div>
              </div>
            </template>

            <template #body-valor="props">
              <span v-if="typeof props.row.valor === 'boolean'" :class="props.row.valor ? 'text-positive' : 'text-negative'">
                {{ props.row.valor ? 'Sí' : 'No' }}
              </span>
              <span v-else>{{ props.row.valor }}</span>
            </template>

            <template #body-acciones="props">
              <q-btn flat dense round icon="edit" color="primary" @click="abrirParametro(props.row)">
                <q-tooltip>Editar parámetro</q-tooltip>
              </q-btn>
            </template>

            <template #bottom>
              <div class="row items-center full-width tabla-inferior">
                <span class="text-caption">
                  Página {{ pagina }} de {{ paginas }} — {{ total }} registros
                </span>
                <q-space />
                <q-btn
                  flat
                  dense
                  icon="chevron_left"
                  label="Anterior"
                  :disable="cargando || pagina <= 1"
                  @click="irPagina(pagina - 1)"
                />
                <q-btn
                  flat
                  dense
                  label="Siguiente"
                  icon-right="chevron_right"
                  :disable="cargando || pagina >= paginas"
                  @click="irPagina(pagina + 1)"
                />
              </div>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ======================= Tarifas de pago ======================= -->
        <q-tab-panel v-if="auth.esAdmin" name="tarifas" class="q-pa-none">
          <div class="q-pa-md row q-col-gutter-md items-end">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="filtroActividad"
                outlined
                dense
                clearable
                label="Filtrar por actividad"
                :options="opcionesActividades"
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                v-model="filtroUnidad"
                outlined
                dense
                clearable
                label="Filtrar por unidad"
                :options="opcionesUnidad"
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-2">
              <q-btn
                color="primary"
                icon="add"
                label="Nueva"
                no-caps
                unelevated
                class="full-width"
                @click="abrirNuevaTarifa"
              />
            </div>
          </div>

          <q-table
            flat
            class="tarjeta-tabla"
            row-key="_id"
            :rows="tarifas"
            :columns="columnasTarifas"
            :loading="cargandoTarifas"
            :pagination="{ page: 1, rowsPerPage: 0 }"
            no-data-label="No hay tarifas para mostrar"
            loading-label="Cargando..."
          >
            <template #body-actividad="props">
              <span>{{ props.row.actividadId?.nombre || '—' }}</span>
            </template>

            <template #body-hasta="props">
              <span>{{ props.row.hasta ?? 'sin límite' }}</span>
            </template>

            <template #body-valor="props">
              <span class="text-secondary text-weight-medium">{{ formatoCop(props.row.valor) }}</span>
            </template>

            <template #body-estado="props">
              <q-chip
                dense
                size="sm"
                :color="props.row.activa ? 'positive' : 'negative'"
                text-color="white"
              >
                {{ props.row.activa ? 'Activa' : 'Inactiva' }}
              </q-chip>
            </template>

            <template #body-acciones="props">
              <q-btn flat dense round icon="edit" color="primary" @click="abrirTarifa(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="confirmarEliminarTarifa(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </template>

            <template #bottom>
              <div class="row items-center full-width tabla-inferior">
                <span class="text-caption">
                  Página {{ paginaTarifas }} de {{ paginasTarifas }} — {{ totalTarifas }} registros
                </span>
                <q-space />
                <q-btn
                  flat
                  dense
                  icon="chevron_left"
                  label="Anterior"
                  :disable="cargandoTarifas || paginaTarifas <= 1"
                  @click="irPaginaTarifas(paginaTarifas - 1)"
                />
                <q-btn
                  flat
                  dense
                  label="Siguiente"
                  icon-right="chevron_right"
                  :disable="cargandoTarifas || paginaTarifas >= paginasTarifas"
                  @click="irPaginaTarifas(paginaTarifas + 1)"
                />
              </div>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- ======================= Diálogo de parámetro ======================= -->
    <q-dialog v-model="dialogoParametro" persistent>
      <q-card style="min-width: 340px; width: 460px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Editar parámetro</div>
          <div class="text-caption text-grey-5">
            {{ parametroEditado?.clave }} — {{ parametroEditado?.descripcion || 'Sin descripción' }}
          </div>
        </q-card-section>

        <q-form class="q-gutter-y-md" @submit="guardarParametro">
          <q-card-section class="q-pt-none">
            <q-toggle
              v-if="tipoValor === 'boolean'"
              v-model="valorEditado"
              :label="valorEditado ? 'Activado' : 'Desactivado'"
              color="primary"
            />

            <q-input
              v-else-if="tipoValor === 'number'"
              v-model="valorEditado"
              outlined
              dense
              type="number"
              label="Valor"
              :rules="[numeroValido]"
              lazy-rules
            />

            <q-input
              v-else
              v-model="valorEditado"
              outlined
              dense
              label="Valor"
              :rules="[reglas.obligatorio]"
              lazy-rules
            />

            <q-input
              v-model="descripcionEditada"
              outlined
              dense
              label="Descripción"
              placeholder="Opcional"
              class="q-mt-md"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat type="button" label="Cancelar" no-caps v-close-popup :disable="guardando" />
            <q-btn color="primary" type="submit" label="Guardar" no-caps unelevated :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ======================= Diálogo de tarifa ======================= -->
    <q-dialog v-model="dialogoTarifa" persistent>
      <q-card style="min-width: 340px; width: 480px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editandoTarifa ? 'Editar tarifa' : 'Nueva tarifa de pago' }}</div>
        </q-card-section>

        <q-form class="q-gutter-y-md" @submit="guardarTarifa">
          <q-card-section class="q-pt-none">
            <q-select
              v-model="tarifa.actividadId"
              outlined
              dense
              label="Actividad"
              :options="opcionesActividades"
              emit-value
              map-options
              :rules="[reglas.obligatorio]"
              lazy-rules
            />

            <q-select
              v-model="tarifa.unidad"
              outlined
              dense
              label="Unidad"
              :options="opcionesUnidad"
              emit-value
              map-options
              :rules="[reglas.obligatorio]"
              lazy-rules
              class="q-mt-md"
            />

            <div class="row q-col-gutter-md q-mt-xs">
              <div class="col-6">
                <q-input
                  v-model="tarifa.desde"
                  outlined
                  dense
                  type="number"
                  min="1"
                  label="Desde"
                  :rules="[reglas.enteroDesdeUno]"
                  lazy-rules
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="tarifa.hasta"
                  outlined
                  dense
                  clearable
                  type="number"
                  min="1"
                  label="Hasta"
                  placeholder="sin límite"
                  :rules="[hastaValido]"
                  lazy-rules
                />
              </div>
            </div>

            <q-input
              v-model="tarifa.valor"
              outlined
              dense
              type="number"
              min="0"
              label="Valor pagado al guía"
              :rules="[reglas.precio]"
              lazy-rules
            />

            <q-toggle v-model="tarifa.activa" label="Tarifa activa" color="primary" />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat type="button" label="Cancelar" no-caps v-close-popup :disable="guardando" />
            <q-btn color="primary" type="submit" label="Guardar" no-caps unelevated :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarParametros, actualizarParametro } from '../services/parametros';
import { listarTarifas, crearTarifa, actualizarTarifa, eliminarTarifa } from '../services/tarifas';
import { listarActividades } from '../services/actividades';
import { reglas } from '../utils/validaciones';
import { formatoCop } from '../utils/formato';

const $q = useQuasar();
const auth = useAuthStore();

/* --------------------------- Parámetros --------------------------- */

// Etiquetas en español de las claves conocidas; si no existe, se muestra la clave
const etiquetas = {
  maxMotosPorGuia: 'Máximo de motos por guía',
  maxPersonasPorMoto: 'Máximo de personas por moto',
  minutosCharla: 'Minutos de charla',
  minutosDescuentoTarde: 'Minutos de descuento por tarde',
  temporadaAlta: 'Temporada alta',
  horaApertura: 'Hora de apertura',
  horaCierre: 'Hora de cierre',
};

function etiquetaParametro(clave) {
  return etiquetas[clave] || clave;
}

const pestana = ref('parametros');

const {
  busqueda,
  items,
  total,
  pagina,
  paginas,
  cargando,
  cargar,
  irPagina,
} = useListado(listarParametros, { limite: 10 });

const columnasParametros = [
  { name: 'parametro', label: 'Parámetro', field: (fila) => fila.clave, align: 'left' },
  { name: 'valor', label: 'Valor', field: (fila) => fila.valor, align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: (fila) => fila.descripcion || '—', align: 'left' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const dialogoParametro = ref(false);
const guardando = ref(false);
const parametroEditado = ref(null);
const valorEditado = ref(null);
const descripcionEditada = ref('');

const tipoValor = computed(() => typeof parametroEditado.value?.valor);

const numeroValido = (valor) =>
  (valor !== '' && valor !== null && !Number.isNaN(Number(valor))) || 'Ingrese un valor numérico válido';

function abrirParametro(fila) {
  parametroEditado.value = { ...fila };
  valorEditado.value = fila.valor;
  descripcionEditada.value = fila.descripcion || '';
  dialogoParametro.value = true;
}

async function guardarParametro() {
  guardando.value = true;
  try {
    let valor = valorEditado.value;
    if (tipoValor.value === 'number') valor = Number(valor);
    if (tipoValor.value === 'string') valor = String(valor).trim();

    const { data } = await actualizarParametro(parametroEditado.value.clave, {
      valor,
      descripcion: descripcionEditada.value.trim(),
    });
    $q.notify({ type: 'positive', message: data.message });
    dialogoParametro.value = false;
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
  }
}

/* ---------------------------- Tarifas ----------------------------- */

// Solo el administrador ve y consulta este endpoint (la pestaña ni se renderiza para otros roles)
const { items: tarifas, total: totalTarifas, pagina: paginaTarifas, paginas: paginasTarifas, cargando: cargandoTarifas, cargar: cargarTarifas, irPagina: irPaginaTarifas } =
  useListado(
    (params) =>
      listarTarifas({
        ...params,
        actividadId: filtroActividad.value || '',
        unidad: filtroUnidad.value || '',
      }),
    { limite: 10 }
  );

const filtroActividad = ref(null);
const filtroUnidad = ref(null);

const opcionesActividades = ref([]);
const opcionesUnidad = [
  { label: 'Persona', value: 'persona' },
  { label: 'Moto', value: 'moto' },
];

const columnasTarifas = [
  { name: 'actividad', label: 'Actividad', field: (fila) => fila.actividadId, align: 'left' },
  { name: 'unidad', label: 'Unidad', field: (fila) => fila.unidad, align: 'center' },
  { name: 'desde', label: 'Desde', field: (fila) => fila.desde, align: 'center' },
  { name: 'hasta', label: 'Hasta', field: (fila) => fila.hasta, align: 'center' },
  { name: 'valor', label: 'Valor', field: (fila) => fila.valor, align: 'right' },
  { name: 'estado', label: 'Estado', field: (fila) => fila.activa, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const dialogoTarifa = ref(false);
const editandoTarifa = ref(false);
const tarifa = ref({});

const hastaValido = (valor) =>
  valor === '' ||
  valor === null ||
  (Number.isInteger(Number(valor)) && Number(valor) >= 1) ||
  'Hasta debe ser un número entero mayor o igual a 1 (vacío = sin límite)';

function vaciaTarifa() {
  return { _id: null, actividadId: null, unidad: 'persona', desde: 1, hasta: '', valor: '', activa: true };
}

function abrirNuevaTarifa() {
  tarifa.value = vaciaTarifa();
  editandoTarifa.value = false;
  dialogoTarifa.value = true;
}

function abrirTarifa(fila) {
  tarifa.value = {
    ...vaciaTarifa(),
    ...fila,
    actividadId: fila.actividadId?._id || fila.actividadId,
    hasta: fila.hasta ?? '',
  };
  editandoTarifa.value = true;
  dialogoTarifa.value = true;
}

async function guardarTarifa() {
  const desde = Number(tarifa.value.desde);
  const hasta = tarifa.value.hasta === '' || tarifa.value.hasta === null ? null : Number(tarifa.value.hasta);

  if (hasta !== null && desde > hasta) {
    $q.notify({ type: 'warning', message: "El valor 'desde' no puede ser mayor que 'hasta'" });
    return;
  }

  guardando.value = true;
  try {
    const datos = {
      actividadId: tarifa.value.actividadId,
      unidad: tarifa.value.unidad,
      desde,
      hasta,
      valor: Number(tarifa.value.valor),
      activa: tarifa.value.activa,
    };
    const respuesta = editandoTarifa.value
      ? await actualizarTarifa(tarifa.value._id, datos)
      : await crearTarifa(datos);
    $q.notify({ type: 'positive', message: respuesta.data.message });
    dialogoTarifa.value = false;
    await cargarTarifas();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
  }
}

function confirmarEliminarTarifa(fila) {
  const nombre = fila.actividadId?.nombre || 'esta actividad';
  $q.dialog({
    title: 'Eliminar tarifa',
    message: `¿Eliminar la tarifa de pago al guía de ${nombre}?`,
    cancel: 'Cancelar',
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await eliminarTarifa(fila._id);
      $q.notify({ type: 'positive', message: data.message });
      await cargarTarifas();
    } catch {
      // El interceptor de services/api.js ya notificó el error en español
    }
  });
}

async function prepararPestanaTarifas() {
  if (!auth.esAdmin) return;

  if (!opcionesActividades.value.length) {
    try {
      const { data } = await listarActividades({ page: 1, limit: 100 });
      opcionesActividades.value = data.data.items.map((actividad) => ({
        label: actividad.nombre,
        value: actividad._id,
      }));
    } catch {
      // El interceptor de services/api.js ya notificó el error en español
    }
  }

  await cargarTarifas();
}

watch(pestana, (valor) => {
  if (valor === 'tarifas' && auth.esAdmin) prepararPestanaTarifas();
});

watch([filtroActividad, filtroUnidad], () => {
  if (pestana.value !== 'tarifas') return;
  paginaTarifas.value = 1;
  cargarTarifas();
});

onMounted(cargar);
</script>
