<template>
  <q-page padding class="pagina-listado q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Inicio</div>
      <q-space />
      <q-btn flat dense icon="refresh" label="Actualizar" no-caps @click="cargar" :disable="cargando" />
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="tarjeta in tarjetas" :key="tarjeta.titulo" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="tarjeta-tabla">
          <q-card-section>
            <div class="text-overline text-grey-5">{{ tarjeta.titulo }}</div>
            <div class="text-h4 text-primary">
              <q-spinner v-if="cargando" size="1.6rem" />
              <template v-else>{{ tarjeta.valor }}</template>
            </div>
            <div class="text-caption text-grey-6">{{ tarjeta.detalle }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="tarjeta-tabla q-mt-lg">
      <q-card-section class="text-h6"> Actividades </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div
            v-for="actividad in actividades"
            :key="actividad._id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat bordered class="tarjeta-tabla detalle-activo full-height">
              <q-card-section>
                <div class="row items-center">
                  <div class="text-subtitle1 text-weight-medium col">{{ actividad.nombre }}</div>
                  <q-chip
                    dense
                    size="sm"
                    :color="actividad.activa ? 'positive' : 'negative'"
                    text-color="white"
                  >
                    {{ actividad.activa ? 'Activa' : 'Inactiva' }}
                  </q-chip>
                </div>
                <div class="text-h6 text-secondary q-mt-sm">
                  {{ formatoCop(actividad.precioPorPersona) }}
                </div>
                <div class="text-caption text-grey-5">Precio por persona</div>
                <div class="text-caption text-grey-5 q-mt-xs">
                  Duración: {{ formatoDuracion(actividad.duracionMin) }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div v-if="!actividades.length && !cargando" class="col-12 text-grey-5">
            No hay actividades registradas.
          </div>
        </div>
      </q-card-section>

      <q-inner-loading :showing="cargando">
        <q-spinner color="primary" size="2.2rem" />
      </q-inner-loading>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { listarGuias } from '../services/guias';
import { listarClientes } from '../services/clientes';
import { listarMotos } from '../services/motos';
import { listarActividades } from '../services/actividades';
import { formatoCop, formatoDuracion } from '../utils/formato';

const auth = useAuthStore();

const cargando = ref(false);
const totalGuias = ref(0);
const totalClientes = ref(0);
const totalMotosDisponibles = ref(0);
const totalActividadesActivas = ref(0);
const actividades = ref([]);

// Guías y clientes solo los ve admin/secretario (el backend restringe el acceso)
const veEquipo = computed(() => auth.esAdmin || auth.esSecretario);

const tarjetas = computed(() => {
  const lista = [
    {
      titulo: 'Motos disponibles',
      valor: totalMotosDisponibles.value,
      detalle: 'Cuatrimotos listas para salir',
    },
    {
      titulo: 'Actividades activas',
      valor: totalActividadesActivas.value,
      detalle: 'Publicadas en el sistema',
    },
  ];
  if (veEquipo.value) {
    lista.unshift(
      { titulo: 'Guías', valor: totalGuias.value, detalle: 'Registrados en el sistema' },
      { titulo: 'Clientes', valor: totalClientes.value, detalle: 'Fichas guardadas' }
    );
  }
  return lista;
});

async function cargar() {
  cargando.value = true;
  try {
    const solicitudes = [
      listarMotos({ estado: 'disponible', page: 1, limit: 1 }).then(({ data }) => {
        totalMotosDisponibles.value = data.data.total;
      }),
      listarActividades({ soloActivas: 'true', page: 1, limit: 1 }).then(({ data }) => {
        totalActividadesActivas.value = data.data.total;
      }),
      listarActividades({ page: 1, limit: 50 }).then(({ data }) => {
        actividades.value = data.data.items;
      }),
    ];

    if (veEquipo.value) {
      solicitudes.push(
        listarGuias({ page: 1, limit: 1 }).then(({ data }) => {
          totalGuias.value = data.data.total;
        }),
        listarClientes({ page: 1, limit: 1 }).then(({ data }) => {
          totalClientes.value = data.data.total;
        })
      );
    }

    await Promise.all(solicitudes);
  } catch {
    // El interceptor de services/api.js ya notificó el error en español
  } finally {
    cargando.value = false;
  }
}

onMounted(cargar);
</script>
