# Historias de usuario

## HU-01. Registrar una cuenta

Como persona que necesita reparación, quiero crear una cuenta, para usar RepairLoop.

Criterios de aceptación:

- Permite seleccionar `usuario` o `tecnico`.
- Firebase crea la cuenta.
- La API crea el perfil con `POST /api/v1/users/me`.

## HU-02. Iniciar sesión

Como usuario registrado, quiero iniciar sesión, para consultar mi perfil y mis datos.

Criterios de aceptación:

- Firebase valida el correo y la contraseña.
- La aplicación consulta `GET /api/v1/users/me`.
- Las solicitudes protegidas envían el ID token en `Authorization: Bearer`.

## HU-03. Consultar el perfil

Como usuario autenticado, quiero ver mi nombre, correo y rol, para confirmar mi cuenta.

Criterios de aceptación:

- El perfil muestra los datos obtenidos de la API.
- `usuario` se muestra como “Usuario”.
- `tecnico` se muestra como “Técnico”.

## HU-04. Registrar dispositivos

Como usuario, quiero registrar mis dispositivos, para relacionarlos con una reparación.

Criterios de aceptación:

- Registra tipo, marca y modelo con `POST /api/v1/devices`.
- Consulta el listado con `GET /api/v1/devices`.
- Solo muestra dispositivos cuyo `ownerId` sea el UID autenticado.

## HU-05. Gestionar solicitudes

Como usuario, quiero crear y consultar solicitudes de reparación, para dar seguimiento a mis equipos.

Como técnico, quiero consultar solicitudes abiertas, para conocer las reparaciones disponibles.

Criterios de aceptación:

- El usuario crea solicitudes con `POST /api/v1/repair-requests`.
- El usuario consulta sus solicitudes con `GET /api/v1/repair-requests`.
- El técnico consulta solicitudes abiertas con `GET /api/v1/repair-requests/open`.