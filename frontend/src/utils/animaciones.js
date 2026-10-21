/**
 * Animaciones de entrada con GSAP. Siempre cortas (máx. ~0.4 s) para que no
 * retracen el trabajo del panel. Se respetan las preferencias de movimiento
 * reducido del sistema operativo.
 */
import gsap from 'gsap';

const DURACION = 0.35;
const SALTO = 16;

function movimientoReducido() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function aElementos(objetivo) {
  if (!objetivo) return [];
  if (Array.isArray(objetivo)) return objetivo;
  if (typeof objetivo.length === 'number' && typeof objetivo.item === 'function') return Array.from(objetivo);
  if (objetivo.nodeType === 1) {
    // Dentro del contenedor se animan los elementos con [data-anim] o, si no hay, el propio nodo
    const internos = objetivo.querySelectorAll('[data-anim]');
    return internos.length ? Array.from(internos) : [objetivo];
  }
  return [];
}

/**
 * Entrada general: opacidad de 0 a 1 con desplazamiento vertical de 16 px.
 * @param {Element|NodeList|Array} objetivo nodo contenedor o lista de nodos.
 */
export function animarEntrada(objetivo) {
  const elementos = aElementos(objetivo);
  if (!elementos.length || movimientoReducido()) return null;
  return gsap.fromTo(
    elementos,
    { autoAlpha: 0, y: SALTO },
    { autoAlpha: 1, y: 0, duration: DURACION, stagger: 0.06, ease: 'power2.out', overwrite: true }
  );
}

/**
 * Entrada de listados: anima las filas de una tabla (tbody tr) o, si no hay
 * tabla, las tarjetas con [data-fila].
 * @param {Element} contenedor nodo que contiene filas o tarjetas.
 */
export function animarTabla(contenedor) {
  if (!contenedor || movimientoReducido()) return null;
  let filas = Array.from(contenedor.querySelectorAll('tbody tr'));
  if (!filas.length) filas = Array.from(contenedor.querySelectorAll('[data-fila]'));
  if (!filas.length) return null;
  return gsap.fromTo(
    filas,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power1.out', overwrite: true }
  );
}
