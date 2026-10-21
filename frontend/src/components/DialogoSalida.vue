<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="cerrar">
    <q-card style="min-width: 340px; width: 560px; max-width: 96vw">
      <q-card-section>
        <div class="text-h6">Iniciar salida</div>
      </q-card-section>

      <q-form class="q-gutter-y-md" @submit="guardar">
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="registro.fecha"
                outlined
                dense
                type="date"
                label="Fecha"
                :rules="[reglas.obligatorio]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="registro.personas"
                outlined
                dense
                type="number"
                min="1"
                label="Personas"
                :rules="[reglas.enteroDesdeUno]"
                lazy-rules
              />
            </div>
          </div>

          <q-select
            v-if="!auth.esGuia"
            v-model="registro.guiaId"
            outlined
            dense
            label="Guía"
            :options="opcionesGuias"
            emit-value
            map-options
            :rules="[reglas.obligatorio]"
            lazy-rules
          />

          <q-select
            v-model="registro.actividadId"
            outlined
            dense
            label="Actividad"
            :options="opcionesActividades"
            emit-value
            map-options
            :rules="[reglas.obligatorio]"
            lazy-rules
            @update:model-value="alCambiarActividad"
          />

          <!-- Selección de motos (solo actividades tipo moto) -->
          <div v-if="esActividadMoto" class="q-mt-md">
            <div class="text-overline texto-suave q-mb-xs">
              Motos ({{ registro.motos.length }} seleccionadas)
            </div>
            <q-card flat bordered class="tarjeta-tabla">
              <q-list>
                <q-item
                  v-for="moto in motos"
                  :key="moto._id"
                  clickable
                  :disable="moto.estado !== 'disponible'"
                  @click="alternarMoto(moto)"
                >
                  <q-item-section avatar>
                    <q-checkbox
                      :model-value="registro.motos.includes(moto._id)"
                      dense
                      color="primary"
                      :disable="moto.estado !== 'disponible'"
                    />
                  </q-item-section>
                  <q-item-section>{{ moto.nombre }}</q-item-section>
                  <q-item-section side>
                    <q-chip
                      dense
                      size="sm"
                      class="chip-semaforo"
                      :color="moto.estado === 'disponible' ? 'positive' : 'warning'"
                      :text-color="moto.estado === 'disponible' ? 'white' : 'dark'"
                    >
                      {{ moto.estado === 'disponible' ? 'Disponible' : 'Mantenimiento' }}
                    </q-chip>
                  </q-item-section>
                </q-item>
                <q-item v-if="!motos.length">
                  <q-item-section class="texto-suave">No hay motos para mostrar</q-item-section>
                </q-item>
              </q-list>
            </q-card>
            <div v-if="maximoMotos" class="text-caption texto-suave q-mt-xs">
              Máximo autorizado: {{ maximoMotos }} moto{{ maximoMotos === 1 ? '' : 's' }} por guía
            </div>
          </div>

          <!-- Selección de cascos (actividades tipo cupo / cuevas) -->
          <div v-else class="q-mt-md">
            <div class="text-overline texto-suave q-mb-xs">Cascos</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="rango"
                  outlined
                  dense
                  label="Rango (ej. 1-10)"
                  placeholder="Desde-hasta"
                  @update:model-value="resolverCascos"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="sueltos"
                  outlined
                  dense
                  label="Cascos sueltos (ej. 3, 7, 12)"
                  placeholder="Separados por coma o espacio"
                  @update:model-value="resolverCascos"
                />
              </div>
            </div>
            <div class="row q-gutter-xs q-mt-sm">
              <q-chip
                v-for="casco in cascosResueltos"
                :key="casco._id"
                dense
                size="sm"
                class="chip-semaforo"
                :color="colorCasco(casco.estado)"
                :text-color="textoCasco(casco.estado)"
              >
                Casco {{ casco.numero }} · {{ etiquetaCasco(casco.estado) }}
              </q-chip>
              <span v-if="numerosNoEncontrados.length" class="text-caption texto-suave">
                Sin registro: {{ numerosNoEncontrados.join(', ') }}
              </span>
            </div>
            <div v-if="cascosInvalidos.length" class="text-caption text-warning q-mt-xs">
              No se incluyen por no estar disponibles: {{ cascosInvalidos.map((c) => c.numero).join(', ') }}
            </div>
          </div>

          <q-banner v-if="errorFormulario" class="bg-negative text-white q-mt-md" dense rounded>
            {{ errorFormulario }}
          </q-banner>

          <div v-if="pendienteAutorizacion" class="q-mt-md detalle-activo q-pa-sm">
            <div class="text-caption">
              {{ avisoAutorizacion }}
            </div>
            <q-btn
              class="q-mt-sm"
              color="secondary"
              text-color="dark"
              icon="gavel"
              label="Solicitar autorización"
              no-caps
              unelevated
              :loading="guardando"
              @click="solicitarAutorizacion"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat type="button" label="Cancelar" no-caps v-close-popup :disable="guardando" />
          <q-btn color="primary" type="submit" label="Iniciar" no-caps unelevated :loading="guardando" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { listarActividades } from '../services/actividades';
import { listarMotos } from '../services/motos';
import { listarGuias } from '../services/guias';
import { listarCascos } from '../services/cascos';
import { crearSalida } from '../services/salidas';
import { obtenerMapaParametros } from '../services/parametros';
import { mensajeDeError } from '../services/api';
import { exito, informacion } from '../services/alertas';
import { reglas } from '../utils/validaciones';
import { hoyISO } from '../utils/formato';

const props = defineProps({ modelValue: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue', 'guardado']);

const auth = useAuthStore();

const registro = ref({ fecha: hoyISO(), actividadId: null, personas: 1, motos: [], cascos: [], guiaId: '' });
const actividades = ref([]);
const guias = ref([]);
const motos = ref([]);
const cascos = ref([]);
const rango = ref('');
const sueltos = ref('');
const cascosResueltos = ref([]);
const numerosNoEncontrados = ref([]);
const maximoMotos = ref(null);
const guardando = ref(false);
const errorFormulario = ref('');
const pendienteAutorizacion = ref(false);
const avisoAutorizacion = ref('');

const opcionesActividades = computed(() =>
  actividades.value.map((actividad) => ({ label: actividad.nombre, value: actividad._id }))
);

const opcionesGuias = computed(() => guias.value.map((guia) => ({ label: guia.nombre, value: guia._id })));

const actividadSeleccionada = computed(() =>
  actividades.value.find((actividad) => actividad._id === registro.value.actividadId)
);

const esActividadMoto = computed(() => actividadSeleccionada.value?.tipoRecurso === 'moto');

/** Solo se envían cascos disponibles; el resto se avisa en pantalla. */
const cascosValidos = computed(() => cascosResueltos.value.filter((casco) => casco.estado === 'disponible'));
const cascosInvalidos = computed(() => cascosResueltos.value.filter((casco) => casco.estado !== 'disponible'));

const estadosCasco = {
  disponible: { label: 'Disponible', color: 'positive', texto: 'white' },
  en_uso: { label: 'En uso', color: 'accent', texto: 'white' },
  por_lavar: { label: 'Por lavar', color: 'warning', texto: 'dark' },
  danado: { label: 'Dañado', color: 'negative', texto: 'white' },
  perdido: { label: 'Perdido', color: 'dark', texto: 'white' },
};

function etiquetaCasco(estado) {
  return estadosCasco[estado]?.label || estado;
}

function colorCasco(estado) {
  return estadosCasco[estado]?.color || 'grey';
}

function textoCasco(estado) {
  return estadosCasco[estado]?.texto || 'white';
}

function alCambiarActividad() {
  registro.value.motos = [];
  registro.value.cascos = [];
}

function alternarMoto(moto) {
  if (moto.estado !== 'disponible') return;
  const seleccion = registro.value.motos;
  const indice = seleccion.indexOf(moto._id);
  if (indice >= 0) seleccion.splice(indice, 1);
  else seleccion.push(moto._id);
}

/** Convierte el rango "1-10" y los sueltos "3, 7" en números de casco. */
function numerosSolicitados() {
  const numeros = new Set();
  const coincidencia = rango.value.match(/^\s*(\d+)\s*(?:-|–|a|hasta)\s*(\d+)\s*$/i);
  if (coincidencia) {
    let desde = Number(coincidencia[1]);
    const hasta = Number(coincidencia[2]);
    if (desde > hasta) [desde, hasta] = [hasta, desde];
    for (let numero = desde; numero <= hasta; numero += 1) numeros.add(numero);
  } else if (rango.value.trim()) {
    const simple = rango.value.match(/^\s*(\d+)\s*$/);
    if (simple) numeros.add(Number(simple[1]));
  }
  sueltos.value
    .split(/[\s,;]+/)
    .map((texto) => texto.trim())
    .filter((texto) => /^\d+$/.test(texto))
    .forEach((texto) => numeros.add(Number(texto)));
  return numeros;
}

function resolverCascos() {
  const numeros = numerosSolicitados();
  cascosResueltos.value = cascos.value.filter((casco) => numeros.has(casco.numero));
  const encontrados = new Set(cascosResueltos.value.map((casco) => casco.numero));
  numerosNoEncontrados.value = [...numeros].filter((numero) => !encontrados.has(numero)).sort((a, b) => a - b);
  registro.value.cascos = cascosValidos.value.map((casco) => casco._id);
}

async function cargarCatalogos() {
  try {
    const [actividadesRespuesta, parametrosRespuesta] = await Promise.all([
      listarActividades({ soloActivas: 'true', page: 1, limit: 100 }),
      obtenerMapaParametros({ silenciarNotificacion: true }),
    ]);
    actividades.value = actividadesRespuesta.data.data.items || [];

    const mapa = parametrosRespuesta?.data?.data || {};
    const maximo = mapa.maxMotosPorGuia?.valor ?? mapa.maxMotosPorGuia;
    maximoMotos.value = Number.isFinite(Number(maximo)) && maximo !== null ? Number(maximo) : null;
  } catch {
    // Los catálogos son auxiliares: si fallan, el backend sigue validando
  }

  try {
    const [motosRespuesta, cascosRespuesta] = await Promise.all([
      listarMotos({ page: 1, limit: 100 }),
      listarCascos({ page: 1, limit: 200 }),
    ]);
    motos.value = motosRespuesta.data.data.items || [];
    cascos.value = cascosRespuesta.data.data.items || [];
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  }

  // El admin debe indicar a qué guía pertenece la salida
  if (!auth.esGuia) {
    try {
      const { data } = await listarGuias({ page: 1, limit: 100 });
      guias.value = data.data.items || [];
    } catch {
      // Catálogo auxiliar
    }
  }
}

function reiniciar() {
  registro.value = { fecha: hoyISO(), actividadId: null, personas: 1, motos: [], cascos: [], guiaId: '' };
  rango.value = '';
  sueltos.value = '';
  cascosResueltos.value = [];
  numerosNoEncontrados.value = [];
  errorFormulario.value = '';
  pendienteAutorizacion.value = false;
  avisoAutorizacion.value = '';
  guardando.value = false;
}

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      reiniciar();
      cargarCatalogos();
    }
  }
);

function cerrar(valor) {
  if (guardando.value) return;
  emit('update:modelValue', valor);
}

async function enviar(esAutorizada) {
  if (!esActividadMoto.value && !cascosValidos.value.length) {
    errorFormulario.value = 'Seleccione al menos un casco disponible (rango o cascos sueltos)';
    return;
  }
  if (esActividadMoto.value && !registro.value.motos.length) {
    errorFormulario.value = 'Seleccione al menos una moto disponible';
    return;
  }

  guardando.value = true;
  errorFormulario.value = '';
  pendienteAutorizacion.value = false;
  try {
    const datos = {
      fecha: registro.value.fecha,
      actividadId: registro.value.actividadId,
      personas: Number(registro.value.personas),
      motos: registro.value.motos,
      cascos: cascosValidos.value.map((casco) => casco._id),
    };
    if (!auth.esGuia) datos.guiaId = registro.value.guiaId;
    if (esAutorizada) datos.excepcionMotos = true;

    const { data } = await crearSalida(datos, { silenciarNotificacion: true });
    exito(data.message || 'Salida iniciada correctamente');
    emit('update:modelValue', false);
    emit('guardado');
  } catch (e) {
    errorFormulario.value = mensajeDeError(e);
    if (/Máximo\s+\d+\s+motos/i.test(errorFormulario.value)) {
      pendienteAutorizacion.value = true;
      avisoAutorizacion.value = auth.esGuia
        ? 'La excepción solo la autorizan el administrador o la secretaria(o). Solicítela y que la autoricen desde la lista de salidas.'
        : 'Usted puede autorizar esta excepción y guardar la salida de inmediato.';
    }
  } finally {
    guardando.value = false;
  }
}

function guardar() {
  return enviar(false);
}

async function solicitarAutorizacion() {
  if (auth.esGuia) {
    pendienteAutorizacion.value = false;
    await informacion(
      'Solo el administrador o la secretaria(o) pueden autorizar más motos de las permitidas. Pida la autorización para que la autoricen.'
    );
    return;
  }
  await enviar(true);
}
</script>
