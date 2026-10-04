<template>
  <q-page padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Guías</div>
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
          label="Buscar guía por nombre"
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
      no-data-label="No hay guías para mostrar"
      loading-label="Cargando..."
    >
      <template #body-usuario="props">
        <span>{{ props.row.usuarioId?.correo || '—' }}</span>
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
          icon="person_off"
          color="negative"
          :disable="!props.row.activo"
          @click="confirmarDesactivar(props.row)"
        >
          <q-tooltip>Desactivar</q-tooltip>
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
          <div class="text-h6">{{ editando ? 'Editar guía' : 'Nuevo guía' }}</div>
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
              v-model="registro.telefono"
              outlined
              dense
              label="Teléfono"
              type="tel"
              placeholder="Opcional"
              class="q-mt-md"
            />

            <template v-if="!editando">
              <q-toggle
                v-model="registro.crearUsuario"
                label="Crear usuario con rol guía"
                color="primary"
                class="q-mt-sm"
              />

              <template v-if="registro.crearUsuario">
                <q-input
                  v-model="registro.correo"
                  outlined
                  dense
                  label="Correo de acceso"
                  type="email"
                  :rules="[reglas.correoObligatorio]"
                  lazy-rules
                  class="q-mt-sm"
                />
                <q-input
                  v-model="registro.password"
                  outlined
                  dense
                  label="Contraseña"
                  type="password"
                  :rules="[reglas.passwordObligatorio]"
                  lazy-rules
                  class="q-mt-md"
                />
              </template>
            </template>

            <q-toggle
              v-else
              v-model="registro.activo"
              label="Guía activo"
              color="primary"
              class="q-mt-sm"
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
import { listarGuias, crearGuia, actualizarGuia, desactivarGuia } from '../services/guias';
import { reglas } from '../utils/validaciones';

const $q = useQuasar();

const { busqueda, items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(listarGuias);

const columnas = [
  { name: 'nombre', label: 'Nombre', field: (fila) => fila.nombre, align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: (fila) => fila.telefono || '—', align: 'left' },
  { name: 'usuario', label: 'Usuario vinculado', field: (fila) => fila.usuarioId, align: 'left' },
  { name: 'estado', label: 'Estado', field: (fila) => fila.activo, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const dialogo = ref(false);
const editando = ref(false);
const guardando = ref(false);
const registro = ref({});

/*
 * El backend exige correo y password en POST /guias incluso cuando crearUsuario
 * es false (en ese caso los ignora). Estos valores no se guardan en ningún lado;
 * solo evitan que el esquema de validación del backend rechace la petición.
 */
const CORREO_SIN_USUARIO = 'sin-usuario@guaiti.local';
const PASSWORD_SIN_USUARIO = 'sin-usuario';

function vacio() {
  return {
    _id: null,
    nombre: '',
    telefono: '',
    activo: true,
    crearUsuario: false,
    correo: '',
    password: '',
  };
}

function abrirNuevo() {
  registro.value = vacio();
  editando.value = false;
  dialogo.value = true;
}

function abrirEdicion(fila) {
  registro.value = { ...vacio(), ...fila, crearUsuario: false };
  editando.value = true;
  dialogo.value = true;
}

async function guardar() {
  guardando.value = true;
  try {
    let respuesta;
    if (editando.value) {
      respuesta = await actualizarGuia(registro.value._id, {
        nombre: registro.value.nombre.trim(),
        telefono: (registro.value.telefono || '').trim(),
        activo: registro.value.activo,
      });
    } else {
      const conUsuario = registro.value.crearUsuario;
      respuesta = await crearGuia({
        nombre: registro.value.nombre.trim(),
        telefono: (registro.value.telefono || '').trim(),
        crearUsuario: conUsuario,
        correo: conUsuario ? registro.value.correo.trim() : CORREO_SIN_USUARIO,
        password: conUsuario ? registro.value.password : PASSWORD_SIN_USUARIO,
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

function confirmarDesactivar(fila) {
  $q.dialog({
    title: 'Desactivar guía',
    message: `¿Desactivar el guía ${fila.nombre}?`,
    cancel: 'Cancelar',
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await desactivarGuia(fila._id);
      $q.notify({ type: 'positive', message: data.message });
      await cargar();
    } catch {
      // El interceptor de services/api.js ya notificó el error en español
    }
  });
}

onMounted(cargar);
</script>
