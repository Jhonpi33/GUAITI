<template>
  <q-page ref="paginaEl" padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Liquidaciones</div>
      <q-space />
      <q-chip v-if="auth.esGuia" dense color="primary" text-color="white" icon="visibility">
        Consulta de sus liquidaciones
      </q-chip>
    </div>

    <!-- Armar liquidación (admin/secretario) -->
    <q-card v-if="!auth.esGuia" flat bordered class="tarjeta-tabla q-mb-md" data-anim>
      <q-card-section class="text-h6">Armar liquidación</q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md items-start">
          <div class="col-12 col-sm-4">
            <q-select
              v-model="guiaSeleccionado"
              outlined
              dense
              label="Guía"
              :options="opcionesGuias"
              emit-value
              map-options
              :rules="[reglas.obligatorio]"
              lazy-rules
            />
          </div>
          <div class="col-6 col-sm-3">
            <q-input v-model="periodo.desde" outlined dense type="date" label="Desde" :rules="[reglas.obligatorio]" lazy-rules />
          </div>
          <div class="col-6 col-sm-3">
            <q-input v-model="periodo.hasta" outlined dense type="date" label="Hasta" :rules="[reglas.obligatorio]" lazy-rules />
          </div>
          <div class="col-12 col-sm-2 flex items-center">
            <q-btn class="full-width" outline color="primary" no-caps icon="refresh" label="Calcular" :disable="!guiaSeleccionado" @click="cargarResumen" />
          </div>
        </div>

        <q-inner-loading :showing="cargandoResumen">
          <q-spinner color="primary" size="2rem" />
        </q-inner-loading>

        <template v-if="resumen">
          <div class="text-overline texto-suave q-mt-lg">Guianzas pendientes (salidas cerradas)</div>
          <q-list class="q-mt-xs">
            <q-item v-for="salida in resumen.salidasPendientes" :key="salida._id" clickable dense @click="alternarSalida(salida)">
              <q-item-section avatar>
                <q-checkbox :model-value="salidasSeleccionadas.includes(salida._id)" dense color="primary" @click.stop="alternarSalida(salida)" />
              </q-item-section>
              <q-item-section>
                {{ formatoFecha(salida.fecha) }} · {{ salida.actividad || 'Actividad' }} · {{ salida.personas }} persona(s)
              </q-item-section>
              <q-item-section side>{{ formatoCop(salida.valor) }}</q-item-section>
            </q-item>
            <q-item v-if="!resumen.salidasPendientes.length" class="q-px-none">
              <q-item-section class="texto-suave">
                No hay salidas cerradas sin liquidar en este período.
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-overline texto-suave q-mt-md">Adelantos aprobados por descontar</div>
          <div class="row q-gutter-xs q-mt-xs">
            <q-chip
              v-for="adelanto in resumen.adelantosAprobados"
              :key="adelanto._id"
              dense
              color="secondary"
              text-color="dark"
              icon="payments"
            >
              {{ formatoCop(adelanto.monto) }} · {{ adelanto.motivo }}
            </q-chip>
            <span v-if="!resumen.adelantosAprobados.length" class="text-caption texto-suave">
              Sin adelantos pendientes.
            </span>
          </div>

          <div class="row q-col-gutter-md q-mt-md items-end">
            <div class="col-12 col-sm-4">
              <q-input
                v-model.number="descuentosPorPerdidas"
                outlined
                dense
                type="number"
                min="0"
                label="Descuentos por pérdidas (COP)"
                prefix="$"
                :rules="[reglas.precio]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-sm-8">
              <div class="detalle-activo q-pa-sm">
                <div class="text-caption texto-suave">Cálculo</div>
                <div class="text-body2">
                  Guianzas seleccionadas: <b>{{ formatoCop(baseSeleccionada) }}</b> · Adelantos:
                  <b>−{{ formatoCop(resumen.adelantosDescontados) }}</b> · Pérdidas:
                  <b>−{{ formatoCop(descuentosPorPerdidas) }}</b>
                </div>
                <div class="text-h6 q-mt-xs" :class="totalCalculado <= 0 ? 'text-warning' : 'text-primary'">
                  Total: {{ formatoCop(totalCalculado) }}
                </div>
              </div>
            </div>
          </div>

          <q-btn
            class="q-mt-md"
            color="primary"
            unelevated
            no-caps
            icon="request_quote"
            label="Generar liquidación"
            :disable="!salidasSeleccionadas.length || totalCalculado < 0"
            :loading="generando"
            @click="generar"
          />
        </template>
      </q-card-section>
    </q-card>

    <!-- Listado de liquidaciones -->
    <div class="text-h6 q-mb-sm">{{ auth.esGuia ? 'Mis liquidaciones' : 'Liquidaciones generadas' }}</div>

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
      no-data-label="No hay liquidaciones registradas"
      loading-label="Cargando..."
    >
      <template #body-periodo="props">
        <span>
          {{ formatoFecha(props.row.periodo?.desde) }} — {{ formatoFecha(props.row.periodo?.hasta) }}
        </span>
      </template>

      <template #body-guia="props">
        <span>{{ props.row.guiaId?.nombre || '—' }}</span>
      </template>

      <template #body-total="props">
        <span class="text-weight-bold">{{ formatoCop(props.row.total) }}</span>
      </template>

      <template #body-estado="props">
        <q-chip dense size="sm" class="chip-semaforo" :color="props.row.estado === 'pagada' ? 'positive' : 'warning'" :text-color="props.row.estado === 'pagada' ? 'white' : 'dark'">
          {{ props.row.estado === 'pagada' ? 'Pagada' : 'Pendiente' }}
        </q-chip>
      </template>

      <template #body-acciones="props">
        <q-btn
          v-if="!auth.esGuia && props.row.estado !== 'pagada'"
          flat
          dense
          round
          icon="payments"
          color="primary"
          @click="marcarPagada(props.row)"
        >
          <q-tooltip>Marcar pagada</q-tooltip>
        </q-btn>
        <span v-else class="text-caption texto-suave">
          {{ props.row.estado === 'pagada' ? formatoFecha(props.row.fechaPago) : '—' }}
        </span>
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
      texto-vacio="No hay liquidaciones registradas"
    >
      <template #contenido="{ item }">
        <div class="row items-center">
          <div class="salida-titulo col">{{ formatoCop(item.total) }}</div>
          <q-chip dense size="sm" class="chip-semaforo" :color="item.estado === 'pagada' ? 'positive' : 'warning'" :text-color="item.estado === 'pagada' ? 'white' : 'dark'">
            {{ item.estado === 'pagada' ? 'Pagada' : 'Pendiente' }}
          </q-chip>
        </div>
        <div class="text-caption texto-suave q-mt-xs">
          {{ item.guiaId?.nombre || '—' }} · {{ formatoFecha(item.periodo?.desde) }} —
          {{ formatoFecha(item.periodo?.hasta) }}
        </div>
        <div class="text-caption">
          Guianzas: {{ formatoCop(item.base) }} · Adelantos: −{{ formatoCop(item.adelantosDescontados) }} ·
          Pérdidas: −{{ formatoCop(item.descuentosPorPerdidas) }}
        </div>
        <div v-if="item.fechaPago" class="text-caption texto-suave">
          Pagada el {{ formatoFecha(item.fechaPago) }}
        </div>
      </template>

      <template #acciones="{ item }">
        <q-btn
          v-if="!auth.esGuia && item.estado !== 'pagada'"
          dense
          no-caps
          unelevated
          color="primary"
          icon="payments"
          label="Marcar pagada"
          @click="marcarPagada(item)"
        />
      </template>
    </ListadoTarjetas>

    <div class="row items-center full-width tabla-inferior q-mt-sm lt-md">
      <span class="text-caption">Página {{ pagina }} de {{ paginas }} — {{ total }} registros</span>
      <q-space />
      <q-btn flat dense icon="chevron_left" label="Anterior" :disable="cargando || pagina <= 1" @click="irPagina(pagina - 1)" />
      <q-btn flat dense label="Siguiente" icon-right="chevron_right" :disable="cargando || pagina >= paginas" @click="irPagina(pagina + 1)" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import {
  listarLiquidaciones,
  crearLiquidacion,
  marcarLiquidacionPagada,
  obtenerResumenLiquidacion,
} from '../services/liquidaciones';
import { listarGuias } from '../services/guias';
import { confirmar, exito } from '../services/alertas';
import { animarEntrada } from '../utils/animaciones';
import { reglas } from '../utils/validaciones';
import { formatoCop, formatoFecha, hoyISO } from '../utils/formato';
import ListadoTarjetas from '../components/ListadoTarjetas.vue';
import PaginacionListado from '../components/PaginacionListado.vue';

const auth = useAuthStore();
const paginaEl = ref(null);

const { items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(
  (params) => listarLiquidaciones(params),
  { limite: 10 }
);

const columnas = [
  { name: 'periodo', label: 'Período', field: (f) => f.periodo, align: 'left' },
  { name: 'guia', label: 'Guía', field: (f) => f.guiaId, align: 'left' },
  { name: 'total', label: 'Total', field: (f) => f.total, align: 'right' },
  { name: 'estado', label: 'Estado', field: (f) => f.estado, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

/* ------------------------- Armar liquidación ------------------------- */

const guias = ref([]);
const opcionesGuias = computed(() => guias.value.map((g) => ({ label: g.nombre, value: g._id })));

const guiaSeleccionado = ref('');
const periodo = ref({ desde: '', hasta: hoyISO() });
const resumen = ref(null);
const salidasSeleccionadas = ref([]);
const descuentosPorPerdidas = ref(0);
const cargandoResumen = ref(false);
const generando = ref(false);

const baseSeleccionada = computed(() => {
  if (!resumen.value) return 0;
  return resumen.value.salidasPendientes
    .filter((salida) => salidasSeleccionadas.value.includes(salida._id))
    .reduce((suma, salida) => suma + (salida.valor || 0), 0);
});

const totalCalculado = computed(() => {
  if (!resumen.value) return 0;
  return baseSeleccionada.value - (resumen.value.adelantosDescontados || 0) - (Number(descuentosPorPerdidas.value) || 0);
});

function alternarSalida(salida) {
  const indice = salidasSeleccionadas.value.indexOf(salida._id);
  if (indice >= 0) salidasSeleccionadas.value.splice(indice, 1);
  else salidasSeleccionadas.value.push(salida._id);
}

async function cargarResumen() {
  if (!guiaSeleccionado.value) return;
  cargandoResumen.value = true;
  resumen.value = null;
  try {
    const { data } = await obtenerResumenLiquidacion(guiaSeleccionado.value, {
      desde: periodo.value.desde || undefined,
      hasta: periodo.value.hasta || undefined,
    });
    resumen.value = data.data;
    salidasSeleccionadas.value = (data.data.salidasPendientes || []).map((salida) => salida._id);
    descuentosPorPerdidas.value = 0;
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    cargandoResumen.value = false;
  }
}

async function generar() {
  const confirmado = await confirmar({
    titulo: 'Generar liquidación',
    texto: `Se generará la liquidación por ${formatoCop(totalCalculado.value)}. Las salidas y adelantos quedarán marcados como liquidados.`,
    confirmar: 'Generar',
  });
  if (!confirmado) return;

  generando.value = true;
  try {
    const { data } = await crearLiquidacion({
      guiaId: guiaSeleccionado.value,
      periodo: { desde: periodo.value.desde, hasta: periodo.value.hasta },
      salidasIds: salidasSeleccionadas.value,
      descuentosPorPerdidas: Number(descuentosPorPerdidas.value) || 0,
    });
    exito(data.message || 'Liquidación generada correctamente');
    resumen.value = null;
    await cargar();
    await cargarResumen();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    generando.value = false;
  }
}

async function marcarPagada(fila) {
  const confirmado = await confirmar({
    titulo: 'Marcar como pagada',
    texto: `¿Confirmar el pago de ${formatoCop(fila.total)} a ${fila.guiaId?.nombre || 'este guía'}?`,
    confirmar: 'Marcar pagada',
  });
  if (!confirmado) return;

  try {
    const { data } = await marcarLiquidacionPagada(fila._id, hoyISO());
    exito(data.message || 'Liquidación marcada como pagada');
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  }
}

async function cargarGuias() {
  if (auth.esGuia) return;
  try {
    const { data } = await listarGuias({ page: 1, limit: 100 });
    guias.value = data.data.items || [];
  } catch {
    // Catálogo auxiliar
  }
}

onMounted(async () => {
  animarEntrada(paginaEl.value?.$el || paginaEl.value);
  await Promise.all([cargar(), cargarGuias()]);
});
</script>
