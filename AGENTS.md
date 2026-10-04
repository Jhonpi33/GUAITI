# Proyecto: Gua-iti Aventura Sin Límites
Plataforma web pública (venta/reservas) + sistema interno con roles para una empresa de turismo de aventura en San Gil, Santander, Colombia (cuevas y cuatrimotos).

## Stack
- Backend: Node.js + Express + Mongoose + MongoDB Atlas, JavaScript (ES modules), API REST en /api/v1
- Frontend: Vue 3 + Quasar (Vite) + Vue Router + Pinia, JavaScript
- Auth: JWT + bcrypt. Roles: admin, secretario, guia
- Validación backend: Joi o Zod. Pruebas: Vitest o Jest

## Reglas obligatorias
1. Todo el texto de la interfaz y los mensajes de error van en español.
2. NINGÚN precio, tarifa o límite va quemado en el código. Todo vive en la base de datos y se edita desde el panel (colecciones actividades, tarifasPagoGuia, parametros).
3. Los permisos se validan en el backend con middleware de roles, no solo ocultando botones.
4. Las contraseñas se guardan con bcrypt. Los secretos van en .env (nunca en el código).
5. Un controlador por recurso; la lógica de negocio va en /services, no en los controladores.
6. Listados paginados. Respuestas JSON con formato { ok, data, message }.
7. Guarda quién creó o modificó cada registro (createdBy, updatedBy) y usa timestamps.
8. No instales librerías nuevas sin decirme cuál y por qué.
9. Después de cada tarea, dime qué archivos creaste y cómo probarlo.

## Negocio (resumen)
- Actividades: Cueva de la Vaca ($50.000 por persona), Cueva del Yeso ($80.000 por persona), cuatrimotos de 1 y 2 horas (precio editable). Más actividades a futuro.
- 9 cuatrimotos con nombre propio; cada moto lleva máximo 2 personas.
- Pago al guía en cuevas (por persona): 1 persona $10.000; 2 o más personas $7.000 por persona.
- Pago al guía en cuatrimotos (por moto): 1 moto $10.000; 2 o más motos $8.000 por moto. Máximo 4 motos por guía (excepción autorizable). Desde 5 motos salen dos guías y el total se reparte por mitades.
- El guía decide qué motos y cascos de cueva (numerados 1 a 60) salen en su salida.
- Documento completo: REQUERIMIENTOS_GUAITI.md
