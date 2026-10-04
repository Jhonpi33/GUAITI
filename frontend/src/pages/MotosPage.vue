<template>
  <q-page padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Motos</div>
      <q-space />
      <q-btn
        v-if="puedeEscribir"
        color="primary"
        icon="add"
        label="Nueva"
        no-caps
        unelevated
        @click="abrirNuevo"
      />
    </div>

    <q-card flat bordered class="tarjeta-tabla q-mb-md">
      <q-card-section class="row q-col-gutter-md items-end">
        <div class="col-12 col-sm-6">
          <q-input
            v-model="busqueda"
            outlined
            dense
            clearable
            label="Buscar moto por nombre"
            placeholder="Escriba un nombre..."
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-4">
          <q-select
            v-model="filtroEstado"
            outlined
            dense
            label="Estado"
            :options="opcionesEstado"
            emit-value
            map-options
            clearable
          />
        </div>
      </q-card-section>
    </q-card>

    <q-table
      flat
      bordered
      class="tarjeta-tabla"
      row-key="_id"
      :rows="items"
      :columns="columnas"
      :loading="cargando"
      :pagination="{ page: 1, rowsPerPage: 0 }"
      no-data-label="No hay motos para mostrar"
      loading-label="Cargando..."
    >
      <template #body-estado="props">
        <q-chip
          dense
          size="sm"
          class="chip-semaforo"
          :color="colorEstado(props.row.estado)"
          :text-color="props.row.estado === 'mantenimiento' ? 'dark' : 'white'"
        >
          {{ etiquetaEstado(props.row.estado) }}
        </q-chip>
      </template>

      <template #body-notas="props">
        <span>{{ props.row.notas || '—' }}</span>
      </template>

      <template #body-acciones="props">
        <template v-if="puedeEscribir">
          <q-btn flat dense round icon="edit" color="primary" @click="abrirEdicion(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
        </template>
        <span v-else class="text-grey-6">—</span>
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

    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 340px; width: 460px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar moto' : 'Nueva moto' }}</div>
        </q-card-section>

        <q-form class="q-gutter-y-md" @submit="guardar">
          <q-card-section class="q-pt-none">
            <q-input
              v-model="registro.nombre"
              outlined
              dense
              label="Nombre"
              :rules="[reglas.nombre]"
              lazy-rules
            />

            <q-select
              v-model="registro.estado"
              outlined
              dense
              label="Estado"
              :options="opcionesEstado"
              emit-value
              map-options
              :rules="[reglas.obligatorio]"
              lazy-rules
              class="q-mt-md"
            />

            <q-input
              v-model="registro.notas"
              outlined
              dense
              type="textarea"
              label="Notas"
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
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarMotos, crearMoto, actualizarMoto } from '../services/motos';
import { reglas } from '../utils/validaciones';

const $q = useQuasar();
const auth = useAuthStore();

// Solo admin y secretario crean o modifican motos (el backend también lo exige)
const puedeEscribir = computed(() => auth.esAdmin || auth.esSecretario);

const { busqueda, items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(
  (params) => listarMotos({ ...params, estado: filtroEstado.value || '' })
);

const filtroEstado = ref(null);

watch(filtroEstado, () => {
  pagina.value = 1;
  cargar();
});

const opcionesEstado = [
  { label: 'Disponible', value: 'disponible' },
  { label: 'Mantenimiento', value: 'mantenimiento' },
  { label: 'Fuera de servicio', value: 'fuera_de_servicio' },
];

const colores = {
  disponible: 'positive',
  mantenimiento: 'warning',
  fuera_de_servicio: 'negative',
};

function colorEstado(estado) {
  return colores[estado] || 'grey';
}

function etiquetaEstado(estado) {
  const opcion = opcionesEstado.find((item) => item.value === estado);
  return opcion ? opcion.label : estado;
}

const columnas = [
  { name: 'nombre', label: 'Nombre', field: (fila) => fila.nombre, align: 'left' },
  { name: 'estado', label: 'Estado', field: (fila) => fila.estado, align: 'center' },
  { name: 'notas', label: 'Notas', field: (fila) => fila.notas, align: 'left' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const dialogo = ref(false);
const editando = ref(false);
const guardando = ref(false);
const registro = ref({});

function vacio() {
  return { _id: null, nombre: '', estado: 'disponible', notas: '' };
}

function abrirNuevo() {
  registro.value = vacio();
  editando.value = false;
  dialogo.value = true;
}

function abrirEdicion(fila) {
  registro.value = { ...vacio(), ...fila };
  editando.value = true;
  dialogo.value = true;
}

async function guardar() {
  guardando.value = true;
  try {
    const datos = {
      nombre: registro.value.nombre.trim(),
      estado: registro.value.estado,
      notas: (registro.value.notas || '').trim(),
    };
    const respuesta = editando.value
      ? await actualizarMoto(registro.value._id, datos)
      : await crearMoto(datos);
    $q.notify({ type: 'positive', message: respuesta.data.message });
    dialogo.value = false;
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
  }
}

onMounted(cargar);
</script>
