# Plan de Pruebas — e-cloudi

**Estándar de referencia:** ISO/IEC/IEEE 29119-3:2021 (Test Documentation), con alineamiento a ISTQB (Syllabus Foundation Level) y OWASP Top 10 para los criterios de seguridad.
**Curso:** Pruebas de Software — VII Ciclo
**Proyecto:** e-cloudi (plataforma de e-commerce con probador virtual asistido por IA)
**Versión:** 1.0
**Equipo:** Andre Cuenca, Pedro Suyco, Giancarlo Villavicencio

> Nota de alcance: este plan no es genérico. Está construido a partir de la arquitectura real del repositorio (Next.js 15 / App Router, MySQL vía `mysql2`, NextAuth, MercadoPago, AWS S3, IA para probador virtual) y prioriza el esfuerzo de prueba según el riesgo de negocio, dado que el equipo parte de cero en automatización y dispone de tiempo de curso limitado.

---

## 1. Introducción

### 1.1 Identificador del plan
`PP-ECLOUDI-2026-01`

### 1.2 Propósito y alcance
Este documento define la estrategia, el alcance, los recursos y los criterios de prueba para validar la calidad funcional, de seguridad y de rendimiento de **e-cloudi**, una plataforma de comercio electrónico que además de las funciones estándar de un e-commerce (catálogo, carrito, checkout, panel administrativo) incorpora un módulo diferenciador de **probador virtual con IA** (avatar, análisis de colorimetría, validación de fotografía).

El plan cubre **todo el sistema**, pero aplica **profundidad de prueba diferenciada según el nivel de riesgo** de cada módulo (ver sección 2.2). Esto significa: los módulos de riesgo alto reciben pruebas unitarias, de integración, de sistema, de seguridad y automatización priorizada; los módulos de riesgo medio reciben pruebas funcionales de sistema y un smoke suite automatizado; los módulos de riesgo bajo reciben pruebas exploratorias/manuales dirigidas.

### 1.3 Documentos de referencia
- ISO/IEC/IEEE 29119-3:2021 — Test Documentation
- ISTQB Certified Tester Foundation Level Syllabus
- OWASP Top 10 (2021)
- Documentación interna del repositorio: `docs/S3-setup.md`, estructura de `app/api/*` y `lib/*`

### 1.4 Glosario mínimo
| Término | Significado |
|---|---|
| SUT | System Under Test (e-cloudi) |
| E2E | End-to-End (prueba de extremo a extremo) |
| CI/CD | Integración/Entrega continua |
| Caja negra | Prueba basada en entradas/salidas, sin ver el código |
| Caja blanca | Prueba basada en la estructura interna del código (ramas, sentencias) |

---

## 2. Contexto de las pruebas

### 2.1 Elementos de prueba (Test Items)

| Módulo | Componentes principales (código real) |
|---|---|
| Autenticación | `app/auth/login`, `app/auth/register`, `app/api/auth/*`, `lib/auth.ts` (NextAuth), hashing con `bcrypt` |
| Catálogo | `app/(client)/productos`, `app/(client)/categoria`, `app/api/productos/*`, `app/api/categorias/*`, `app/api/marcas`, `app/api/variacion*`, `app/api/stock/*`, `lib/products.ts`, `lib/categorias.ts` |
| Carrito y Checkout ("venta") | `app/(client)/venta/*` (carro-compras, direcciones, entrega, metodo-pago, pago, resumen, confirmacion, identificacion), `app/api/cart/*` |
| Pagos y comprobantes | `app/api/mercadopago`, `app/api/mercado-pago`, `app/api/generar-boleta`, `lib/boleta.ts`, `lib/pdf.ts` |
| Pedidos | `app/(client)/profile/pedidos`, `app/api/pedidos` (tabla `orden`, `estado_orden`, `orden_producto_especifico`) |
| Perfil de usuario | `app/(client)/profile/*` (mi-perfil, direcciones, método de pago, avatar-virtual), `app/api/direccion/*`, `app/api/metodo-pago/*`, `app/api/usuario` |
| Panel administrativo | `app/(admin)/admin/*` (login, add-products, update-products, add-promotions), `app/api/admin/productos`, `app/api/promociones/*`, `app/api/descuentos` |
| Probador virtual / IA | `app/api/tryon/status`, `app/api/avatar/*`, `lib/colorimetriaModel.ts`, `lib/avatarPhotoValidator.ts`, `lib/azureAiClient.ts` |
| Infraestructura transversal | `lib/db.ts` (pool MySQL), `lib/s3.ts` (AWS S3), envío de correo (`nodemailer`) |

### 2.2 Evaluación de riesgo del producto

Se evalúa cada módulo por **probabilidad de falla** (complejidad, dependencias externas) x **impacto de negocio** (pérdida económica, reputación, incumplimiento legal), siguiendo el enfoque de pruebas basadas en riesgo de la Unidad II.

| Módulo | Probabilidad | Impacto | Nivel de riesgo | Justificación |
|---|---|---|---|---|
| Checkout y Pagos (MercadoPago) | Media | **Alto** | 🔴 **Alto** | Involucra dinero real y una API de terceros; un fallo bloquea la venta o duplica cobros |
| Gestión de stock | Media | **Alto** | 🔴 **Alto** | Vender sin stock real (overselling) genera incumplimientos y reclamos |
| Autenticación (NextAuth + bcrypt) | Baja-Media | **Alto** | 🔴 **Alto** | Acceso indebido a cuentas o al panel admin compromete todo el sistema |
| **Control de acceso al panel administrativo** | **Alta (evidencia confirmada en código)** | **Alto** | 🔴 **Alto** | Se verificó en el código fuente que **no existe `middleware.ts` ni validación de sesión/rol en ninguna ruta `/api/admin/*`** (`[id]/route.ts`, `update/route.ts`, `disable/route.ts`); `app/(admin)/admin/layout.tsx` es solo maquetación. Cualquier usuario, autenticado o no, puede invocar directamente estos endpoints. Corresponde a OWASP Top 10 A01:2021 – Broken Access Control. Se reclasifica de Medio a Alto tras la revisión de código, con evidencia concreta en vez de una estimación |
| Panel administrativo (CRUD productos/promociones, lógica funcional) | Media | Medio | 🟠 **Medio** | Con el control de acceso ya tratado como riesgo aparte (fila anterior), la lógica funcional del CRUD en sí (validaciones de datos, transacciones) tiene impacto medio: errores afectan el catálogo público pero son corregibles sin pérdida económica directa |
| Carrito y navegación de catálogo | Alta (uso frecuente) | Medio | 🟠 **Medio** | Es el flujo más usado; errores frustran al usuario pero no comprometen datos críticos |
| Generación de boleta (PDF) | Baja | Medio | 🟠 **Medio** | Es un documento de respaldo de venta; un error es detectable y corregible post-venta |
| Perfil / direcciones / métodos de pago guardados | Baja | Medio-Bajo | 🟡 **Medio-bajo** | Afecta comodidad del usuario, no la transacción en curso |
| Probador virtual / IA (avatar, colorimetría, tryon) | Media (depende de APIs externas de IA) | Bajo | 🟢 **Bajo** | Es diferenciador de producto pero no bloquea la compra si falla |
| Notificaciones por correo | Baja | Bajo | 🟢 **Bajo** | No crítico para completar la operación de negocio |

Esta tabla es la que determina la **profundidad de prueba** en la sección 4 y debe mostrarse en la sustentación como evidencia de pensamiento basado en riesgo (criterio 5 de la rúbrica).

---

## 3. Elementos a probar y fuera de alcance

### 3.1 Funcionalidades a probar
- Registro e inicio de sesión (incluye validación de credenciales inválidas/duplicadas)
- Navegación y filtrado del catálogo (categorías, marcas, variaciones)
- Agregar/actualizar/eliminar productos del carrito, incluyendo validación de stock disponible
- Flujo completo de checkout: dirección → entrega → método de pago → pago → confirmación
- Integración con MercadoPago (sandbox) y generación de boleta en PDF
- Consulta de pedidos y su estado
- CRUD de productos y promociones desde el panel admin, incluyendo control de acceso (solo admin)
- Carga y validación de foto para el avatar virtual (`avatarPhotoValidator`)
- Autorización por rol entre rutas de cliente `(client)` y administrador `(admin)`

### 3.2 Fuera de alcance (para esta iteración del plan)
- Precisión del modelo de colorimetría o del resultado visual del probador virtual (es un problema de calidad de modelo de IA, no de pruebas de software funcionales; se documenta como riesgo conocido, no se prueba exhaustivamente)
- Pruebas de carga a gran escala (miles de usuarios concurrentes) — se hará una prueba de rendimiento acotada, no un ensayo de capacidad productiva
- Pruebas de compatibilidad multi-navegador exhaustiva (se prueba en Chromium como navegador principal de Playwright)
- Migraciones de base de datos o procesos de despliegue a producción

---

## 4. Enfoque de pruebas (estrategia)

La profundidad de cada nivel/tipo de prueba se asigna según el riesgo (sección 2.2):

| Nivel de riesgo | Niveles de prueba aplicados | Tipos de prueba | Técnicas de diseño |
|---|---|---|---|
| 🔴 Alto (Pagos, Stock, Auth) | Unitaria + Integración + Sistema/E2E + Seguridad | Funcional, seguridad, regresión, aceptación | Partición de equivalencia, análisis de valores límite, tablas de decisión, pruebas de transición de estados (estado del pedido), caja blanca dirigida a funciones críticas de `lib/` |
| 🟠 Medio (Admin, Catálogo/Carrito, Boleta) | Integración + Sistema | Funcional, regresión (smoke) | Partición de equivalencia, caja negra |
| 🟢 Bajo (IA/Avatar, Notificaciones) | Sistema (exploratoria) | Funcional exploratorio, "happy path" | Pruebas ad hoc / checklist exploratorio |

**Niveles de prueba (ISTQB):**
- **Componente/Unitaria:** funciones puras de `lib/` con lógica de negocio (ej. cálculo de disponibilidad de stock, validación de foto de avatar, armado de la boleta).
- **Integración:** rutas de `app/api/*` contra la base de datos MySQL real (entorno local), verificando contratos de entrada/salida y manejo de errores (ya se observó buen manejo, ej. validación de `id` numérico en `app/api/productos/[id]`).
- **Sistema/E2E:** flujos de usuario completos simulando un navegador real (checkout de principio a fin, login, administración de productos).
- **Aceptación:** validación contra reglas de negocio explícitas (ej. "no se debe permitir confirmar una compra si el stock es insuficiente").

**Tipos de prueba no funcional incluidos según Unidad IV:**
- **Seguridad (OWASP-aligned):** control de acceso entre rutas `(client)`/`(admin)`, protección de endpoints sensibles sin sesión válida, validación de archivos subidos (avatar/S3) contra tipos MIME falsificados, manejo de variables sensibles en `.env` (credenciales de BD, MercadoPago, S3, IA), verificación de que las contraseñas nunca se expongan en respuestas de API.
- **Rendimiento (acotado):** tiempo de respuesta de endpoints críticos (`/api/productos`, `/api/cart/*`) bajo carga ligera simulada con k6.

---

## 5. Criterios de aceptación/rechazo (pass/fail)

- **Caso de prueba individual — Aprobado (Pass):** el resultado real coincide con el resultado esperado documentado en la matriz de casos (Unidad II).
- **Caso de prueba individual — Rechazado (Fail):** hay discrepancia entre resultado real y esperado; se abre un defecto con severidad (Crítica/Alta/Media/Baja) según el módulo de riesgo afectado (sección 2.2).
- **Criterios de entrada (Entry criteria) para iniciar la ejecución de un ciclo de pruebas:**
  - El entorno local corre sin errores de build (`pnpm build` exitoso)
  - La base de datos local contiene datos de prueba (seed) representativos para cada módulo
  - Las credenciales de MercadoPago están configuradas en modo *sandbox/test*, nunca en modo productivo
- **Criterios de salida (Exit criteria) para dar por concluido un ciclo de pruebas:**
  - 100% de los casos de riesgo Alto ejecutados, con 0 defectos Críticos abiertos
  - ≥ 90% de los casos de riesgo Medio ejecutados y aprobados
  - Los defectos de riesgo Bajo quedan documentados aunque no se corrijan (se reportan como *known issues*)

---

## 6. Suspensión y reanudación de pruebas

| Condición de suspensión | Acción de reanudación |
|---|---|
| La base de datos local no responde o los datos de prueba se corrompen | Restaurar el seed de datos de prueba antes de continuar |
| El sandbox de MercadoPago no está disponible | Pausar únicamente las pruebas del módulo de pagos; continuar con el resto del plan |
| Un defecto Crítico bloquea el flujo de checkout completo | Suspender pruebas de sistema/E2E en ese flujo hasta que el defecto se corrija; las pruebas unitarias/integración de otros módulos continúan |

---

## 7. Entregables de prueba

1. Este Plan de Pruebas (`PP-ECLOUDI-2026-01`)
2. Matriz de casos de prueba (caja negra/blanca/riesgo) — Unidad II
3. Suite de pruebas automatizada (API + E2E) y reporte de ejecución — Unidad III
4. Reporte de defectos con severidad/prioridad
5. Reporte de análisis de riesgos y seguridad (OWASP/DevSecOps) — Unidad IV
6. Reporte final de métricas de calidad interpretadas (para la sustentación)

---

## 8. Tareas de prueba (secuencia de actividades)

> No se incluyen fechas de calendario en este documento por decisión del equipo; el orden refleja dependencias lógicas, no un cronograma fijo.

1. Preparar entorno de datos de prueba (seed de BD local, credenciales sandbox de MercadoPago)
2. Diseñar la matriz de casos de prueba priorizada por riesgo (Unidad II)
3. Ejecutar pruebas manuales de los módulos de riesgo Alto y Medio
4. Automatizar el subconjunto de casos de mayor riesgo (API + E2E con Playwright)
5. Integrar la suite automatizada a un pipeline de CI (GitHub Actions)
6. Ejecutar el análisis de seguridad (OWASP ZAP baseline) y documentar hallazgos
7. Consolidar métricas, reportes de defectos y conclusiones para la sustentación

---

## 9. Necesidades de entorno

El equipo confirmó que **solo cuenta con entorno local de desarrollo** (sin staging separado). Esto es una limitación real que el plan debe mitigar explícitamente, no ignorar:

- **Base de datos:** se recomienda crear un esquema separado (ej. `ecloudi_test`) distinto del de desarrollo, para no contaminar datos reales con datos de prueba ni viceversa.
- **Pagos:** usar exclusivamente **credenciales de prueba (sandbox) de MercadoPago**; nunca ejecutar pruebas automatizadas contra credenciales de producción.
- **Almacenamiento (S3):** usar un bucket de prueba o, si no es viable, mockear `lib/s3.ts` en las pruebas automatizadas para no generar cargos ni archivos residuales en el bucket real.
- **IA (Google GenAI / Azure AI):** dado que son APIs externas con cuota, las pruebas automatizadas del módulo de IA deben limitarse a *smoke tests* (¿responde el endpoint, maneja errores?) y no ejecutarse en cada corrida de CI para evitar consumo innecesario de cuota.
- **Software necesario:** Node.js + pnpm, MySQL local, navegador Chromium (para Playwright), Postman/Newman o similar para pruebas de API.

---

## 10. Responsabilidades

Distribución equitativa por actividad transversal + dominio funcional, de modo que cada integrante lidera un tipo de trabajo de principio a fin del curso y es dueño de un conjunto de módulos:

| Integrante | Rol principal | Responsabilidad transversal | Módulos bajo su responsabilidad |
|---|---|---|---|
| **Andre Cuenca** | Test Manager / Líder de Calidad | Elaboración y mantenimiento del Plan de Pruebas, gestión de riesgos (producto y proyecto), definición de criterios de seguridad (OWASP/DevSecOps), consolidación final de métricas y reportes para la sustentación | Autenticación y Panel Administrativo |
| **Pedro Suyco** | Analista de Diseño y Ejecución de Pruebas | Diseño de la matriz de casos (caja negra/blanca/riesgo), ejecución manual de pruebas, gestión del reporte de defectos | Módulo Transaccional: Carrito, Checkout, Pagos (MercadoPago), Boleta — el de mayor riesgo de negocio |
| **Giancarlo Villavicencio** | Ingeniero de Automatización | Diseño y mantenimiento de la suite automatizada (API + E2E con Playwright), integración a pipeline CI/CD | Catálogo, Stock, Promociones y Módulo de Probador Virtual / IA |

Cada integrante debe estar en capacidad de explicar el trabajo de los otros dos ante el jurado (requisito explícito del criterio 8 de la rúbrica), por lo que se recomienda una revisión cruzada antes de la sustentación.

---

## 11. Riesgos del proyecto y contingencias

*(Riesgos de ejecutar el proyecto de pruebas, distintos de los riesgos del producto de la sección 2.2)*

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| No hay entorno de staging separado del de desarrollo | Alta (ya confirmado) | Medio | Usar esquema de BD y credenciales de prueba separadas (sección 9) |
| Dependencia de APIs externas (MercadoPago, Google/Azure AI) para pruebas automatizadas | Media | Medio | Usar sandbox/test keys; mockear en CI donde el costo/cuota lo justifique |
| Tiempo de curso limitado para automatizar todo el sistema | Alta | Alto | Alcance priorizado por riesgo (sección 2.2 y 4); no se automatiza el 100%, algo explícitamente permitido por la rúbrica |
| Falta de datos de prueba representativos en la BD local | Media | Medio | Crear script de *seed* de datos antes de iniciar la ejecución (tarea 1 de la sección 8) |

---

## 12. Aprobaciones

| Nombre | Rol | Firma/Visto bueno |
|---|---|---|
| Andre Cuenca | Test Manager | |
| Pedro Suyco | Analista de Pruebas | |
| Giancarlo Villavicencio | Ingeniero de Automatización | |
| Docente responsable | Aprobación académica | |
