# RepairLoop: guía de trabajo

## 1. Objetivo y alcance

Aplicación web para solicitar reparaciones, recibir cotizaciones de técnicos y dar seguimiento al servicio.

**Flujo para la demostración final:** un cliente registra una falla, recibe dos cotizaciones, acepta una y sigue la reparación hasta finalizar.

Funciones del MVP:

- Registro e inicio de sesión; roles cliente y técnico.
- Perfil del técnico y servicios ofrecidos.
- Registro de dispositivos y CRUD de solicitudes de reparación.
- Cotizaciones desglosadas con costo y tiempo estimado; aceptación o rechazo.
- Asignación de un técnico, estados de reparación e historial de avances.
- Consulta de reparaciones anteriores y calificación del servicio.
- Comparador de reparación frente a reemplazo: ahorro estimado usando precios de referencia ficticios guardados en Firestore.

**Simplificación inicial:** fotografías opcionales pospuestas; sin chat ni pagos reales. Administrador pendiente de confirmar con el docente, pues el mínimo general exige dos roles.

## 2. Tecnologías

| Parte | Tecnología | Decisión |
|---|---|---|
| Backend | Node.js con JavaScript | Confirmado; sin combinar con PHP o Python |
| API | Express, con endpoints REST | Propuesta para organizar el backend |
| Frontend | HTML, CSS y JavaScript | Propuesta sencilla; biblioteca adicional solo si se necesita |
| Base de datos | Firebase Cloud Firestore | Obligatoria por el PDF |
| Autenticación | Firebase Authentication | Propuesta |
| Acceso del servidor a Firebase | Firebase Admin SDK | Propuesta; credenciales únicamente en el servidor |
| Pruebas | Ejecutor de pruebas de Node.js y Supertest para la API | Propuesta |
| Colaboración | Git y GitHub | Obligatorio |
| Publicación | Hosting para frontend y API | Proveedor pendiente |

La interfaz consumirá la API. El backend validará identidad, permisos y reglas de negocio antes de acceder a los datos. Las versiones y comandos de instalación se fijarán al crear el proyecto.

## 3. Repositorio y estructura recomendada

**Un repositorio compartido**, con nombre propuesto `repairloop`; todavía no está creado ni tiene URL asignada.

| Ruta | Contenido |
|---|---|
| `apps/web/` | Frontend: páginas, estilos, scripts y recursos |
| `apps/api/src/routes/` | Rutas de la API |
| `apps/api/src/controllers/` | Manejo de peticiones y respuestas |
| `apps/api/src/services/` | Reglas de negocio y operaciones con Firestore |
| `apps/api/src/middleware/` | Autenticación, permisos, validaciones y errores |
| `apps/api/src/config/` | Configuración de Firebase y entorno |
| `firebase/` | Reglas de seguridad e índices |
| `apps/api/tests/` | Pruebas automatizadas del backend |
| `docs/revisiones/` | `R1.md`, `R2.md` y `R3.md` |
| `docs/` | Arquitectura, historias de usuario, modelo, API y manual |
| `evidencias/` | Capturas o videos por entrega |
| `README.md` | Descripción, instalación, ejecución, pruebas y URLs |
| `apps/api/.env.example` | Variables del backend, sin secretos |
| `.gitattributes` | Finales de línea compartidos entre Windows y Linux |
| `.gitignore` | Excluir `.env`, credenciales y dependencias instaladas |

### Ramas y flujo de trabajo

| Rama | Responsable | Uso |
|---|---|---|
| `main` | Ambos | Estructura inicial y versiones estables de entrega |
| `develop` | Ambos | Integrar y comprobar el trabajo antes de pasarlo a `main` |
| `feature/api-base` | Alexis | Configuración inicial del backend Node.js |
| `feature/web-base` | Rainnier | Configuración inicial del frontend |

Primero se sube la estructura base a `main`; desde ese commit se crea `develop`. Después cada integrante crea su rama inicial desde `develop`.

Para tareas posteriores se crean nuevas ramas desde `develop` actualizado: por ejemplo, Alexis usa `feature/api-auth` o `feature/api-requests`; Rainnier usa `feature/web-login` o `feature/web-requests`. Las ramas son por tarea, no ramas permanentes por persona.

**Integración:** `feature/*` → pull request a `develop`, revisado por el compañero → comprobar funcionamiento conjunto → pull request a `main` para cada entrega. Los tags oficiales deben apuntar al código evaluable. No crear todas las ramas futuras al inicio.

**Base del primer commit:** carpetas, archivos de documentación y configuración mínima de Git; sin dependencias ni código funcional. Usar `.gitkeep` en carpetas vacías para que Git las incluya. Las pruebas de API se ubicarán en `apps/api/tests/`; `.env.example` del backend en `apps/api/`. Añadir `.gitattributes` para mantener finales de línea consistentes entre Windows (Alexis) y CachyOS (Rainnier).

## 4. Datos y reglas principales

Colecciones iniciales propuestas:

| Colección | Datos |
|---|---|
| `users` | Nombre, identificador de autenticación y rol |
| `technicianProfiles` | Perfil y servicios del técnico |
| `devices` | Dispositivo, propietario y referencia de reemplazo |
| `repairRequests` | Falla, dispositivo, cliente y estado |
| `quotes` | Solicitud, técnico, conceptos, costo, tiempo y decisión |
| `repairs` | Cotización aceptada, técnico asignado, estado y avances |
| `reviews` | Reparación, cliente, puntuación y comentario |

Reglas que debemos implementar:

- Cada cliente administra únicamente sus datos; cada técnico modifica solo sus cotizaciones y reparaciones asignadas.
- Una solicitud puede recibir varias cotizaciones, pero aceptar una debe generar una sola reparación, incluso con peticiones simultáneas.
- Validar entradas y cambios de estado en el servidor. Restringir edición y eliminación de solicitudes que ya tienen una reparación asignada.
- Guardar fecha y responsable de los avances; permitir calificar solo una reparación propia y finalizada.
- Calcular el ahorro como **precio de reemplazo − costo de reparación**; mostrar los valores usados y manejar referencias inválidas o diferencias negativas.

Los datos centrales deben persistir realmente en Firestore, con al menos tres entidades. Las demostraciones usarán datos ficticios. No subir secretos ni credenciales al repositorio.

## 5. División de tareas

Alexis se encarga del backend y Rainnier del frontend. Cada responsable desarrolla, prueba y documenta su parte.

| Etapa | Alexis: backend y datos | Rainnier: frontend e integración |
|---|---|---|
| Base compartida | Acordar API, modelo de datos y reglas con Rainnier | Acordar vistas, campos y respuestas con Alexis |
| Primera revisión | Configurar API y Firebase; verificar autenticación; permisos iniciales; operaciones de perfiles, dispositivos y solicitudes | Implementar acceso, navegación, perfil y formularios; conectar registro y listado de dispositivos/solicitudes |
| Segunda revisión | CRUD completo; cotizaciones; aceptación sin duplicados; asignación; estados y permisos | Integrar edición/eliminación, comparación de cotizaciones, aceptación/rechazo y seguimiento; mostrar ahorro inicial |
| Entrega final | Completar historial, calificación y cálculo de ahorro en API; revisar seguridad y publicar backend | Integrar historial, calificación y ahorro final; ajustar responsividad y publicar frontend |
| Todas las etapas | Pruebas de API y negocio; documentación técnica; revisar PR de Rainnier | Pruebas de sus módulos e integración; manual y evidencias; revisar PR de Alexis |

**Ambos:** integrar avances con frecuencia, preparar cada entrega, comprobar el flujo completo y explicar sus contribuciones. El diseño visual se decidirá aparte antes de desarrollar las vistas definitivas.

## 6. Las tres entregas

### Primera revisión — 19 de noviembre de 2026 · 25 %

- [ ] README: problema, objetivo, alcance, roles, integrantes y tecnologías.
- [ ] Al menos cinco historias de usuario, diagrama de componentes y modelo inicial Firestore.
- [ ] Cuatro vistas principales navegables; su diseño se prepara por separado.
- [ ] Aplicación ejecutable con autenticación y primer rol operativo.
- [ ] Perfiles, dispositivos y solicitudes: registro y consulta con persistencia real.
- [ ] `docs/revisiones/R1.md` y tag `revision-1-2026-11-19`.

### Segunda revisión — 26 de noviembre de 2026 · 35 %

- [ ] CRUD principal completo y permisos efectivos para cliente y técnico.
- [ ] Cotizaciones, aceptación/rechazo, asignación y estados funcionando con validación en API.
- [ ] Comparador de ahorro en versión inicial ejecutable.
- [ ] Endpoints documentados y al menos cinco pruebas automatizadas aprobadas.
- [ ] PR integrados, `docs/revisiones/R2.md` y tag `revision-2-2026-11-26`.

### Entrega final — 3 de diciembre de 2026 · 40 %

- [ ] MVP completo: historial, calificación y comparador final integrados.
- [ ] Al menos diez pruebas automatizadas aprobadas; comprobar permisos, errores y estados.
- [ ] Frontend y API publicados, con URLs operativas y datos ficticios de demostración.
- [ ] README reproducible con requisitos, instalación, variables, ejecución, pruebas, cuentas de demostración y URLs.
- [ ] Manual básico, documentación técnica, esquema, reglas e índices Firebase necesarios.
- [ ] `docs/revisiones/R3.md` y release/tag `revision-3-2026-12-03`.
- [ ] Demostración completa del flujo indicado al inicio.

**En cada entrega:** código sincronizado en GitHub, demostración en vivo y evidencia de ambos integrantes. Cada `Rn.md` incluirá fecha, responsables, checklist, enlaces a commits/PR y capturas o video correspondientes al código entregado. Mostrar un caso exitoso y una falla controlada.

## 7. Prioridades y pendientes

Orden de trabajo: **base y acceso → dispositivos/solicitudes → cotizaciones y estados → historial/calificación/ahorro → publicación y cierre**. Preparar pruebas, documentación y evidencias durante cada etapa.

Las pruebas deben cubrir autenticación, permisos por propietario y rol, entradas inválidas, CRUD, aceptación única de cotización, estados permitidos, calificación y cálculo de ahorro.

Por revisión se evalúa: entregables 40 puntos; funcionamiento 25; calidad y seguridad 15; GitHub 10; explicación y participación 10.

**Pendiente de decidir:** confirmar las tecnologías propuestas además de Node.js, crear repositorio, elegir hosting y confirmar si se exige administrador. El diseño visual se tratará aparte. Aún no hay implementación, pruebas ejecutadas ni despliegue.

Fuente: guía académica proporcionada, ficha RepairLoop y requisitos comunes. La estructura técnica y el reparto son propuestas ajustables; se mantienen dos revisiones y una entrega final.
