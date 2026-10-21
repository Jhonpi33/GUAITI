<template>
  <q-page ref="paginaEl" padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Bitácora de motos</div>
      <q-space />
      <q-btn color="primary" icon="add_task" label="Nuevo registro" no-caps unelevated @click="abrirNuevo" />
    </div>

    <q-card flat bordered class="tarjeta-tabla q-mb-md" data-anim>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-3">
            <q-input v-model="filtroFecha" outlined dense clearable type="date" label="Fecha" />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtroMoto"
              outlined
              dense
              clearable
              label="Moto"
              :options="opcionesMotos"
              emit-value
              map-options
            />
          </div>
          <div v-if="!auth.esGuia" class="col-12 col-sm-3">
            <q-select
              v-model="filtroGuia"
              outlined
              dense
              clearable
              label="Guía"
              :options="opcionesGuias"
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-table
      v-if="$q.screen.gt.md"
      flat
      bordered
      class="tarjeta-tabla"
      row-key="_id"
      :rows="items"
      :columns="columnas"
      :loading="cargando"
      :pagination="{ page: 1, rowsPerPage: 0 }"
      no-data-label="No hay registros de bitácora"
      loading-label="Cargando..."
    >
      <template #body-fecha="props">
        <span>{{ formatoFecha(props.row.fecha) }}</span>
      </template>

      <template #body-moto="props">
        <span>{{ props.row.motoId?.nombre || '—' }}</span>
      </template>

      <template #body-guia="props">
        <span>{{ props.row.guiaId?.nombre || '—' }}</span>
      </template>

      <template #body-tareas="props">
        <div class="row q-gutter-xs">
          <q-chip v-if="props.row.lavada" dense size="sm" color="primary" text-color="white">Lavada</q-chip>
          <q-chip v-if="props.row.revisada" dense size="sm" color="accent" text-color="white">Revisada</q-chip>
          <q-chip v-if="props.row.tanqueada" dense size="sm" color="secondary" text-color="dark">Tanqueada</q-chip>
          <q-chip v-if="props.row.conGasolina" dense size="sm" color="positive" text-color="white">Gasolina</q-chip>
          <q-chip v-if="props.row.conAceite" dense size="sm" color="warning" text-color="dark">Aceite</q-chip>
          <span v-if="!hayTareas(props.row)" class="text-caption texto-suave">Sin tareas marcadas</span>
        </div>
      </template>

      <template #body-acciones="props">
        <q-btn flat dense round icon="edit" color="primary" @click="abrirEdicion(props.row)">
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
      </template>

      <template #bottom>
        <PaginacionListado
          :pagina="pagina"
          :paginas="paginas"
          :total="total"
          :cargando="cargando"
          @cambiar="irPagina"
        />
      </template>
    </q-table>

    <ListadoTarjetas
      v-else
      :items="items"
      :cargando="cargando"
      texto-vacio="No hay registros de bitácora"
    >
      <template #contenido="{ item }">
        <div class="row items-center">
          <div class="salida-titulo col">{{ item.motoId?.nombre || 'Moto' }}</div>
          <span class="text-caption texto-suave">{{ formatoFecha(item.fecha) }}</span>
        </div>
        <div class="text-caption texto-suave q-mt-xs">
          Guía: {{ item.guiaId?.nombre || '—' }} · Salida: {{ formatoFecha(item.salidaId?.fecha) }}
        </div>
        <div class="row q-gutter-xs q-mt-xs">
          <q-chip v-if="item.lavada" dense size="sm" color="primary" text-color="white">Lavada</q-chip>
          <q-chip v-if="item.revisada" dense size="sm" color="accent" text-color="white">Revisada</q-chip>
          <q-chip v-if="item.tanqueada" dense size="sm" color="secondary" text-color="dark">Tanqueada</q-chip>
          <q-chip v-if="item.conGasolina" dense size="sm" color="positive" text-color="white">Gasolina</q-chip>
          <q-chip v-if="item.conAceite" dense size="sm" color="warning" text-color="dark">Aceite</q-chip>
        </div>
        <div v-if="item.observaciones" class="text-caption q-mt-xs">
          {{ item.observaciones }}
        </div>
      </template>

      <template #acciones="{ item }">
        <q-btn dense no-caps unelevated color="primary" icon="edit" label="Editar" @click="abrirEdicion(item)" />
      </template>
    </ListadoTarjetas>

    <div class="row items-center full-width tabla-inferior q-mt-sm lt-md">
      <span class="text-caption">Página {{ pagina }} de {{ paginas }} — {{ total }} registros</span>
      <q-space />
      <q-btn flat dense icon="chevron_left" label="Anterior" :disable="cargando || pagina <= 1" @click="irPagina(pagina - 1)" />
      <q-btn flat dense label="Siguiente" icon-right="chevron_right" :disable="cargando || pagina >= paginas" @click="irPagina(pagina + 1)" />
    </div>

    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 340px; width: 520px; max-width: 96vw">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar bitácora' : 'Nuevo registro de bitácora' }}</div>
        </q-card-section>

        <q-form class="q-gutter-y-md" @submit="guardar">
          <q-card-section class="q-pt-none">
            <q-select
              v-model="registro.salidaId"
              outlined
              dense
              label="Salida"
              :options="opcionesSalidas"
              emit-value
              map-options
              :disable="editando"
              :rules="[reglas.obligatorio]"
              lazy-rules
              @update:model-value="alCambiarSalida"
            />

            <q-select
              v-model="registro.motoId"
              outlined
              dense
              label="Moto"
              :options="opcionesMotosDeLaSalida"
              emit-value
              map-options
              :disable="editando"
              :rules="[reglas.obligatorio]"
              lazy-rules
              class="q-mt-md"
            />

            <q-input
              v-model="registro.fecha"
              outlined
              dense
              type="date"
              label="Fecha"
              :rules="[reglas.obligatorio]"
              lazy-rules
              class="q-mt-md"
            />

            <div class="text-overline texto-suave q-mt-md">Tareas realizadas</div>
            <div class="row q-col-gutter-sm q-mt-xs">
              <div v-for="tarea in tareas" :key="tarea.campo" class="col-6 col-sm-4">
                <q-toggle v-model="registro[tarea.campo]" :label="tarea.etiqueta" color="primary" />
              </div>
            </div>

            <q-input
              v-model="registro.observaciones"
              outlined
              dense
              type="textarea"
              label="Observaciones"
              placeholder="Rayones, ruidos, pendientes..."
              class="q-mt-sm"
            />
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarBitacora, crearBitacora, actualizarBitacora } from '../services/bitacora';
import { listarSalidas } from '../services/salidas';
import { listarMotos } from '../services/motos';
import { listarGuias } from '../services/guias';
import { exito } from '../services/alertas';
import { animarEntrada } from '../utils/animaciones';
import { reglas } from '../utils/validaciones';
import { formatoFecha, hoyISO } from '../utils/formato';
import ListadoTarjetas from '../components/ListadoTarjetas.vue';
import PaginacionListado from '../components/PaginacionListado.vue';

const auth = useAuthStore();
const paginaEl = ref(null);

const filtroFecha = ref('');
const filtroMoto = ref('');
const filtroGuia = ref('');

const { items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(
  (params) =>
    listarBitacora({
      ...params,
      fecha: filtroFecha.value || undefined,
      motoId: filtroMoto.value || undefined,
      guiaId: filtroGuia.value || undefined,
    }),
  { limite: 10 }
);

const columnas = [
  { name: 'fecha', label: 'Fecha', field: (f) => f.fecha, align: 'left' },
  { name: 'moto', label: 'Moto', field: (f) => f.motoId, align: 'left' },
  { name: 'guia', label: 'Guía', field: (f) => f.guiaId, align: 'left' },
  { name: 'tareas', label: 'Tareas', field: (f) => f.lavada, align: 'left' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const tareas = [
  { campo: 'lavada', etiqueta: 'Lavada' },
  { campo: 'revisada', etiqueta: 'Revisada' },
  { campo: 'tanqueada', etiqueta: 'Tanqueada' },
  { campo: 'conGasolina', etiqueta: 'Con gasolina' },
  { campo: 'conAceite', etiqueta: 'Con aceite' },
];

function hayTareas(fila) {
  return tareas.some((tarea) => fila[tarea.campo]);
}

/* Catálogos auxiliares */
const motos = ref([]);
const guias = ref([]);
const salidas = ref([]);

const opcionesMotos = computed(() => motos.value.map((m) => ({ label: m.nombre, value: m._id })));
const opcionesGuias = computed(() => guias.value.map((g) => ({ label: g.nombre, value: g._id })));
const opcionesSalidas = computed(() =>
  salidas.value.map((s) => ({
    label: `${formatoFecha(s.fecha)} · ${s.actividadId?.nombre || 'Actividad'} (${s.personas} pers.)`,
    value: s._id,
  }))
);

const salidaSeleccionada = computed(() => salidas.value.find((s) => s._id === registro.value.salidaId));

const opcionesMotosDeLaSalida = computed(() =>
  (salidaSeleccionada.value?.motos || []).map((m) => ({ label: m.nombre, value: m._id }))
);

const dialogo = ref(false);
const editando = ref(false);
const guardando = ref(false);
const registro = ref(vacio());

function vacio() {
  return {
    _id: null,
    salidaId: '',
    motoId: '',
    fecha: hoyISO(),
    lavada: false,
    revisada: false,
    tanqueada: false,
    conGasolina: false,
    conAceite: false,
    observaciones: '',
  };
}

function alCambiarSalida() {
  registro.value.motoId = '';
}

async function cargarCatalogos() {
  try {
    const [salidasRespuesta, motosRespuesta] = await Promise.all([
      listarSalidas({ page: 1, limit: 100 }),
      listarMotos({ page: 1, limit: 100 }),
    ]);
    salidas.value = salidasRespuesta.data.data.items || [];
    motos.value = motosRespuesta.data.data.items || [];
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  }

  if (!auth.esGuia) {
    try {
      const { data } = await listarGuias({ page: 1, limit: 100 });
      guias.value = data.data.items || [];
    } catch {
      // Los catálogos son auxiliares
    }
  }
}

function abrirNuevo() {
  registro.value = vacio();
  editando.value = false;
  dialogo.value = true;
}

function abrirEdicion(fila) {
  registro.value = {
    ...vacio(),
    ...fila,
    salidaId: fila.salidaId?._id || fila.salidaId,
    motoId: fila.motoId?._id || fila.motoId,
    fecha: fila.fecha ? String(fila.fecha).slice(0, 10) : hoyISO(),
  };
  editando.value = true;
  dialogo.value = true;
}

async function guardar() {
  guardando.value = true;
  try {
    const datos = {
      fecha: registro.value.fecha,
      lavada: registro.value.lavada,
      revisada: registro.value.revisada,
      tanqueada: registro.value.tanqueada,
      conGasolina: registro.value.conGasolina,
      conAceite: registro.value.conAceite,
      observaciones: registro.value.observaciones.trim(),
    };

    let respuesta;
    if (editando.value) {
      respuesta = await actualizarBitacora(registro.value._id, datos);
    } else {
      respuesta = await crearBitacora({
        ...datos,
        salidaId: registro.value.salidaId,
        motoId: registro.value.motoId,
      });
    }
    exito(respuesta.data.message || 'Bitácora guardada correctamente');
    dialogo.value = false;
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
  }
}

watch([filtroFecha, filtroMoto, filtroGuia], () => {
  pagina.value = 1;
  cargar();
});

onMounted(async () => {
  animarEntrada(paginaEl.value?.$el || paginaEl.value);
  await Promise.all([cargar(), cargarCatalogos()]);
  await nextTick();
});
</script>
