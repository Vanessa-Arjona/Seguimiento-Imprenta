# Seguimiento Imprenta

Demostración de seguimiento de encargos para una imprenta digital que trabaja con empresas. Tiene dos partes:

- **Panel de la imprenta** (`/`): para el personal de la imprenta.
- **Consulta del cliente** (`/e/<código>`): página que abre el cliente con su enlace, sin registrarse.

> **Demostración:** los datos se guardan únicamente en este navegador; los enlaces y los avisos son simulados. No usar con datos reales.

## Dónde verla

- **Demo publicada:** https://print-order-peek.lovable.app — el panel en la raíz y la consulta del cliente en `/e/<código>`.
- **Código:** https://github.com/Vanessa-Arjona/Seguimiento-Imprenta (rama `main`).

## Arranque local

Requisitos: [Bun](https://bun.sh) (o Node.js 20+ con npm).

```bash
bun install        # instalar dependencias
bun run dev        # servidor de desarrollo (Vite); abra la URL que muestra la consola
bun run build      # compilación de producción
bun run preview    # servir localmente la compilación
bun run test       # pruebas (Vitest)
bun run lint       # revisión de código (ESLint)
```

Con npm: `npm install` y `npm run dev` (mismos nombres de script).

## Reiniciar los datos de ejemplo

**Atención: se pierden todos los encargos, estados, avisos y respuestas creados en ese navegador, y los enlaces de cliente dejan de funcionar.**

1. Abra el panel y las herramientas de desarrollo del navegador (F12) → Consola.
2. Ejecute:
   ```js
   localStorage.removeItem("imprenta-orders-v2"); localStorage.removeItem("imprenta-stages-v1"); location.reload();
   ```
3. Al recargar se crean de nuevo los cuatro encargos de ejemplo y los estados por defecto, con enlaces nuevos.

Alternativa: borrar los datos del sitio en la configuración del navegador.

## Guía de uso

1. Abra el **Panel de la imprenta**. La primera vez aparecen cuatro encargos de ejemplo ficticios (correos `@example.com`, teléfonos marcados como «ficticio»).
2. **Crear un encargo:** pulse «+ Nuevo encargo», complete empresa, producto, cantidad, fecha prevista y contacto de la imprenta. El correo del cliente y la nota son opcionales. Si falta algo, el formulario indica qué corregir.
3. **Buscar:** el buscador filtra por empresa, producto o identificador (p. ej. «ENC-1042»), sin distinguir mayúsculas ni tildes, y se combina con los filtros de estado.
4. **Cambiar estado:** pulse un encargo, elija el nuevo estado, escriba una nota si quiere y pulse «Guardar». El cambio queda en el **Historial** con fecha y hora.
5. **Avisos:** cada creación o cambio de estado genera un aviso en la pestaña «Avisos» del encargo, marcado «Simulado · no enviado». No se envía ningún correo.
6. **Enlace del cliente:** «Copiar enlace privado» copia el enlace (si el navegador lo impide, se muestra un mensaje con el enlace para copiarlo a mano). «Ver como cliente» abre la consulta.
7. **Estados:** en la pestaña «Estados» puede añadir estados, renombrarlos, reordenarlos con ↑/↓ y escribir el texto del aviso de cada uno. El primero se asigna a los encargos nuevos; el último cierra el encargo. No se permiten nombres vacíos ni repetidos. No se pueden borrar estados (fuera del alcance).
8. **Consulta del cliente:** muestra estado actual, progreso, fecha prevista, línea de tiempo y contacto. Al llegar al último estado aparece la pregunta de satisfacción (1 a 5 y comentario opcional), que se responde una sola vez.

## Limitaciones técnicas

- Todo se guarda en `localStorage`: no hay servidor, sincronización entre dispositivos ni privacidad real. Un enlace solo funciona en el navegador donde se creó el encargo, y cualquier persona con acceso a ese navegador puede ver todos los datos.
- Los enlaces usan un código aleatorio de 24 caracteres (unos 120 bits), no secuencial; la consulta solo muestra el encargo de ese código y no enlaza a otros. Esto no sustituye un control de acceso en servidor.
- Borrar los datos del navegador elimina los encargos.
- El panel no tiene acceso restringido.

## Pruebas

- `bun run test` (Vitest): creación de enlaces, formato de enlace, cambio de estado con historial y aviso simulado, validación del formulario, buscador combinado con filtro de estado, nombres de estado y reparación de estados guardados.
- Revisión manual en navegador con pantalla de móvil (390 px).
- No se ha medido el rendimiento en dispositivos móviles reales.

## Integración futura (no implementada)

1. Guardar encargos, estados y respuestas en una base de datos en servidor.
2. Proteger el panel con acceso para el personal.
3. Servir la consulta del cliente desde el servidor, buscando por código y sin exponer otros encargos.
4. Conectar un servicio de correo real para los avisos.
5. Migrar los datos existentes de `localStorage` si se desea conservarlos.