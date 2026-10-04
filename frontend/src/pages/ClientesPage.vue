<template>
  <q-page padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Clientes</div>
      <q-space />
      <q-btn color="primary" icon="person_add" label="Nuevo" no-caps unelevated @click="abrirNuevo" />
    </div>

    <q-card flat bordered class="tarjeta-tabla q-mb-md">
      <q-card-section>
        <q-input
          v-model="busqueda"
          outlined
          dense
          clearable
          label="Buscar cliente por nombre o cédula"
          placeholder="Escriba un nombre o una cédula..."
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
      no-data-label="No hay clientes para mostrar"
      loading-label="Cargando..."
    >
      <template #body-acciones="props">
        <q-btn flat dense round icon="edit" color="primary" @click="abrirEdicion(props.row)">
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="delete" color="negative" @click="confirmarEliminacion(props.row)">
          <q-tooltip>Eliminar</q-tooltip>
        </q-btn>
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
          <div class="text-h6">{{ editando ? 'Editar cliente' : 'Nuevo cliente' }}</div>
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
              v-model="registro.cedula"
              outlined
              dense
              label="Cédula"
              inputmode="numeric"
              :rules="[reglas.cedula]"
              lazy-rules
              class="q-mt-md"
            />

            <q-input
              v-model="registro.telefono"
              outlined
              dense
              label="Teléfono"
              type="tel"
              placeholder="Opcional"
              class="q-mt-md"
            />

            <q-input
              v-model="registro.correo"
              outlined
              dense
              label="Correo"
              type="email"
              placeholder="Opcional"
              :rules="[reglas.correo]"
              lazy-rules
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
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useListado } from '../composables/useListado';
import { listarClientes, crearCliente, actualizarCliente, eliminarCliente } from '../services/clientes';
import { reglas } from '../utils/validaciones';

const $q = useQuasar();

const { busqueda, items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(listarClientes);

const columnas = [
  { name: 'nombre', label: 'Nombre', field: (fila) => fila.nombre, align: 'left' },
  { name: 'cedula', label: 'Cédula', field: (fila) => fila.cedula, align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: (fila) => fila.telefono || '—', align: 'left' },
  { name: 'correo', label: 'Correo', field: (fila) => fila.correo || '—', align: 'left' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const dialogo = ref(false);
const editando = ref(false);
const guardando = ref(false);
const registro = ref({});

function vacio() {
  return { _id: null, nombre: '', cedula: '', telefono: '', correo: '' };
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
      cedula: String(registro.value.cedula).trim(),
      telefono: (registro.value.telefono || '').trim(),
      correo: (registro.value.correo || '').trim(),
    };
    const respuesta = editando.value
      ? await actualizarCliente(registro.value._id, datos)
      : await crearCliente(datos);
    $q.notify({ type: 'positive', message: respuesta.data.message });
    dialogo.value = false;
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
  }
}

function confirmarEliminacion(fila) {
  $q.dialog({
    title: 'Eliminar cliente',
    message: `¿Eliminar el cliente ${fila.nombre}?`,
    cancel: 'Cancelar',
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await eliminarCliente(fila._id);
      $q.notify({ type: 'positive', message: data.message });
      await cargar();
    } catch {
      // El interceptor de services/api.js ya notificó el error en español
    }
  });
}

onMounted(cargar);
</script>
