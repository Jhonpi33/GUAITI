<template>
  <q-page ref="paginaEl" padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Adelantos</div>
      <q-space />
      <q-chip v-if="auth.esGuia" dense color="primary" text-color="white" icon="info">
        Solicitudes revisadas por administración
      </q-chip>
    </div>

    <!-- Guía: formulario de solicitud -->
    <q-card v-if="auth.esGuia" flat bordered class="tarjeta-tabla q-mb-md" data-anim>
      <q-card-section class="text-h6">Solicitar adelanto</q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-md" @submit="guardar">
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="registro.monto"
              outlined
              dense
              type="number"
              min="1"
              label="Monto (COP)"
              :rules="[reglas.enteroDesdeUno]"
              lazy-rules
              prefix="$"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="registro.motivo"
              outlined
              dense
              label="Motivo"
              placeholder="Ej. combustible, comida en ruta..."
              :rules="[reglas.nombre]"
              lazy-rules
            />
          </div>
          <div class="col-12 col-sm-2 flex items-center">
            <q-btn
              class="full-width"
              color="primary"
              unelevated
              no-caps
              type="submit"
              icon="send"
              label="Solicitar"
              :loading="guardando"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Filtro de estado (admin/secretario) -->
    <q-card v-if="!auth.esGuia" flat bordered class="tarjeta-tabla q-mb-md" data-anim>
      <q-card-section>
        <div class="row q-col-gutter-md">
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
      no-data-label="No hay adelantos para mostrar"
      loading-label="Cargando..."
    >
      <template #body-fecha="props">
        <span>{{ formatoFecha(props.row.fecha) }}</span>
      </template>

      <template #body-guia="props">
        <span>{{ props.row.guiaId?.nombre || '—' }}</span>
      </template>

      <template #body-monto="props">
        <span class="text-weight-bold">{{ formatoCop(props.row.monto) }}</span>
      </template>

      <template #body-estado="props">
        <q-chip dense size="sm" class="chip-semaforo" :color="colorEstado(props.row.estado)" text-color="white">
          {{ etiquetaEstado(props.row.estado) }}
        </q-chip>
      </template>

      <template #body-acciones="props">
        <div v-if="!auth.esGuia && props.row.estado === 'solicitado'" class="row items-center justify-center q-gutter-xs">
          <q-btn flat dense round icon="check_circle" color="primary" @click="cambiarEstado(props.row, 'aprobado')">
            <q-tooltip>Aprobar</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="cancel" color="negative" @click="cambiarEstado(props.row, 'rechazado')">
            <q-tooltip>Rechazar</q-tooltip>
          </q-btn>
        </div>
        <span v-else class="text-caption texto-suave">—</span>
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
      texto-vacio="No hay adelantos para mostrar"
    >
      <template #contenido="{ item }">
        <div class="row items-center">
          <div class="salida-titulo col">{{ formatoCop(item.monto) }}</div>
          <q-chip dense size="sm" class="chip-semaforo" :color="colorEstado(item.estado)" text-color="white">
            {{ etiquetaEstado(item.estado) }}
          </q-chip>
        </div>
        <div class="text-caption texto-suave q-mt-xs">
          {{ formatoFecha(item.fecha) }}<span v-if="!auth.esGuia"> · {{ item.guiaId?.nombre || '—' }}</span>
        </div>
        <div class="text-caption q-mt-xs">{{ item.motivo }}</div>
        <div v-if="item.aprobadoPor" class="text-caption texto-suave">
          Revisado por: {{ item.aprobadoPor.nombre }}
        </div>
      </template>

      <template #acciones="{ item }">
        <template v-if="!auth.esGuia && item.estado === 'solicitado'">
          <q-btn
            dense
            no-caps
            unelevated
            color="primary"
            icon="check_circle"
            label="Aprobar"
            @click="cambiarEstado(item, 'aprobado')"
          />
          <q-btn
            dense
            no-caps
            flat
            color="negative"
            icon="cancel"
            label="Rechazar"
            @click="cambiarEstado(item, 'rechazado')"
          />
        </template>
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
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarAdelantos, crearAdelanto, cambiarEstadoAdelanto } from '../services/adelantos';
import { confirmar, exito } from '../services/alertas';
import { animarEntrada } from '../utils/animaciones';
import { reglas } from '../utils/validaciones';
import { formatoCop, formatoFecha } from '../utils/formato';
import ListadoTarjetas from '../components/ListadoTarjetas.vue';
import PaginacionListado from '../components/PaginacionListado.vue';

const auth = useAuthStore();
const paginaEl = ref(null);

const filtroEstado = ref('');

const { items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(
  (params) => listarAdelantos({ ...params, estado: filtroEstado.value || undefined }),
  { limite: 10 }
);

const opcionesEstado = [
  { label: 'Solicitado', value: 'solicitado' },
  { label: 'Aprobado', value: 'aprobado' },
  { label: 'Rechazado', value: 'rechazado' },
  { label: 'Descontado', value: 'descontado' },
];

const etiquetas = {
  solicitado: 'Solicitado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  descontado: 'Descontado',
};

const colores = {
  solicitado: 'accent',
  aprobado: 'positive',
  rechazado: 'negative',
  descontado: 'grey-7',
};

function etiquetaEstado(estado) {
  return etiquetas[estado] || estado;
}

function colorEstado(estado) {
  return colores[estado] || 'grey';
}

const columnas = [
  { name: 'fecha', label: 'Fecha', field: (f) => f.fecha, align: 'left' },
  { name: 'guia', label: 'Guía', field: (f) => f.guiaId, align: 'left' },
  { name: 'monto', label: 'Monto', field: (f) => f.monto, align: 'right' },
  { name: 'motivo', label: 'Motivo', field: (f) => f.motivo, align: 'left' },
  { name: 'estado', label: 'Estado', field: (f) => f.estado, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const registro = ref({ monto: null, motivo: '' });
const guardando = ref(false);

async function guardar() {
  guardando.value = true;
  try {
    const { data } = await crearAdelanto({
      monto: Number(registro.value.monto),
      motivo: registro.value.motivo.trim(),
    });
    exito(data.message || 'Adelanto solicitado correctamente');
    registro.value = { monto: null, motivo: '' };
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
  }
}

async function cambiarEstado(fila, estado) {
  const esAprobar = estado === 'aprobado';
  const confirmado = await confirmar({
    titulo: esAprobar ? 'Aprobar adelanto' : 'Rechazar adelanto',
    texto: `${esAprobar ? 'Aprobar' : 'Rechazar'} el adelanto de ${formatoCop(fila.monto)} a ${
      fila.guiaId?.nombre || 'este guía'
    }.`,
    confirmar: esAprobar ? 'Aprobar' : 'Rechazar',
    cancelar: 'Volver',
  });
  if (!confirmado) return;

  try {
    const { data } = await cambiarEstadoAdelanto(fila._id, estado);
    exito(data.message || (esAprobar ? 'Adelanto aprobado' : 'Adelanto rechazado'));
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  }
}

watch(filtroEstado, () => {
  pagina.value = 1;
  cargar();
});

onMounted(async () => {
  animarEntrada(paginaEl.value?.$el || paginaEl.value);
  await cargar();
});
</script>
