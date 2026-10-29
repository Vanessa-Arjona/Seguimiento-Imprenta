# Seguimiento Imprenta

Demostración de seguimiento de encargos para una imprenta digital que trabaja con empresas. Tiene dos partes:

- **Panel de la imprenta** (`/`): para el personal de la imprenta.
- **Consulta del cliente** (`/e/<código>`): página que abre el cliente con su enlace, sin registrarse.

> **Demostración:** los datos se guardan únicamente en este navegador; los enlaces y los avisos son simulados. No usar con datos reales.

## Guía de uso

1. Abra el **Panel de la imprenta**. La primera vez aparecen cuatro encargos de ejemplo ficticios (dominios `.example`, teléfonos marcados como «ficticio»).
2. **Crear un encargo:** pulse «+ Nuevo encargo», complete empresa, producto, cantidad, fecha prevista y contacto de la imprenta. El correo del cliente y la nota son opcionales. Si falta algo, el formulario indica qué corregir.
3. **Cambiar estado:** pulse un encargo, elija el nuevo estado, escriba una nota si quiere y pulse «Guardar». El cambio queda en el **Historial** con fecha y hora.
4. **Avisos:** cada creación o cambio de estado genera un aviso en la pestaña «Avisos» del encargo, marcado «Simulado · no enviado». No se envía ningún correo.
5. **Enlace del cliente:** «Copiar enlace privado» copia el enlace (si el navegador lo impide, se muestra un mensaje con el enlace para copiarlo a mano). «Ver como cliente» abre la consulta.
6. **Estados:** en la pestaña «Estados» puede añadir estados, renombrarlos, reordenarlos con ↑/↓ y escribir el texto del aviso de cada uno. El primero se asigna a los encargos nuevos; el último cierra el encargo. No se permiten nombres vacíos ni repetidos. No se pueden borrar estados (fuera del alcance).
7. **Consulta del cliente:** muestra estado actual, progreso, fecha prevista, línea de tiempo y contacto. Al llegar al último estado aparece la pregunta de satisfacción (1 a 5 y comentario opcional), que se responde una sola vez.

## Limitaciones técnicas

- Todo se guarda en `localStorage`: no hay servidor, sincronización entre dispositivos ni privacidad real. Un enlace solo funciona en el navegador donde se creó el encargo, y cualquier persona con acceso a ese navegador puede ver todos los datos.
- Los enlaces usan un código aleatorio de 24 caracteres (unos 120 bits), no secuencial; la consulta solo muestra el encargo de ese código y no enlaza a otros. Esto no sustituye un control de acceso en servidor.
- Borrar los datos del navegador elimina los encargos.
- El panel no tiene acceso restringido.

## Pruebas

- `bun run test` (Vitest): creación de enlaces, formato de enlace, cambio de estado con historial y aviso simulado, validación del formulario, nombres de estado y reparación de estados guardados.
- Revisión manual en navegador con pantalla de móvil (390 px).
- No se ha medido el rendimiento en dispositivos móviles reales.

## Integración futura (no implementada)

1. Guardar encargos, estados y respuestas en una base de datos en servidor.
2. Proteger el panel con acceso para el personal.
3. Servir la consulta del cliente desde el servidor, buscando por código y sin exponer otros encargos.
4. Conectar un servicio de correo real para los avisos.
5. Migrar los datos existentes de `localStorage` si se desea conservarlos.
