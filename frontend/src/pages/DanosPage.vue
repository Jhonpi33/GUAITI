<template>
  <q-page ref="paginaEl" padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Daños y reportes</div>
      <q-space />
      <q-btn color="primary" icon="add_a_photo" label="Nuevo reporte" no-caps unelevated @click="abrirNuevo" />
    </div>

    <q-card flat bordered class="tarjeta-tabla q-mb-md" data-anim>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-3">
            <q-input v-model="filtroFecha" outlined dense clearable type="date" label="Fecha" />
          </div>
          <div class="col-12 col-sm-3">
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
      no-data-label="No hay reportes de daño"
      loading-label="Cargando..."
    >
      <template #body-fecha="props">
        <span>{{ formatoFecha(props.row.fecha) }}</span>
      </template>

      <template #body-equipo="props">
        <span>{{ props.row.motoId?.nombre || props.row.equipo || '—' }}</span>
      </template>

      <template #body-descripcion="props">
        <span class="text-caption">{{ props.row.descripcion }}</span>
      </template>

      <template #body-gravedad="props">
        <q-chip dense size="sm" class="chip-semaforo" :color="props.row.gravedad === 'grave' ? 'negative' : 'warning'" :text-color="props.row.gravedad === 'grave' ? 'white' : 'dark'">
          {{ props.row.gravedad === 'grave' ? 'Grave' : 'Leve' }}
        </q-chip>
      </template>

      <template #body-estado="props">
        <q-select
          v-if="!auth.esGuia"
          :model-value="props.row.estado"
          dense
          outlined
          :options="opcionesEstado"
          emit-value
          map-options
          style="min-width: 160px"
          @update:model-value="(valor) => cambiarEstado(props.row, valor)"
        />
        <q-chip v-else dense size="sm" class="chip-semaforo" :color="colorEstado(props.row.estado)" text-color="white">
          {{ etiquetaEstado(props.row.estado) }}
        </q-chip>
      </template>

      <template #body-fotos="props">
        <div class="row q-gutter-xs">
          <q-icon
            v-for="(foto, i) in props.row.fotos"
            :key="i"
            name="photo"
            color="accent"
            size="sm"
            class="cursor-pointer"
            @click="abrirFoto(foto)"
          >
            <q-tooltip>Ver foto</q-tooltip>
          </q-icon>
          <span v-if="!props.row.fotos?.length" class="text-caption texto-suave">Sin fotos</span>
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

    <ListadoTarjetas
      v-else
      :items="items"
      :cargando="cargando"
      texto-vacio="No hay reportes de daño"
    >
      <template #contenido="{ item }">
        <div class="row items-center">
          <div class="salida-titulo col">
            {{ item.motoId?.nombre || item.equipo || 'Equipo' }}
          </div>
          <q-chip dense size="sm" class="chip-semaforo" :color="colorEstado(item.estado)" text-color="white">
            {{ etiquetaEstado(item.estado) }}
          </q-chip>
        </div>
        <div class="row items-center q-gutter-xs q-mt-xs">
          <q-chip dense size="sm" :color="item.gravedad === 'grave' ? 'negative' : 'warning'" :text-color="item.gravedad === 'grave' ? 'white' : 'dark'">
            {{ item.gravedad === 'grave' ? 'Grave' : 'Leve' }}
          </q-chip>
          <span class="text-caption texto-suave">{{ formatoFecha(item.fecha) }}</span>
          <span class="text-caption texto-suave">· {{ item.guiaId?.nombre || '—' }}</span>
        </div>
        <div class="text-caption q-mt-xs">{{ item.descripcion }}</div>
        <div v-if="item.fotos?.length" class="row q-gutter-xs q-mt-xs">
          <q-icon
            v-for="(foto, i) in item.fotos"
            :key="i"
            name="photo"
            color="accent"
            size="sm"
            class="cursor-pointer"
            @click="abrirFoto(foto)"
          />
        </div>
      </template>

      <template #acciones="{ item }">
        <q-select
          v-if="!auth.esGuia"
          dense
          outlined
          label="Estado"
          :model-value="item.estado"
          :options="opcionesEstado"
          emit-value
          map-options
          style="min-width: 170px"
          @update:model-value="(valor) => cambiarEstado(item, valor)"
        />
      </template>
    </ListadoTarjetas>

    <div class="row items-center full-width tabla-inferior q-mt-sm lt-md">
      <span class="text-caption">Página {{ pagina }} de {{ paginas }} — {{ total }} registros</span>
      <q-space />
      <q-btn flat dense icon="chevron_left" label="Anterior" :disable="cargando || pagina <= 1" @click="irPagina(pagina - 1)" />
      <q-btn flat dense label="Siguiente" icon-right="chevron_right" :disable="cargando || pagina >= paginas" @click="irPagina(pagina + 1)" />
    </div>

    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 340px; width: 560px; max-width: 96vw">
        <q-card-section>
          <div class="text-h6">Nuevo reporte de daño</div>
        </q-card-section>

        <q-form class="q-gutter-y-md" @submit="guardar">
          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="registro.fecha" outlined dense type="date" label="Fecha" :rules="[reglas.obligatorio]" lazy-rules />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="registro.gravedad"
                  outlined
                  dense
                  label="Gravedad"
                  :options="[
                    { label: 'Leve', value: 'leve' },
                    { label: 'Grave (la moto pasa a mantenimiento)', value: 'grave' },
                  ]"
                  emit-value
                  map-options
                  :rules="[reglas.obligatorio]"
                  lazy-rules
                />
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-xs">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="registro.motoId"
                  outlined
                  dense
                  clearable
                  label="Moto afectada (opcional)"
                  :options="opcionesMotos"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="registro.equipo" outlined dense label="Equipo (opcional)" placeholder="Casco, implemento..." />
              </div>
            </div>

            <q-select
              v-if="!auth.esGuia"
              v-model="registro.guiaId"
              class="q-mt-md"
              outlined
              dense
              label="Guía responsable"
              :options="opcionesGuias"
              emit-value
              map-options
              :rules="[reglas.obligatorio]"
              lazy-rules
            />

            <q-input
              v-model="registro.descripcion"
              class="q-mt-md"
              outlined
              dense
              type="textarea"
              label="Descripción del daño"
              placeholder="Qué pasó, qué se dañó, dónde..."
              :rules="[reglas.nombre]"
              lazy-rules
            />

            <div class="text-overline texto-suave q-mt-md">Fotos (cámara o galería)</div>
            <input
              ref="inputFotos"
              class="q-mt-xs"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              @change="alElegirFotos"
            />

            <div v-if="fotos.length" class="row q-gutter-sm q-mt-sm">
              <div v-for="(foto, i) in fotos" :key="i" class="column items-center">
                <img :src="foto.vistaPrevia" alt="Foto del daño" class="foto-miniatura" />
                <q-btn dense flat color="negative" icon="delete" size="sm" @click="quitarFoto(i)">
                  <q-tooltip>Quitar</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div v-if="subiendoFotos" class="text-caption texto-suave q-mt-sm">
              Subiendo fotos... por favor espere.
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat type="button" label="Cancelar" no-caps v-close-popup :disable="guardando" />
            <q-btn color="primary" type="submit" label="Guardar reporte" no-caps unelevated :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarReportesDanio, crearReporteDanio, cambiarEstadoReporte } from '../services/danos';
import { listarMotos } from '../services/motos';
import { listarGuias } from '../services/guias';
import { subirFoto } from '../services/uploads';
import { confirmar, exito } from '../services/alertas';
import { animarEntrada } from '../utils/animaciones';
import { reglas } from '../utils/validaciones';
import { formatoFecha, hoyISO } from '../utils/formato';
import ListadoTarjetas from '../components/ListadoTarjetas.vue';
import PaginacionListado from '../components/PaginacionListado.vue';

const auth = useAuthStore();
const paginaEl = ref(null);

const filtroFecha = ref('');
const filtroEstado = ref('');
const filtroMoto = ref('');

const { items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(
  (params) =>
    listarReportesDanio({
      ...params,
      fecha: filtroFecha.value || undefined,
      estado: filtroEstado.value || undefined,
      motoId: filtroMoto.value || undefined,
    }),
  { limite: 10 }
);

const opcionesEstado = [
  { label: 'Reportado', value: 'reportado' },
  { label: 'En reparación', value: 'en_reparacion' },
  { label: 'Resuelto', value: 'resuelto' },
];

const etiquetas = { reportado: 'Reportado', en_reparacion: 'En reparación', resuelto: 'Resuelto' };
const colores = { reportado: 'negative', en_reparacion: 'warning', resuelto: 'positive' };

function etiquetaEstado(estado) {
  return etiquetas[estado] || estado;
}

function colorEstado(estado) {
  return colores[estado] || 'grey';
}

const columnas = [
  { name: 'fecha', label: 'Fecha', field: (f) => f.fecha, align: 'left' },
  { name: 'equipo', label: 'Moto / equipo', field: (f) => f.motoId, align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: (f) => f.descripcion, align: 'left' },
  { name: 'gravedad', label: 'Gravedad', field: (f) => f.gravedad, align: 'center' },
  { name: 'estado', label: 'Estado', field: (f) => f.estado, align: 'center' },
  { name: 'fotos', label: 'Fotos', field: (f) => f.fotos, align: 'center' },
];

const motos = ref([]);
const guias = ref([]);

const opcionesMotos = computed(() => motos.value.map((m) => ({ label: m.nombre, value: m._id })));
const opcionesGuias = computed(() => guias.value.map((g) => ({ label: g.nombre, value: g._id })));

const dialogo = ref(false);
const guardando = ref(false);
const subiendoFotos = ref(false);
const fotos = ref([]);
const inputFotos = ref(null);

const registro = ref(vacio());

function vacio() {
  return {
    fecha: hoyISO(),
    gravedad: 'leve',
    motoId: '',
    equipo: '',
    guiaId: '',
    descripcion: '',
  };
}

function abrirNuevo() {
  registro.value = vacio();
  fotos.value = [];
  if (inputFotos.value) inputFotos.value.value = '';
  dialogo.value = true;
}

function alElegirFotos(evento) {
  const archivos = Array.from(evento.target.files || []);
  fotos.value = archivos.map((archivo) => ({
    archivo,
    vistaPrevia: URL.createObjectURL(archivo),
  }));
}

function quitarFoto(indice) {
  URL.revokeObjectURL(fotos.value[indice].vistaPrevia);
  fotos.value.splice(indice, 1);
}

function abrirFoto(url) {
  window.open(url, '_blank', 'noopener');
}

async function guardar() {
  if (registro.value.gravedad === 'grave' && registro.value.motoId) {
    const confirmado = await confirmar({
      titulo: 'Daño grave',
      texto: 'Al marcar el daño como grave, la moto pasará a estado "mantenimiento" y no podrá salir. ¿Continuar?',
      confirmar: 'Sí, reportar',
      icono: 'warning',
    });
    if (!confirmado) return;
  }

  guardando.value = true;
  subiendoFotos.value = fotos.value.length > 0;
  try {
    // 1. Subir cada foto y quedarse con las URLs
    const urls = [];
    for (const foto of fotos.value) {
      const { data } = await subirFoto(foto.archivo);
      urls.push(data.data.url);
    }

    // 2. Crear el reporte con las URLs
    const datos = {
      fecha: registro.value.fecha,
      gravedad: registro.value.gravedad,
      descripcion: registro.value.descripcion.trim(),
      fotos: urls,
    };
    if (registro.value.motoId) datos.motoId = registro.value.motoId;
    if (registro.value.equipo.trim()) datos.equipo = registro.value.equipo.trim();
    if (!auth.esGuia) datos.guiaId = registro.value.guiaId;

    const { data } = await crearReporteDanio(datos);
    const aviso = data.data?.motoEnMantenimiento
      ? ' Reporte guardado: la moto pasó a mantenimiento.'
      : '';
    exito((data.message || 'Reporte guardado correctamente') + aviso);
    dialogo.value = false;
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
    subiendoFotos.value = false;
  }
}

async function cambiarEstado(fila, estado) {
  if (estado === fila.estado) return;
  const confirmado = await confirmar({
    titulo: 'Cambiar estado',
    texto: `Marcar el reporte como "${etiquetaEstado(estado)}".`,
    confirmar: 'Cambiar',
  });
  if (!confirmado) return;

  try {
    const { data } = await cambiarEstadoReporte(fila._id, estado);
    exito(data.message || 'Estado actualizado');
    await cargar();
  } catch {
    await cargar();
  }
}

async function cargarCatalogos() {
  try {
    const [motosRespuesta] = await Promise.all([listarMotos({ page: 1, limit: 100 })]);
    motos.value = motosRespuesta.data.data.items || [];
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  }

  if (!auth.esGuia) {
    try {
      const { data } = await listarGuias({ page: 1, limit: 100 });
      guias.value = data.data.items || [];
    } catch {
      // Catálogo auxiliar
    }
  }
}

watch([filtroFecha, filtroEstado, filtroMoto], () => {
  pagina.value = 1;
  cargar();
});

onMounted(async () => {
  animarEntrada(paginaEl.value?.$el || paginaEl.value);
  await Promise.all([cargar(), cargarCatalogos()]);
});
</script>
