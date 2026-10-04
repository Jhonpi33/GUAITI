<template>
  <q-page padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Usuarios</div>
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
          label="Buscar usuario por nombre o correo"
          placeholder="Escriba un nombre o correo..."
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
      no-data-label="No hay usuarios para mostrar"
      loading-label="Cargando..."
    >
      <template #body-rol="props">
        <q-chip dense size="sm" color="accent" text-color="white">
          {{ etiquetaRol(props.row.rol) }}
        </q-chip>
      </template>

      <template #body-estado="props">
        <q-chip
          dense
          size="sm"
          :color="props.row.activo ? 'positive' : 'negative'"
          text-color="white"
        >
          {{ props.row.activo ? 'Activo' : 'Inactivo' }}
        </q-chip>
      </template>

      <template #body-acciones="props">
        <q-btn flat dense round icon="edit" color="primary" @click="abrirEdicion(props.row)">
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          :icon="props.row.activo ? 'person_off' : 'person'"
          :color="props.row.activo ? 'negative' : 'positive'"
          :disable="props.row._id === (auth.usuario?.id || auth.usuario?._id)"
          @click="cambiarActivo(props.row)"
        >
          <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
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
      <q-card style="min-width: 340px; width: 480px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar usuario' : 'Nuevo usuario' }}</div>
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
              v-model="registro.correo"
              outlined
              dense
              label="Correo"
              type="email"
              :rules="[reglas.correoObligatorio]"
              lazy-rules
              class="q-mt-md"
            />

            <q-input
              v-model="registro.password"
              outlined
              dense
              :label="editando ? 'Nueva contraseña (vacía para mantener la actual)' : 'Contraseña'"
              type="password"
              :rules="editando ? [reglas.password] : [reglas.passwordObligatorio]"
              lazy-rules
              class="q-mt-md"
            />

            <q-select
              v-model="registro.rol"
              outlined
              dense
              label="Rol"
              :options="opcionesRol"
              emit-value
              map-options
              :rules="[reglas.obligatorio]"
              lazy-rules
              class="q-mt-md"
            />

            <q-toggle v-if="editando" v-model="registro.activo" label="Usuario activo" color="primary" />
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
import { useAuthStore } from '../stores/auth';
import { useListado } from '../composables/useListado';
import { listarUsuarios, crearUsuario, actualizarUsuario, cambiarActivoUsuario } from '../services/usuarios';
import { reglas } from '../utils/validaciones';

const $q = useQuasar();
const auth = useAuthStore();

const { busqueda, items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(listarUsuarios);

const opcionesRol = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Secretaria(o)', value: 'secretario' },
  { label: 'Guía', value: 'guia' },
];

function etiquetaRol(rol) {
  const opcion = opcionesRol.find((item) => item.value === rol);
  return opcion ? opcion.label : rol;
}

const columnas = [
  { name: 'nombre', label: 'Nombre', field: (fila) => fila.nombre, align: 'left' },
  { name: 'correo', label: 'Correo', field: (fila) => fila.correo, align: 'left' },
  { name: 'rol', label: 'Rol', field: (fila) => fila.rol, align: 'center' },
  { name: 'estado', label: 'Estado', field: (fila) => fila.activo, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const dialogo = ref(false);
const editando = ref(false);
const guardando = ref(false);
const registro = ref({});

function vacio() {
  return { _id: null, nombre: '', correo: '', password: '', rol: 'guia', activo: true };
}

function abrirNuevo() {
  registro.value = vacio();
  editando.value = false;
  dialogo.value = true;
}

function abrirEdicion(fila) {
  registro.value = { ...vacio(), ...fila, password: '' };
  editando.value = true;
  dialogo.value = true;
}

async function guardar() {
  guardando.value = true;
  try {
    let respuesta;
    if (editando.value) {
      const datos = {
        nombre: registro.value.nombre.trim(),
        correo: registro.value.correo.trim(),
        rol: registro.value.rol,
        activo: registro.value.activo,
      };
      if (registro.value.password) datos.password = registro.value.password;
      respuesta = await actualizarUsuario(registro.value._id, datos);
    } else {
      respuesta = await crearUsuario({
        nombre: registro.value.nombre.trim(),
        correo: registro.value.correo.trim(),
        password: registro.value.password,
        rol: registro.value.rol,
      });
    }
    $q.notify({ type: 'positive', message: respuesta.data.message });
    dialogo.value = false;
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardando.value = false;
  }
}

function cambiarActivo(fila) {
  $q.dialog({
    title: fila.activo ? 'Desactivar usuario' : 'Activar usuario',
    message: `¿${fila.activo ? 'Desactivar' : 'Activar'} el usuario ${fila.nombre}?`,
    cancel: 'Cancelar',
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await cambiarActivoUsuario(fila._id, !fila.activo);
      $q.notify({ type: 'positive', message: data.message });
      await cargar();
    } catch {
      // El interceptor de services/api.js ya notificó el error en español
    }
  });
}

onMounted(cargar);
</script>
