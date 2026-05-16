# AGENT.md

## Objetivo del proyecto

Sitio web de `TEDxUC Asunción` hecho en Angular para la primera edición 2026. El foco actual es presentar el concepto curatorial, abrir postulaciones, mostrar estado de oradores/sponsors y preparar la venta de entradas.

## Estado actual

### Stack

- Frontend en `Angular 19` con componentes standalone.
- Estilos en `SCSS`.
- Servidor mínimo en `Express` (`server.js`) para servir el build compilado.
- Build de producción con `ng build`.
- Docker multi-stage listo para deploy.

### Estructura funcional

- `/` (`LandingComponent`)
  - Hero principal.
  - CTA de `Reservar entrada — próximamente`.
  - Formularios externos de `Quiero ser orador` y `Quiero ser voluntario`.
  - Secciones de periferias, reservas, postulaciones y FAQ.
- `/about` (`AboutComponent`)
  - Página de cumplimiento TEDx con explicación oficial de qué es TEDx/TED.
- `/oradores` (`SpeakersComponent`)
  - Placeholder de speakers.
  - CTA al formulario de oradores.
- `/ver-en-vivo` (`LiveComponent`)
  - Cuenta regresiva al 1 de agosto de 2026.
  - Embed placeholder de YouTube.
- `/sponsors` (`SponsorsComponent`)
  - Placeholder de sponsors y CTA de contacto.

### Datos e integraciones actuales

- Formulario de oradores: definido en `src/app/landing/landing.component.ts` y `src/app/speakers/speakers.component.ts`.
- Formulario de voluntarios: definido en `src/app/landing/landing.component.ts`.
- No hay CMS.
- No hay base de datos.
- No hay autenticación.
- No hay pasarela de pago implementada.
- No hay analytics de engagement implementado.
- No hay configuración de Railway ni DNS versionada dentro del repo.

### Archivos importantes

- `src/app/app.component.html`: topbar, menú mobile y footer.
- `src/app/app.routes.ts`: rutas principales.
- `src/app/landing/*`: landing y CTAs principales.
- `src/app/about/*`: página “Qué es TEDx”.
- `src/app/live/*`: streaming y countdown.
- `src/app/speakers/*`: listado/placeholder de oradores.
- `src/app/sponsors/*`: sponsors/aliados.
- `src/styles.scss`: estilos globales compartidos.
- `server.js`: servidor Express actual.
- `Dockerfile`: imagen para deploy.
- `TEDxUC-Asuncion-Compliance-Guide.docx`: guía de compliance/branding.

## Comandos útiles

- Desarrollo local: `npm start`
- Build producción: `npm run build`
- Servir build compilado: `npm run start:prod`
- Tests: `npm test`

## Despliegue actual

### Lo que sí está en el repo

- El proyecto se puede desplegar como app Node/Express sirviendo el build Angular.
- `server.js` usa `PORT` del entorno.
- `Dockerfile` compila Angular y luego levanta `node server.js`.

### Lo que hoy depende de infraestructura externa

Contexto reportado por el usuario:

- El deploy está en `Railway`.
- El dominio está administrado en `Name` (probablemente el registrador/DNS provider).

Nada de eso está reflejado como infraestructura-as-code en este repositorio, así que para revisar estado real hay que entrar a las consolas externas.

## Cómo ver Railway y dominio

### Railway

Revisar en el dashboard del proyecto:

- `Deployments`: historial de deploys, commit desplegado, estado y logs por deploy.
- `Variables`: secretos y variables como keys de PAGOPAR o analytics server-side.
- `Metrics`: uso, memoria, CPU y estabilidad del servicio.
- `Logs`: errores runtime, webhook callbacks, fallos de API.
- `Networking` o `Domains`: dominio Railway asignado y custom domain conectado.

Qué validar ahí:

- Que el servicio esté levantando con `node server.js`.
- Que el build publicado incluya `dist/tedx-ucasuncion/browser`.
- Que el custom domain apunte al servicio correcto.
- Que las variables sensibles nunca estén hardcodeadas en Angular.

### Dominio en “Name”

Revisar en el panel del proveedor del dominio:

- Registros `CNAME`, `A` o `ALIAS` que apunten al target provisto por Railway.
- Estado de propagación DNS.
- Configuración de `www` y dominio raíz.
- Renovación del dominio y nameservers activos.

Comandos útiles desde terminal para chequeo rápido:

- `Resolve-DnsName tudominio.com`
- `Resolve-DnsName www.tudominio.com`
- `curl -I https://tudominio.com`

## Decisiones de implementación actuales

- El frontend hoy es mayormente estático y orientado a contenido.
- No existe capa API real más allá del servidor estático.
- Si se integra PAGOPAR, no conviene hablar directo desde Angular con credenciales sensibles.
- Para analytics, conviene centralizar eventos y naming antes de instalar scripts sueltos.

## Plan propuesto: pasarela de pago con PAGOPAR

### Objetivo

Permitir compra de entradas de forma segura sin exponer secretos en el frontend.

### Estado base actual

- No hay `HttpClient` configurado.
- No hay endpoints API para checkout.
- No hay persistencia de órdenes.
- No hay páginas de `success`, `pending` o `failure`.

### Plan por etapas

1. Definir el flujo exacto de negocio.
   - Cupos.
   - Precio.
   - Moneda.
   - Si habrá una sola entrada o varios tipos.
   - Qué datos del comprador se necesitan.

2. Crear una capa backend mínima.
   - Extender `server.js` o separar un backend dedicado.
   - Agregar endpoints tipo:
     - `POST /api/payments/pagopar/create`
     - `POST /api/payments/pagopar/webhook`
     - `GET /api/payments/pagopar/status/:id`

3. Guardar secretos sólo en Railway.
   - API keys.
   - Secret/webhook signature.
   - URLs de retorno.

4. Agregar persistencia.
   - Recomendado: PostgreSQL en Railway.
   - Tablas mínimas:
     - `orders`
     - `payments`
     - `attendees`

5. Conectar Angular.
   - Incorporar `provideHttpClient`.
   - Reemplazar el CTA de “Reservar entrada” por un flujo real de checkout.
   - Crear estados de UI: cargando, éxito, pendiente, error.

6. Implementar páginas de retorno.
   - `/pago/exito`
   - `/pago/pendiente`
   - `/pago/error`

7. Validar sandbox y producción.
   - Probar pagos de punta a punta.
   - Verificar webhook.
   - Confirmar logging y reintentos.

### Cómo ver si PAGOPAR está funcionando

- Dashboard de PAGOPAR: transacciones, estados, rechazos.
- Railway logs: requests al endpoint de creación y webhook.
- Base de datos: órdenes pendientes vs pagadas.
- Frontend: tasa de inicio de checkout vs tasa de pago completado.

## Plan propuesto: analytics de engagement

### Objetivo

Medir qué contenido interesa, qué CTAs convierten y dónde se cae la gente antes de comprar o postularse.

### Recomendación inicial

Elegir una sola base primero:

- `GA4` si la prioridad es marketing/reportes estándar.
- `PostHog` si la prioridad es eventos, funnels y producto.
- `Plausible` si se quiere algo más liviano y simple.

Para este sitio, el mejor equilibrio inicial probablemente sea `GA4` o `PostHog`.

### Eventos recomendados

- `page_view`
- `nav_click`
- `hero_reserve_click`
- `hero_speaker_apply_click`
- `hero_volunteer_apply_click`
- `speaker_form_click`
- `volunteer_form_click`
- `live_click`
- `sponsor_contact_click`
- `scroll_depth_25`
- `scroll_depth_50`
- `scroll_depth_75`
- `checkout_started`
- `checkout_completed`
- `checkout_failed`

### Lugares de implementación

- `src/app/app.component.ts`
  - cambios de ruta y navegación.
- `src/app/landing/landing.component.ts`
  - CTAs del hero, scroll depth y formularios.
- `src/app/speakers/speakers.component.ts`
  - CTA de postulación.
- `src/app/live/live.component.ts`
  - interacciones con YouTube/canal.
- `src/app/sponsors/sponsors.component.ts`
  - CTA de contacto.

### Plan por etapas

1. Definir naming de eventos y propiedades.
2. Crear un servicio Angular de analytics.
3. Registrar page views por ruta.
4. Instrumentar CTAs principales.
5. Instrumentar funnel de compra cuando exista PAGOPAR.
6. Armar dashboard con métricas clave.

### KPIs sugeridos

- CTR de `Reservar entrada`.
- CTR de `Quiero ser orador`.
- CTR de `Quiero ser voluntario`.
- Scroll depth en landing.
- Visitas a `/oradores`, `/about`, `/ver-en-vivo`.
- Inicio de checkout.
- Conversión a pago completado.
- Salida hacia formularios externos.

### Cómo ver los analytics

- En el dashboard de la herramienta elegida (`GA4`, `PostHog` o `Plausible`).
- En tiempo real para validar eventos nuevos.
- En funnels para comparar:
  - landing -> click CTA
  - click CTA -> checkout
  - checkout -> pago exitoso

## Próximos cambios razonables

- Activar la venta real de entradas.
- Cargar speakers confirmados.
- Cargar sponsors reales.
- Reemplazar el placeholder de YouTube por el stream oficial.
- Externalizar configuración a variables de entorno o archivo de config seguro.

## Nota para próximos agentes

- Cuidar compliance de TEDx antes de tocar branding, sponsors o copy oficial.
- No exponer secretos de PAGOPAR en el frontend.
- Mantener consistencia entre topbar, mobile menu y footer cuando cambien labels.
- Revisar cambios locales no commiteados antes de editar `src/app/landing/landing.component.html`.
