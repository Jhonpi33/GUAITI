<template>
  <div class="column q-gutter-sm">
    <q-card
      v-for="item in items"
      :key="item._id"
      flat
      bordered
      class="tarjeta-tabla"
      data-fila
    >
      <q-card-section class="q-pa-sm">
        <slot name="contenido" :item="item" />
      </q-card-section>

      <q-card-actions v-if="hayAcciones" align="right" class="q-px-sm q-pb-sm">
        <slot name="acciones" :item="item" />
      </q-card-actions>
    </q-card>

    <div v-if="!items.length && !cargando" class="tarjeta-tabla q-pa-md text-center texto-suave">
      {{ textoVacio }}
    </div>

    <q-inner-loading :showing="cargando">
      <q-spinner color="primary" size="2rem" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { useSlots } from 'vue';

defineProps({
  items: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
  textoVacio: { type: String, default: 'No hay registros para mostrar' },
});

const slots = useSlots();
const hayAcciones = Boolean(slots.acciones);
</script>
