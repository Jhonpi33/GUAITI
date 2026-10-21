/**
 * Alertas de la aplicación con SweetAlert2, con el tema oscuro y los colores
 * de marca Gua-iti (verde acciones, naranja acentos, magenta detalles).
 * Reemplaza a $q.notify y $q.dialog en todo el panel.
 * Los estilos viven en src/css/app.css (clases .swal2-*).
 */
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const alerta = Swal.mixin({
  buttonsStyling: false,
  allowOutsideClick: true,
  confirmButtonText: 'Aceptar',
  customClass: {
    popup: 'alerta-guaiti',
    confirmButton: 'alerta-boton alerta-boton-confirmar',
    cancelButton: 'alerta-boton alerta-boton-cancelar',
  },
});

/** Confirmación con botón de acción y cancelación. Resuelve true/false. */
export function confirmar({ titulo, texto = '', confirmar = 'Confirmar', cancelar = 'Cancelar', icono = 'question' }) {
  return alerta
    .fire({
      icon: icono,
      title: titulo,
      text: texto,
      confirmButtonText: confirmar,
      cancelButtonText: cancelar,
      showCancelButton: true,
      reverseButtons: true,
    })
    .then((resultado) => Boolean(resultado.isConfirmed))
    .catch(() => false);
}

/** Mensaje de éxito (guardados, cambios de estado, etc.). */
export function exito(mensaje) {
  return alerta.fire({ icon: 'success', title: 'Listo', text: mensaje || 'Operación exitosa' });
}

/** Mensaje de error (cuando el aviso automático del interceptor no aplica). */
export function error(mensaje) {
  return alerta.fire({ icon: 'error', title: 'Ups, algo salió mal', text: mensaje || 'No fue posible completar la operación' });
}

/** Advertencia (permisos, datos a revisar). */
export function advertencia(mensaje) {
  return alerta.fire({ icon: 'warning', title: 'Atención', text: mensaje });
}

/** Información general. */
export function informacion(mensaje) {
  return alerta.fire({ icon: 'info', title: 'Información', text: mensaje });
}
