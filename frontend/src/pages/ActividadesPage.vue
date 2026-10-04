<template>
  <q-page padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Actividades</div>
      <q-space />
      <q-btn
        v-if="puedeEditar"
        color="primary"
        icon="add"
        label="Nueva"
        no-caps
        unelevated
        @click="abrirNuevo"
      />
    </div>

    <q-card flat bordered class="tarjeta-tabla q-mb-md">
      <q-card-section>
        <q-input
          v-model="busqueda"
          outlined
          dense
          clearable
          label="Buscar actividad por nombre"
          placeholder="Escriba un nombre..."
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
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
      no-data-label="No hay actividades para mostrar"
      loading-label="Cargando..."
    >
      <template #body-precio="props">
        <span class="text-secondary text-weight-medium">
          {{ formatoCop(props.row.precioPorPersona) }}
        </span>
      </template>

      <template #body-recurso="props">
        <q-chip dense size="sm" color="accent" text-color="white">
          {{ props.row.tipoRecurso === 'moto' ? 'Moto' : 'Cupo' }}
        </q-chip>
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
        <template v-if="puedeEditar">
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
      <q-card style="min-width: 340px; width: 520px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar actividad' : 'Nueva actividad' }}</div>
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

            <q-input
              v-model="registro.descripcion"
              outlined
              dense
              type="textarea"
              label="Descripción"
              placeholder="Opcional"
              class="q-mt-md"
            />

            <div class="row q-col-gutter-md q-mt-xs">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="registro.precioPorPersona"
                  outlined
                  dense
                  type="number"
                  min="0"
                  step="any"
                  label="Precio por persona"
                  :rules="[reglas.precio]"
                  lazy-rules
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="registro.duracionMin"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Duración (minutos)"
                  :rules="[reglas.enteroDesdeCero]"
                  lazy-rules
                />
              </div>
            </div>

            <q-select
              v-model="registro.tipoRecurso"
              outlined
              dense
              label="Tipo de recurso"
              :options="opcionesRecurso"
              emit-value
              map-options
              :rules="[reglas.obligatorio]"
              lazy-rules
              class="q-mt-xs"
            />

            <q-toggle v-model="registro.activa" label="Actividad activa" color="primary" />
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
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarActividades, crearActividad, actualizarActividad } from '../services/actividades';
import { reglas } from '../utils/validaciones';
import { formatoCop } from '../utils/formato';

const $q = useQuasar();
const auth = useAuthStore();

// Solo el administrador crea o edita actividades (el backend también lo exige)
const puedeEditar = computed(() => auth.esAdmin);

const { busqueda, items, total, pagina, paginas, cargando, cargar, irPagina } =
  useListado(listarActividades);

const columnas = [
  { name: 'nombre', label: 'Nombre', field: (fila) => fila.nombre, align: 'left' },
  { name: 'precio', label: 'Precio por persona', field: (fila) => fila.precioPorPersona, align: 'right' },
  { name: 'recurso', label: 'Tipo de recurso', field: (fila) => fila.tipoRecurso, align: 'center' },
  { name: 'duracion', label: 'Duración (min)', field: (fila) => fila.duracionMin, align: 'center' },
  { name: 'estado', label: 'Estado', field: (fila) => fila.activa, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const opcionesRecurso = [
  { label: 'Cupo (por persona)', value: 'cupo' },
  { label: 'Moto (por cuatrimoto)', value: 'moto' },
];

const dialogo = ref(false);
const editando = ref(false);
const guardando = ref(false);
const registro = ref({});

function vacio() {
  return {
    _id: null,
    nombre: '',
    descripcion: '',
    precioPorPersona: '',
    duracionMin: '',
    tipoRecurso: 'cupo',
    activa: true,
  };
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
      descripcion: (registro.value.descripcion || '').trim(),
      precioPorPersona: Number(registro.value.precioPorPersona),
      duracionMin:
        registro.value.duracionMin === '' || registro.value.duracionMin === null
          ? null
          : Number(registro.value.duracionMin),
      tipoRecurso: registro.value.tipoRecurso,
      activa: registro.value.activa,
    };
    const respuesta = editando.value
      ? await actualizarActividad(registro.value._id, datos)
      : await crearActividad(datos);
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
