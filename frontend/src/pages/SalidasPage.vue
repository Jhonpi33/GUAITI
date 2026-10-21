<template>
  <q-page ref="paginaEl" padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Salidas</div>
      <q-space />
      <q-btn
        v-if="!auth.esSecretario"
        color="primary"
        icon="add_road"
        label="Nueva salida"
        no-caps
        unelevated
        @click="dialogoNueva = true"
      />
    </div>

    <q-card flat bordered class="tarjeta-tabla q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-input v-model="filtroFecha" outlined dense clearable type="date" label="Filtrar por fecha">
              <template #prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-4">
            <q-select
              v-model="filtroEstado"
              outlined
              dense
              clearable
              label="Estado"
              :options="opcionesEstado"
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Escritorio: tabla -->
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
      no-data-label="No hay salidas para mostrar"
      loading-label="Cargando..."
    >
      <template #body-fecha="props">
        <span>{{ formatoFechaHora(props.row.fecha) }}</span>
      </template>

      <template #body-guia="props">
        <span>{{ props.row.guiaId?.nombre || '—' }}</span>
      </template>

      <template #body-actividad="props">
        <span>{{ props.row.actividadId?.nombre || '—' }}</span>
      </template>

      <template #body-recursos="props">
        <div class="text-caption">
          <span v-if="props.row.motos?.length">
            {{ props.row.motos.map((m) => m.nombre).join(', ') }}
          </span>
          <span v-if="props.row.cascos?.length">
            Cascos: {{ props.row.cascos.map((c) => c.numero).join(', ') }}
          </span>
          <span v-if="!props.row.motos?.length && !props.row.cascos?.length">—</span>
        </div>
      </template>

      <template #body-estado="props">
        <q-chip
          dense
          size="sm"
          class="chip-semaforo"
          :color="colorEstado(props.row.estado)"
          text-color="white"
        >
          {{ etiquetaEstado(props.row.estado) }}
        </q-chip>
      </template>

      <template #body-acciones="props">
        <div class="row items-center justify-center q-gutter-xs">
          <q-btn
            v-if="props.row.estado === 'abierta' && !auth.esSecretario"
            flat
            dense
            round
            icon="play_arrow"
            color="primary"
            :disable="accionando === props.row._id"
            @click="ponerEnCurso(props.row)"
          >
            <q-tooltip>Poner en curso</q-tooltip>
          </q-btn>
          <q-btn
            v-if="props.row.estado !== 'cerrada' && !auth.esSecretario"
            flat
            dense
            round
            icon="flag"
            color="secondary"
            @click="abrirCierre(props.row)"
          >
            <q-tooltip>Cerrar salida</q-tooltip>
          </q-btn>
          <q-btn
            v-if="requiereExcepcion(props.row)"
            flat
            dense
            round
            icon="gavel"
            color="warning"
            @click="resolverExcepcion(props.row)"
          >
            <q-tooltip>Solicitar autorización</q-tooltip>
          </q-btn>
        </div>
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

    <!-- Móvil: tarjetas -->
    <ListadoTarjetas
      v-else
      :items="items"
      :cargando="cargando"
      texto-vacio="No hay salidas para mostrar"
    >
      <template #contenido="{ item }">
        <div class="row items-center">
          <div class="salida-titulo col">
            {{ item.actividadId?.nombre || 'Actividad' }}
          </div>
          <q-chip
            dense
            size="sm"
            class="chip-semaforo"
            :color="colorEstado(item.estado)"
            text-color="white"
          >
            {{ etiquetaEstado(item.estado) }}
          </q-chip>
        </div>
        <div class="text-caption texto-suave q-mt-xs">
          {{ formatoFechaHora(item.fecha) }} · {{ item.guiaId?.nombre || '—' }}
        </div>
        <div class="text-caption q-mt-xs">{{ item.personas }} persona(s)</div>
        <div v-if="item.motos?.length" class="text-caption texto-suave">
          Motos: {{ item.motos.map((m) => m.nombre).join(', ') }}
        </div>
        <div v-if="item.cascos?.length" class="text-caption texto-suave">
          Cascos: {{ item.cascos.map((c) => c.numero).join(', ') }}
        </div>
        <q-chip v-if="item.excepcionMotos" dense size="sm" color="warning" text-color="dark" class="q-mt-xs">
          Excepción autorizada
        </q-chip>
      </template>

      <template #acciones="{ item }">
        <q-btn
          v-if="item.estado === 'abierta' && !auth.esSecretario"
          dense
          no-caps
          unelevated
          color="primary"
          icon="play_arrow"
          label="Iniciar"
          :disable="accionando === item._id"
          @click="ponerEnCurso(item)"
        />
        <q-btn
          v-if="item.estado !== 'cerrada' && !auth.esSecretario"
          dense
          no-caps
          unelevated
          color="secondary"
          text-color="dark"
          icon="flag"
          label="Cerrar"
          @click="abrirCierre(item)"
        />
        <q-btn
          v-if="requiereExcepcion(item)"
          dense
          no-caps
          unelevated
          color="warning"
          text-color="dark"
          icon="gavel"
          label="Autorizar"
          @click="resolverExcepcion(item)"
        />
      </template>
    </ListadoTarjetas>

    <div class="row items-center full-width tabla-inferior q-mt-sm lt-md">
      <span class="text-caption">Página {{ pagina }} de {{ paginas }} — {{ total }} registros</span>
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

    <DialogoSalida v-model="dialogoNueva" @guardado="cargar" />
    <DialogoCierreSalida v-model="dialogoCierre" :salida="salidaSeleccionada" @cerrada="cargar" />
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarSalidas, cambiarEstadoSalida, autorizarExcepcionMotos } from '../services/salidas';
import { obtenerMapaParametros } from '../services/parametros';
import { confirmar, exito, informacion } from '../services/alertas';
import { animarEntrada } from '../utils/animaciones';
import { formatoFechaHora } from '../utils/formato';
import DialogoSalida from '../components/DialogoSalida.vue';
import DialogoCierreSalida from '../components/DialogoCierreSalida.vue';
import ListadoTarjetas from '../components/ListadoTarjetas.vue';
import PaginacionListado from '../components/PaginacionListado.vue';

const auth = useAuthStore();
const paginaEl = ref(null);

const filtroFecha = ref('');
const filtroEstado = ref('');

const { items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(
  (params) =>
    listarSalidas({
      ...params,
      fecha: filtroFecha.value || undefined,
      estado: filtroEstado.value || undefined,
    }),
  { limite: 10 }
);

const opcionesEstado = [
  { label: 'Abierta', value: 'abierta' },
  { label: 'En curso', value: 'en_curso' },
  { label: 'Cerrada', value: 'cerrada' },
];

const columnas = [
  { name: 'fecha', label: 'Fecha', field: (f) => f.fecha, align: 'left' },
  { name: 'guia', label: 'Guía', field: (f) => f.guiaId, align: 'left' },
  { name: 'actividad', label: 'Actividad', field: (f) => f.actividadId, align: 'left' },
  { name: 'personas', label: 'Personas', field: (f) => f.personas, align: 'center' },
  { name: 'recursos', label: 'Recursos', field: (f) => f.motos, align: 'left' },
  { name: 'estado', label: 'Estado', field: (f) => f.estado, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const etiquetas = { abierta: 'Abierta', en_curso: 'En curso', cerrada: 'Cerrada' };
const colores = { abierta: 'accent', en_curso: 'secondary', cerrada: 'grey-7' };

function etiquetaEstado(estado) {
  return etiquetas[estado] || estado;
}

function colorEstado(estado) {
  return colores[estado] || 'grey';
}

const maximoMotos = ref(null);

async function cargarParametros() {
  try {
    const { data } = await obtenerMapaParametros({ silenciarNotificacion: true });
    const mapa = data.data || {};
    const maximo = mapa.maxMotosPorGuia?.valor ?? mapa.maxMotosPorGuia;
    maximoMotos.value = Number.isFinite(Number(maximo)) ? Number(maximo) : null;
  } catch {
    maximoMotos.value = null;
  }
}

/** Salida con más motos de las permitidas y sin excepción autorizada. */
function requiereExcepcion(salida) {
  return (
    Boolean(maximoMotos.value) &&
    !salida.excepcionMotos &&
    (salida.motos?.length || 0) > maximoMotos.value
  );
}

const accionando = ref(null);
const dialogoNueva = ref(false);
const dialogoCierre = ref(false);
const salidaSeleccionada = ref(null);

function abrirCierre(salida) {
  salidaSeleccionada.value = salida;
  dialogoCierre.value = true;
}

async function ponerEnCurso(salida) {
  const confirmado = await confirmar({
    titulo: 'Iniciar salida',
    texto: `¿Poner en curso la salida de "${salida.actividadId?.nombre || 'la actividad'}"?`,
    confirmar: 'Iniciar',
  });
  if (!confirmado) return;

  accionando.value = salida._id;
  try {
    const { data } = await cambiarEstadoSalida(salida._id, { estado: 'en_curso' });
    exito(data.message || 'Salida en curso');
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    accionando.value = null;
  }
}

/**
 * Límite de motos superado: el guía pide autorización; admin/secretario
 * autorizan con PUT /salidas/:id/excepcion.
 */
async function resolverExcepcion(salida) {
  if (auth.esGuia) {
    await informacion(
      'Solo el administrador o la secretaria(o) pueden autorizar más motos de las permitidas. Pida la autorización para que revisen esta salida.'
    );
    return;
  }

  const confirmado = await confirmar({
    titulo: 'Autorizar excepción de motos',
    texto: `¿Autorizar que esta salida tenga más de ${maximoMotos.value} motos?`,
    confirmar: 'Autorizar',
  });
  if (!confirmado) return;

  try {
    const { data } = await autorizarExcepcionMotos(salida._id);
    exito(data.message || 'Excepción autorizada');
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  }
}

watch([filtroFecha, filtroEstado], () => {
  pagina.value = 1;
  cargar();
});

onMounted(async () => {
  animarEntrada(paginaEl.value?.$el || paginaEl.value);
  await Promise.all([cargar(), cargarParametros()]);
});
</script>
