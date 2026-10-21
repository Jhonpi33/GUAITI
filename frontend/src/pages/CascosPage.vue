<template>
  <q-page ref="paginaEl" padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Cascos</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo casco" no-caps unelevated @click="abrirNuevo" />
    </div>

    <!-- Editor de rango: crea o recorta cascos numerados -->
    <q-card flat bordered class="tarjeta-tabla q-mb-md" data-anim>
      <q-card-section class="text-h6">Rango de cascos</q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-6 col-sm-3">
            <q-input v-model.number="rango.desde" outlined dense type="number" min="1" label="Desde" :rules="[reglas.enteroDesdeUno]" lazy-rules />
          </div>
          <div class="col-6 col-sm-3">
            <q-input v-model.number="rango.hasta" outlined dense type="number" min="1" label="Hasta" :rules="[reglas.enteroDesdeUno]" lazy-rules />
          </div>
          <div class="col-12 col-sm-4">
            <q-btn
              class="full-width"
              color="secondary"
              text-color="dark"
              unelevated
              no-caps
              icon="tune"
              label="Aplicar rango"
              :loading="guardandoRango"
              @click="aplicarRango"
            />
          </div>
        </div>
        <div class="text-caption texto-suave q-mt-sm">
          Crea o actualiza los cascos numerados de "desde" a "hasta". Si "hasta" es menor que
          "desde", se eliminan los cascos por encima (solo si están disponibles).
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="tarjeta-tabla q-mb-md" data-anim>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-input v-model="busqueda" outlined dense clearable label="Buscar casco por número" placeholder="Escriba un número...">
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
              clearable
              label="Estado"
              :options="opcionesEstado"
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
      no-data-label="No hay cascos registrados"
      loading-label="Cargando..."
    >
      <template #body-estado="props">
        <q-chip dense size="sm" class="chip-semaforo" :color="colorEstado(props.row.estado)" :text-color="textoEstado(props.row.estado)">
          {{ etiquetaEstado(props.row.estado) }}
        </q-chip>
      </template>

      <template #body-acciones="props">
        <div class="row items-center justify-center q-gutter-xs">
          <q-btn flat dense round icon="edit" color="primary" @click="abrirEdicion(props.row)">
            <q-tooltip>Editar estado</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            :disable="props.row.estado !== 'disponible'"
            @click="confirmarEliminar(props.row)"
          >
            <q-tooltip>Eliminar (solo si está disponible)</q-tooltip>
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
      texto-vacio="No hay cascos registrados"
    >
      <template #contenido="{ item }">
        <div class="row items-center">
          <div class="salida-titulo col">Casco {{ item.numero }}</div>
          <q-chip dense size="sm" class="chip-semaforo" :color="colorEstado(item.estado)" :text-color="textoEstado(item.estado)">
            {{ etiquetaEstado(item.estado) }}
          </q-chip>
        </div>
      </template>

      <template #acciones="{ item }">
        <q-btn dense no-caps unelevated color="primary" icon="edit" label="Editar" @click="abrirEdicion(item)" />
        <q-btn
          dense
          no-caps
          flat
          color="negative"
          icon="delete"
          label="Eliminar"
          :disable="item.estado !== 'disponible'"
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
      <q-card style="min-width: 320px; width: 420px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar casco' : 'Nuevo casco' }}</div>
        </q-card-section>

        <q-form class="q-gutter-y-md" @submit="guardar">
          <q-card-section class="q-pt-none">
            <q-input
              v-model.number="registro.numero"
              outlined
              dense
              type="number"
              min="1"
              label="Número"
              :disable="editando"
              :rules="[reglas.enteroDesdeUno]"
              lazy-rules
            />
            <q-select
              v-model="registro.estado"
              class="q-mt-md"
              outlined
              dense
              label="Estado"
              :options="opcionesEstado"
              emit-value
              map-options
              :rules="[reglas.obligatorio]"
              lazy-rules
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
import { ref, watch, onMounted } from 'vue';
import { useListado } from '../composables/useListado';
import { listarCascos, crearCasco, actualizarCasco, eliminarCasco, definirRangoCascos } from '../services/cascos';
import { confirmar, exito } from '../services/alertas';
import { animarEntrada } from '../utils/animaciones';
import { reglas } from '../utils/validaciones';
import ListadoTarjetas from '../components/ListadoTarjetas.vue';
import PaginacionListado from '../components/PaginacionListado.vue';

const paginaEl = ref(null);

const filtroEstado = ref('');

const { busqueda, items, total, pagina, paginas, cargando, cargar, irPagina } = useListado(
  (params) => listarCascos({ ...params, estado: filtroEstado.value || undefined }),
  { limite: 12 }
);

const opcionesEstado = [
  { label: 'Disponible', value: 'disponible' },
  { label: 'En uso', value: 'en_uso' },
  { label: 'Por lavar', value: 'por_lavar' },
  { label: 'Dañado', value: 'danado' },
  { label: 'Perdido', value: 'perdido' },
];

const etiquetas = {
  disponible: 'Disponible',
  en_uso: 'En uso',
  por_lavar: 'Por lavar',
  danado: 'Dañado',
  perdido: 'Perdido',
};

const colores = {
  disponible: 'positive',
  en_uso: 'accent',
  por_lavar: 'warning',
  danado: 'negative',
  perdido: 'grey-7',
};

function etiquetaEstado(estado) {
  return etiquetas[estado] || estado;
}

function colorEstado(estado) {
  return colores[estado] || 'grey';
}

function textoEstado(estado) {
  return estado === 'por_lavar' ? 'dark' : 'white';
}

const columnas = [
  { name: 'numero', label: 'Número', field: (f) => f.numero, align: 'center' },
  { name: 'estado', label: 'Estado', field: (f) => f.estado, align: 'left' },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' },
];

const rango = ref({ desde: 1, hasta: 60 });
const guardandoRango = ref(false);

async function aplicarRango() {
  const confirmado = await confirmar({
    titulo: 'Aplicar rango de cascos',
    texto: `Se crearán o recortarán los cascos del ${rango.value.desde} al ${rango.value.hasta}. ¿Continuar?`,
    confirmar: 'Aplicar',
  });
  if (!confirmado) return;

  guardandoRango.value = true;
  try {
    const { data } = await definirRangoCascos(Number(rango.value.desde), Number(rango.value.hasta));
    exito(data.message || 'Rango de cascos actualizado');
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    guardandoRango.value = false;
  }
}

const dialogo = ref(false);
const editando = ref(false);
const guardando = ref(false);
const registro = ref(vacio());

function vacio() {
  return { _id: null, numero: null, estado: 'disponible' };
}

function abrirNuevo() {
  registro.value = vacio();
  editando.value = false;
  dialogo.value = true;
}

function abrirEdicion(fila) {
  registro.value = { ...fila };
  editando.value = true;
  dialogo.value = true;
}

async function guardar() {
  guardando.value = true;
  try {
    let respuesta;
    if (editando.value) {
      respuesta = await actualizarCasco(registro.value._id, { estado: registro.value.estado });
    } else {
      respuesta = await crearCasco({
        numero: Number(registro.value.numero),
        estado: registro.value.estado,
      });
    }
    exito(respuesta.data.message || 'Casco guardado correctamente');
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
    titulo: 'Eliminar casco',
    texto: `¿Eliminar el casco ${fila.numero}?`,
    confirmar: 'Eliminar',
    cancelar: 'Volver',
  });
  if (!confirmado) return;

  try {
    const { data } = await eliminarCasco(fila._id);
    exito(data.message || 'Casco eliminado');
    await cargar();
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  }
}

watch(filtroEstado, () => {
  pagina.value = 1;
  cargar();
});

onMounted(async () => {
  animarEntrada(paginaEl.value?.$el || paginaEl.value);
  await cargar();
});
</script>
