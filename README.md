# Front-POS-School

Sistema de Punto de Venta (POS) para instituciones educativas. Permite gestionar estudiantes, pagos de colegiaturas, becas y generación de tickets/reportes.

## Tecnologías

- **Angular 18** con módulos lazy-loaded
- **Fuse Admin Template** (v14.1.1) como base de UI
- **Angular Material** + **TailwindCSS** para estilos
- **PrimeNG** para componentes adicionales
- **ngx-toastr** para notificaciones
- **ApexCharts** para gráficas
- **Docker + Nginx** para despliegue

## Arquitectura

```
src/
├── @fuse/              # Librería Fuse (componentes, directivas, servicios base)
├── app/
│   ├── core/           # Servicios globales (auth, navegación, tipos)
│   ├── layout/         # Layouts de la aplicación
│   ├── modules/
│   │   ├── admin/      # Módulos protegidos (requieren autenticación)
│   │   │   ├── dashboards/
│   │   │   │   ├── home/       # Dashboard principal
│   │   │   │   ├── student/    # Gestión de estudiantes
│   │   │   │   └── payment/    # Gestión de pagos
│   │   │   └── ...
│   │   ├── auth/       # Páginas de autenticación (sign-in, sign-up, etc.)
│   │   └── landing/    # Página de inicio pública
│   └── shared/         # Servicios compartidos (catálogos, validadores)
├── environments/       # Configuración por entorno
└── assets/             # Recursos estáticos
```

## Módulos principales

### Autenticación (`/core/auth`)
- Login con JWT contra API backend
- Guards para rutas protegidas (AuthGuard / NoAuthGuard)
- Interceptor HTTP para inyectar token
- Navegación dinámica basada en módulos asignados al usuario

### Estudiantes (`/dashboards/student`)
- CRUD de estudiantes (nombre, CURP, email, género, fecha de nacimiento)
- Búsqueda y paginación
- Filtrado por grupo
- Generación de código QR por estudiante

### Pagos (`/dashboards/payment`)
- Consulta de pagos pendientes por estudiante, año escolar y nivel académico
- Registro de pagos (completos o parciales)
- Soporte para becas y descuentos
- Múltiples métodos de pago
- Pagos de servicios
- Generación de tickets
- Reporte de pagos pendientes (PDF)
- Cierre de caja

### Catálogos (`/shared/catalog`)
- Años escolares
- Niveles académicos
- Grupos

## Modelos de datos

| Entidad | Campos principales |
|---------|-------------------|
| Student | id, name, first_lastname, second_lastname, curp, email, gender, birthday, student_group_id, academic_level_id, scholar_year_id |
| Payment | id, label, amount, discount_amount, last_day_with_discount, is_up_to_date, pay_concept_type |
| PaymentMethod | id, name, key |
| Scholarship | id, name, amount |

## API Backend

El frontend consume una API REST en `http://127.0.0.1:8000/api` (desarrollo). Endpoints principales:

- `POST /auth/login` — Autenticación
- `GET /auth/get-modules` — Módulos de navegación del usuario
- `GET /student` — Listar estudiantes
- `POST /student` — Crear estudiante
- `PUT /student` — Actualizar estudiante
- `DELETE /student/:id` — Eliminar estudiante
- `GET /student/:uuid` — Obtener estudiante por UUID
- `GET /student/by-group/:groupId` — Estudiantes por grupo
- `POST /payments/pending-payments` — Pagos pendientes
- `POST /payments/service-payments` — Pagos de servicios
- `POST /payments` — Registrar pago
- `GET /documents/get-ticket/:folio` — Obtener ticket
- `GET /documents/get-pending-payments-report` — Reporte de pagos pendientes
- `GET /catalog/scholar-years` — Años escolares
- `GET /catalog/academic-levels` — Niveles académicos
- `GET /catalog/groups` — Grupos

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo (por defecto) |
| `npm run start:local` | Servidor con configuración local |
| `npm run build:dev` | Build de desarrollo |
| `npm run build:prod` | Build de producción |
| `npm run test` | Ejecutar tests unitarios |
| `npm run lint` | Ejecutar linter |

## Despliegue con Docker

```bash
docker build --build-arg ENVIRONMENT=prod -t front-pos-school .
docker run -p 80:80 front-pos-school
```

El Dockerfile usa un build multi-stage: Node 22 para compilar y Nginx Alpine para servir.

## Requisitos

- Node.js (ver `.nvmrc`)
- npm
