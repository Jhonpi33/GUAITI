<template>
  <q-page ref="paginaEl" padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Gastos</div>
      <q-space />
      <q-btn color="primary" icon="add_shopping_cart" label="Registrar gasto" no-caps unelevated @click="abrirNuevo" />
    </div>

    <q-card flat bordered class="tarjeta-tabla q-mb-md" data-anim>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtroTipo"
              outlined
              dense
              clearable
              label="Tipo"
              :options="opcionesTipo"
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-input v-model="filtroDesde" outlined dense clearable type="date" label="Desde" />
          </div>
          <div class="col-12 col-sm-3">
            <q-input v-model="filtroHasta" outlined dense clearable type="date" label="Hasta" />
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
      no-data-label="No hay gastos registrados"
      loading-label="Cargando..."
    >
      <template #body-fecha="props">
        <span>{{ formatoFecha(props.row.fecha) }}</span>
      </template>

      <template #body-tipo="props">
        <q-chip dense size="sm" color="accent" text-color="white" class="chip-semaforo">
          {{ etiquetaTipo(props.row.tipo) }}
        </q-chip>
      </template>

      <template #body-valor="props">
        <span class="text-weight-bold">{{ formatoCop(props.row.valor) }}</span>
      </template>

      <template #body-foto="props">
        <q-icon
          v-if="props.row.fotoSoporte"
          name="photo"
          color="accent"
          size="sm"
          class="cursor-pointer"
          @click="abrirFoto(props.row.fotoSoporte)"
        >
          <q-tooltip>Ver soporte</q-tooltip>
        </q-icon>
        <span v-else class="text-caption texto-suave">Sin foto</span>
      </template>

      <template #body-acciones="props">
        <div class="row items-center justify-center q-gutter-xs">
          <q-btn
            v-if="!auth.esGuia"
            flat
            dense
            round
            icon="edit"
            color="primary"
            @click="abrirEdicion(props.row)"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            v-if="auth.esAdmin"
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click="confirmarEliminar(props.row)"
          >
            <q-tooltip>Eliminar</q-tooltip>
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

    <ListadoTarjetas
      v-else
      :items="items"
      :cargando="cargando"
      texto-vacio="No hay gastos registrados"
    >
      <template #contenido="{ item }">
        <div class="row items-center">
          <div class="salida-titulo col">{{ formatoCop(item.valor) }}</div>
          <q-chip dense size="sm" color="accent" text-color="white" class="chip-semaforo">
            {{ etiquetaTipo(item.tipo) }}
          </q-chip>
        </div>
        <div class="text-caption texto-suave q-mt-xs">
          {{ formatoFecha(item.fecha) }}<span v-if="item.registradoPor"> · {{ item.registradoPor.nombre }}</span>
        </div>
        <div v-if="item.descripcion" class="text-caption q-mt-xs">{{ item.descripcion }}</div>
        <div v-if="item.fotoSoporte" class="q-mt-xs">
          <q-icon name="photo" color="accent" size="sm" class="cursor-pointer" @click="abrirFoto(item.fotoSoporte)" />
        </div>
      </template>

      <template #acciones="{ item }">
        <q-btn
          v-if="!auth.esGuia"
          dense
          no-caps
          unelevated
          color="primary"
          icon="edit"
          label="Editar"
          @click="abrirEdicion(item)"
        />
        <q-btn
          v-if="auth.esAdmin"
          dense
          no-caps
          flat
          color="negative"
          icon="delete"
          label="Eliminar"
          @click="confirmarEliminar(item)"
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
      <q-card style="min-width: 340px; width: 500px; max-width: 96vw">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar gasto' : 'Registrar gasto' }}</div>
        </q-card-section>

        <q-form class="q-gutter-y-md" @submit="guardar">
          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="registro.fecha" outlined dense type="date" label="Fecha" :rules="[reglas.obligatorio]" lazy-rules />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="registro.tipo"
                  outlined
                  dense
                  label="Tipo"
                  :options="opcionesTipo"
                  emit-value
                  map-options
                  :rules="[reglas.obligatorio]"
                  lazy-rules
                />
              </div>
            </div>

            <q-input
              v-model.number="registro.valor"
              class="q-mt-md"
              outlined
              dense
              type="number"
              min="0"
              label="Valor (COP)"
              prefix="$"
              :rules="[reglas.precio]"
              lazy-rules
            />

            <q-input
              v-model="registro.descripcion"
              class="q-mt-md"
              outlined
              dense
              label="Descripción"
              placeholder="Ej. gasolina para las motos"
            />

            <div class="text-overline texto-suave q-mt-md">Foto de soporte (opcional)</div>
            <input ref="inputFoto" class="q-mt-xs" type="file" accept="image/*" capture="environment" @change="alElegirFoto" />

            <div v-if="foto" class="q-mt-sm">
              <img :src="foto.vistaPrevia" alt="Soporte del gasto" class="foto-miniatura" />
              <q-btn dense flat color="negative" icon="delete" size="sm" @click="quitarFoto">
                <q-tooltip>Quitar foto</q-tooltip>
              </q-btn>
            </div>
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
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarGastos, crearGasto, actualizarGasto, eliminarGasto } from '../services/gastos';
import { subirFoto } from '../services/uploads';
import { confirmar, exito } from '../services/alertas';
import { animarEntrada } from '../utils/animaciones';
import { reglas } from '../utils/validaciones';
import { formatoCop, formatoFecha, hoyISO } from '../utils/formato';
import ListadoTarjetas from '../components/ListadoTarjetas.vue';
import PaginacionListado from '../components/PaginacionListado.vue';

const auth = useAuthStore();
const paginaEl = ref(null);

const filtroTipo = ref('');
const filtroDesde = ref('');
const filtroHasta = ref('');

const { items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(
  (params) =>
    listarGastos({
      ...params,
      tipo: filtroTipo.value || undefined,
      fechaDesde: filtroDesde.value || undefined,
      fechaHasta: filtroHasta.value || undefined,
    }),
  { limite: 10 }
);

const opcionesTipo = [
  { label: 'Implementos', value: 'implementos' },
  { label: 'Baterías', value: 'baterias' },
  { label: 'Combustible', value: 'combustible' },
  { label: 'Repuestos', value: 'repuestos' },
  { label: 'Otros', value: 'otros' },
];

function etiquetaTipo(tipo) {
  return opcionesTipo.find((opcion) => opcion.value === tipo)?.label || tipo;
}

const columnas = [
  { name: 'fecha', label: 'Fecha', field: (f) => f.fecha, align: 'left' },
  { name: 'tipo', label: 'Tipo', field: (f) => f.tipo, align: 'left' },
  { name: 'valor', label: 'Valor', field: (f) => f.valor, align: 'right' },
  { name: 'descripcion', label: 'Descripción', field: (f) => f.descripcion || '—', align: 'left' },
  { name: 'foto', label: 'Soporte', field: (f) => f.fotoSoporte, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const dialogo = ref(false);
const editando = ref(false);
const guardando = ref(false);
const foto = ref(null);
const inputFoto = ref(null);

const registro = ref(vacio());

function vacio() {
  return { _id: null, fecha: hoyISO(), tipo: 'combustible', valor: null, descripcion: '' };
}

function abrirNuevo() {
  registro.value = vacio();
  editando.value = false;
  foto.value = null;
  if (inputFoto.value) inputFoto.value.value = '';
  dialogo.value = true;
}

function abrirEdicion(fila) {
  registro.value = {
    ...vacio(),
    ...fila,
    fecha: fila.fecha ? String(fila.fecha).slice(0, 10) : hoyISO(),
  };
  editando.value = true;
  foto.value = null;
  if (inputFoto.value) inputFoto.value.value = '';
  dialogo.value = true;
}

function alElegirFoto(evento) {
  const archivo = evento.target.files?.[0];
  if (!archivo) return;
  foto.value = { archivo, vistaPrevia: URL.createObjectURL(archivo) };
}

function quitarFoto() {
  if (foto.value) URL.revokeObjectURL(foto.value.vistaPrevia);
  foto.value = null;
  if (inputFoto.value) inputFoto.value.value = '';
}

function abrirFoto(url) {
  window.open(url, '_blank', 'noopener');
}

async function guardar() {
  guardando.value = true;
  try {
    let fotoSoporte = registro.value.fotoSoporte || '';
    if (foto.value) {
      const { data } = await subirFoto(foto.value.archivo);
      fotoSoporte = data.data.url;
    }

    const datos = {
      fecha: registro.value.fecha,
      tipo: registro.value.tipo,
      valor: Number(registro.value.valor),
      descripcion: (registro.value.descripcion || '').trim(),
      fotoSoporte,
    };

    let respuesta;
    if (editando.value) {
      respuesta = await actualizarGasto(registro.value._id, datos);
    } else {
      respuesta = await crearGasto(datos);
    }
    exito(respuesta.data.message || 'Gasto guardado correctamente');
    dialogo.value = false;
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
  }
}

async function confirmarEliminar(fila) {
  const confirmado = await confirmar({
    titulo: 'Eliminar gasto',
    texto: `¿Eliminar el gasto de ${formatoCop(fila.valor)} (${etiquetaTipo(fila.tipo)})?`,
    confirmar: 'Eliminar',
    cancelar: 'Volver',
  });
  if (!confirmado) return;

  try {
    const { data } = await eliminarGasto(fila._id);
    exito(data.message || 'Gasto eliminado');
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  }
}

watch([filtroTipo, filtroDesde, filtroHasta], () => {
  pagina.value = 1;
  cargar();
});

onMounted(async () => {
  animarEntrada(paginaEl.value?.$el || paginaEl.value);
  await cargar();
});
</script>
