<template>
  <q-page ref="pagina" padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Mi panel</div>
      <q-space />
      <q-input
        v-model="fecha"
        outlined
        dense
        type="date"
        label="Fecha"
        style="min-width: 170px"
        @update:model-value="cargar"
      />
    </div>

    <!-- Resumen: lo que se le debe y pendientes -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-4" data-anim>
        <div class="panel-resumen">
          <div class="kpi-etiqueta">Lo que se le debe</div>
          <div class="kpi-valor q-mt-xs">{{ formatoCop(datos.totalAdelantosPendientes) }}</div>
          <div class="text-caption texto-suave">Adelantos aprobados por descontar</div>
        </div>
      </div>
      <div class="col-12 col-sm-4" data-anim>
        <div class="panel-resumen" style="border-left-color: var(--q-accent)">
          <div class="kpi-etiqueta">Liquidaciones pendientes</div>
          <div class="kpi-valor q-mt-xs">{{ formatoCop(datos.totalLiquidacionesPendientes) }}</div>
          <div class="text-caption texto-suave">Sin pagar todavía</div>
        </div>
      </div>
      <div class="col-12 col-sm-4" data-anim>
        <div class="panel-resumen" style="border-left-color: var(--q-warning)">
          <div class="kpi-etiqueta">Cascos por lavar</div>
          <div class="kpi-valor q-mt-xs">{{ datos.cascosPendientes ?? 0 }}</div>
          <div class="text-caption texto-suave">Pendientes en la cueva</div>
        </div>
      </div>
    </div>

    <!-- Botón principal: iniciar salida -->
    <q-btn
      class="boton-salida-grande full-width q-mb-md"
      color="primary"
      unelevated
      no-caps
      icon="add_road"
      label="Iniciar salida"
      data-anim
      @click="dialogoSalida = true"
    />

    <div class="text-h6 q-mb-sm">Salidas de hoy</div>

    <div class="column q-gutter-sm" ref="listado">
      <q-card
        v-for="salida in datos.salidas"
        :key="salida._id"
        flat
        bordered
        class="tarjeta-salida"
        data-fila
      >
        <q-card-section>
          <div class="row items-center">
            <div class="salida-titulo col">
              {{ salida.actividadId?.nombre || 'Actividad' }}
            </div>
            <q-chip
              dense
              size="sm"
              class="chip-semaforo"
              :color="colorEstado(salida.estado)"
              text-color="white"
            >
              {{ etiquetaEstado(salida.estado) }}
            </q-chip>
          </div>

          <div class="row items-center q-gutter-xs q-mt-sm">
            <q-chip dense outline color="accent" icon="groups">
              {{ salida.personas }} persona{{ salida.personas === 1 ? '' : 's' }}
            </q-chip>
            <q-chip v-if="salida.motos?.length" dense outline color="primary" icon="motorcycle">
              {{ salida.motos.length }} moto{{ salida.motos.length === 1 ? '' : 's' }}
            </q-chip>
            <q-chip v-if="salida.cascos?.length" dense outline color="secondary" icon="sports_motorsports">
              {{ salida.cascos.length }} casco{{ salida.cascos.length === 1 ? '' : 's' }}
            </q-chip>
            <q-chip v-if="salida.excepcionMotos" dense color="warning" text-color="dark" icon="gavel">
              Excepción autorizada
            </q-chip>
          </div>

          <div v-if="salida.motos?.length" class="text-caption texto-suave q-mt-sm">
            Motos: {{ salida.motos.map((m) => m.nombre).join(', ') }}
          </div>
          <div v-if="salida.cascos?.length" class="text-caption texto-suave">
            Cascos: {{ salida.cascos.map((c) => c.numero).join(', ') }}
          </div>
          <div v-if="salida.novedades" class="text-caption q-mt-xs">
            Novedades: {{ salida.novedades }}
          </div>
        </q-card-section>

        <q-card-actions v-if="salida.estado !== 'cerrada'" align="right" class="q-px-md q-pb-md">
          <q-btn
            v-if="salida.estado === 'abierta'"
            color="primary"
            unelevated
            no-caps
            icon="play_arrow"
            label="Poner en curso"
            :loading="accionando === salida._id"
            @click="ponerEnCurso(salida)"
          />
          <q-btn
            color="secondary"
            text-color="dark"
            unelevated
            no-caps
            icon="flag"
            label="Cerrar salida"
            @click="abrirCierre(salida)"
          />
        </q-card-actions>
      </q-card>

      <q-card v-if="!cargando && !datos.salidas.length" flat bordered class="tarjeta-salida q-pa-md">
        <div class="text-center texto-suave">
          No tiene salidas registradas para este día.
        </div>
      </q-card>
    </div>

    <q-inner-loading :showing="cargando">
      <q-spinner color="primary" size="2.2rem" />
    </q-inner-loading>

    <DialogoSalida v-model="dialogoSalida" @guardado="cargar" />
    <DialogoCierreSalida
      v-model="dialogoCierre"
      :salida="salidaSeleccionada"
      @cerrada="cargar"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { obtenerPanelGuia } from '../services/panelGuia';
import { cambiarEstadoSalida } from '../services/salidas';
import { confirmar, exito } from '../services/alertas';
import { animarEntrada, animarTabla } from '../utils/animaciones';
import { formatoCop, hoyISO } from '../utils/formato';
import DialogoSalida from '../components/DialogoSalida.vue';
import DialogoCierreSalida from '../components/DialogoCierreSalida.vue';

const pagina = ref(null);
const listado = ref(null);
const fecha = ref(hoyISO());
const cargando = ref(false);
const accionando = ref(null);
const dialogoSalida = ref(false);
const dialogoCierre = ref(false);
const salidaSeleccionada = ref(null);

const datos = ref({
  fecha: '',
  guia: null,
  salidas: [],
  totalAdelantosPendientes: 0,
  totalLiquidacionesPendientes: 0,
  cascosPendientes: 0,
});

const etiquetas = { abierta: 'Abierta', en_curso: 'En curso', cerrada: 'Cerrada' };
const colores = { abierta: 'accent', en_curso: 'secondary', cerrada: 'grey-7' };

function etiquetaEstado(estado) {
  return etiquetas[estado] || estado;
}

function colorEstado(estado) {
  return colores[estado] || 'grey';
}

async function cargar() {
  cargando.value = true;
  try {
    const { data } = await obtenerPanelGuia(fecha.value);
    datos.value = { ...datos.value, ...data.data };
    await nextTick();
    animarTabla(listado.value);
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    cargando.value = false;
  }
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

function abrirCierre(salida) {
  salidaSeleccionada.value = salida;
  dialogoCierre.value = true;
}

onMounted(async () => {
  animarEntrada(pagina.value?.$el || pagina.value);
  await cargar();
});
</script>
