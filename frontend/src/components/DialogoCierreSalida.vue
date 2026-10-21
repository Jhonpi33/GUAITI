<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="cerrar">
    <q-card style="min-width: 340px; width: 520px; max-width: 96vw">
      <q-card-section>
        <div class="text-h6">Cerrar salida</div>
      </q-card-section>

      <q-form class="q-gutter-y-md" @submit="guardar">
        <q-card-section class="q-pt-none">
          <div class="text-caption texto-suave">
            Marque el estado final de cada casco. Los no marcados quedan como
            "Disponible".
          </div>

          <q-list class="q-mt-sm">
            <q-item v-for="casco in cascos" :key="casco._id" class="q-px-none">
              <q-item-section>
                <div class="text-weight-medium">Casco {{ casco.numero }}</div>
              </q-item-section>
              <q-item-section side>
                <q-select
                  v-model="estados[casco._id]"
                  :options="opciones"
                  emit-value
                  map-options
                  dense
                  outlined
                  style="min-width: 170px"
                  :label="`Estado casco ${casco.numero}`"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="!cascos.length" class="q-px-none">
              <q-item-section class="texto-suave">
                Esta salida no tiene cascos (actividad de motos).
              </q-item-section>
            </q-item>
          </q-list>

          <q-input
            v-model="novedades"
            outlined
            dense
            type="textarea"
            label="Novedades (opcional)"
            placeholder="Rayones, atrasos, novedades varias..."
            class="q-mt-sm"
          />

          <q-banner v-if="errorFormulario" class="bg-negative text-white q-mt-md" dense rounded>
            {{ errorFormulario }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat type="button" label="Cancelar" no-caps v-close-popup :disable="guardando" />
          <q-btn
            color="primary"
            type="submit"
            label="Cerrar salida"
            no-caps
            unelevated
            icon="flag"
            :loading="guardando"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { cambiarEstadoSalida } from '../services/salidas';
import { mensajeDeError } from '../services/api';
import { confirmar, exito } from '../services/alertas';

const props = defineProps({ modelValue: { type: Boolean, default: false }, salida: { type: Object, default: null } });
const emit = defineEmits(['update:modelValue', 'cerrada']);

const opciones = [
  { label: 'Disponible', value: 'disponible' },
  { label: 'Por lavar', value: 'por_lavar' },
  { label: 'Dañado', value: 'danado' },
  { label: 'Perdido', value: 'perdido' },
];

const estados = ref({});
const novedades = ref('');
const guardando = ref(false);
const errorFormulario = ref('');

const cascos = ref([]);

watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) return;
    cascos.value = props.salida?.cascos || [];
    estados.value = Object.fromEntries(cascos.value.map((casco) => [casco._id, 'disponible']));
    novedades.value = props.salida?.novedades || '';
    errorFormulario.value = '';
  }
);

function cerrar(valor) {
  if (guardando.value) return;
  emit('update:modelValue', valor);
}

async function guardar() {
  const confirmado = await confirmar({
    titulo: 'Cerrar salida',
    texto: '¿Confirmar el cierre de la salida? Los cascos y motos quedarán liberados.',
    confirmar: 'Cerrar salida',
  });
  if (!confirmado) return;

  guardando.value = true;
  errorFormulario.value = '';
  try {
    const datos = {
      estado: 'cerrada',
      novedades: novedades.value.trim(),
      cascosEstado: cascos.value.map((casco) => ({
        cascoId: casco._id,
        estado: estados.value[casco._id] || 'disponible',
      })),
    };
    const { data } = await cambiarEstadoSalida(props.salida._id, datos);
    exito(data.message || 'Salida cerrada correctamente');
    emit('update:modelValue', false);
    emit('cerrada');
  } catch (e) {
    errorFormulario.value = mensajeDeError(e);
  } finally {
    guardando.value = false;
  }
}
</script>
