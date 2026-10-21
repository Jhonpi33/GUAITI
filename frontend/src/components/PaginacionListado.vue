<template>
  <div class="row items-center full-width tabla-inferior">
    <span class="text-caption">Página {{ pagina }} de {{ paginas }} — {{ total }} registros</span>
    <q-space />
    <q-btn
      flat
      dense
      icon="chevron_left"
      label="Anterior"
      :disable="cargando || pagina <= 1"
      @click="$emit('cambiar', pagina - 1)"
    />
    <q-btn
      flat
      dense
      label="Siguiente"
      icon-right="chevron_right"
      :disable="cargando || pagina >= paginas"
      @click="$emit('cambiar', pagina + 1)"
    />
  </div>
</template>

<script setup>
defineProps({
  pagina: { type: Number, required: true },
  paginas: { type: Number, required: true },
  total: { type: Number, required: true },
  cargando: { type: Boolean, default: false },
});

defineEmits(['cambiar']);
</script>
