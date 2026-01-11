<div align="center">
  <h1>🍏 Banco de Alimentos Virtual</h1>
  <h3>Plataforma Web Integrada para Gestión de Donaciones y Voluntariado</h3>
  <p>
    <strong>Conectando generosidad con necesidad para reducir el desperdicio de alimentos</strong>
  </p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)

  <p>
    <a href="#-acerca-del-proyecto">Acerca de</a> •
    <a href="#-características-principales">Características</a> •
    <a href="#-stack-tecnológico">Stack</a> •
    <a href="#-instalación">Instalación</a> •
    <a href="#-estructura-del-proyecto">Estructura</a> •
    <a href="#-guías-de-uso">Guías</a> •
    <a href="#-contribución">Contribución</a>
  </p>

  ---
</div>

<div align="center">
  <h1>🍏 Banco de Alimentos Virtual</h1>
  <h3>Plataforma Web Integrada para Gestión de Donaciones y Voluntariado</h3>
  <p>
    <strong>Conectando generosidad con necesidad para reducir el desperdicio de alimentos</strong>
  </p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)

  <p>
    <a href="#-acerca-del-proyecto">Acerca de</a> •
    <a href="#-características-principales">Características</a> •
    <a href="#-stack-tecnológico">Stack</a> •
    <a href="#-instalación">Instalación</a> •
    <a href="#-estructura-del-proyecto">Estructura</a> •
    <a href="#-contribución">Contribución</a>
  </p>

  ---
</div>

## 📋 Acerca del Proyecto

**Banco de Alimentos Virtual** es una plataforma web moderna desarrollada con tecnología de punta que conecta a donantes de alimentos con organizaciones y personas beneficiarias. Nuestra misión es reducir el desperdicio de alimentos y facilitar el acceso a comida a quienes más lo necesitan.

### Visión
Crear un ecosistema digital que transforme la forma en que las comunidades comparten alimentos, permitiendo que cada donación llegue rápidamente a quienes la necesitan, fomentando la solidaridad y reduciendo el desperdicio.

## 🌟 Características Principales

### 🔐 Sistema Inteligente de Autenticación
- Registro seguro con verificación de email
- **4 roles diferenciados**: Donante, Beneficiario, Voluntario, Administrador
- Perfiles personalizados por rol
- Autenticación con Supabase Auth (JWT tokens)
- Row Level Security para protección de datos

### 🍎 Gestión Avanzada de Donaciones
- **Registro completo de alimentos**: nombre, categoría, cantidad, fecha de vencimiento
- Sistema de imágenes integrado (Supabase Storage)
- **Estados de seguimiento**: disponible, reservado, entregado, expirado
- **Geolocalización con mapa interactivo**:
  - Seleccionar ubicación de recogida en mapa
  - Ver coordenadas exactas
  - Arrastrar marcadores para ajustar posición
  - Confirmación automática de dirección
- Notificaciones automáticas a beneficiarios

### 📍 Mapa Interactivo con Leaflet
- Visualización en tiempo real de alimentos disponibles
- Ubicación de eventos de voluntariado
- Localización de organizaciones beneficiarias
- Filtros avanzados por tipo, distancia y disponibilidad
- Clustering automático de marcadores

### 💬 Chat de Soporte Inteligente
- Asistente virtual integrado en la plataforma
- Respuestas automáticas contextuales
- Más de 25 tipos de consultas cubiertas
- Soporte multiidoma (español)
- Widget flotante minimizable
- Historial de conversaciones

### 👥 Sistema de Solicitudes
- Beneficiarios pueden solicitar alimentos
- Notificaciones en tiempo real a donantes
- Seguimiento de estado de solicitudes
- Comunicación directa entre partes

### 🎉 Eventos de Voluntariado
- Creación y gestión de eventos comunitarios
- Sistema de registro para voluntarios
- Seguimiento de participación
- Geolocalización de eventos
- Coordinación de equipo

### 💰 Campañas Solidarias
- Donaciones monetarias para causas específicas
- Seguimiento de metas y progreso en tiempo real
- Transparencia completa en uso de fondos
- Reportes de impacto

### 📊 Dashboard Administrativo
- Estadísticas en tiempo real
- Gestión de usuarios por rol
- Moderación de contenido
- Reportes de impacto social
- Métricas de donaciones

### 🔔 Sistema de Notificaciones
- Alertas en tiempo real
- Notificaciones por email configurables
- Seguimiento de cambios de estado
- Recordatorios de vencimiento

## 🛠️ Stack Tecnológico

### **Frontend**
- **Framework**: Next.js 16.1 (App Router)
- **Lenguaje**: TypeScript 5
- **Rendering**: Server-side rendering (SSR) + Static generation
- **Estilos**: Tailwind CSS + PostCSS
- **UI Components**: shadcn/ui (30+ componentes)
- **Mapas**: React Leaflet + Leaflet
- **Formularios**: React Hook Form + Zod (validación)
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Temas**: next-themes (dark/light mode)
- **Notificaciones Toast**: Sonner
- **Gestos**: Vaul

### **Backend & Infraestructura**
- **Plataforma**: Supabase (Backend-as-a-Service)
- **Base de Datos**: PostgreSQL 15+
- **Autenticación**: Supabase Auth (JWT)
- **Almacenamiento**: Supabase Storage (S3-compatible)
- **Función Serverless**: Supabase Edge Functions
- **Real-time**: WebSockets de Supabase
- **Security**: Row Level Security (RLS)

### **Herramientas de Desarrollo**
- **Control de versiones**: Git + GitHub
- **Formateo**: Prettier
- **Linting**: ESLint
- **Build**: Next.js bundler
- **Package Manager**: npm/pnpm

## 📦 Tabla de Dependencias

| Categoría | Paquete | Versión |
|-----------|---------|---------|
| **Core** | next | ^16.1.1 |
| | react | ^19 |
| | typescript | ^5 |
| **UI** | tailwindcss | ^3.4.17 |
| | shadcn/ui | Latest |
| **Forms** | react-hook-form | ^7.54.1 |
| | zod | ^3.24.1 |
| **Maps** | react-leaflet | ^5.0.0 |
| | leaflet | ^1.9.4 |
| **Backend** | @supabase/supabase-js | latest |
| **Charts** | recharts | 2.15.0 |
| **Icons** | lucide-react | ^0.454.0 |
| **Utilities** | date-fns | latest |

## 📋 Requisitos Previos

- **Node.js** 18.17 o superior
- **npm** 9+ o **pnpm** 8+
- Cuenta en [Supabase](https://supabase.com/) (gratuita)
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/OscarMeza24/BancoDeAlimentos.git
cd "BancoAlimentos - Vinculacion"
```

### 2. Instalar dependencias
```bash
npm install
# O con pnpm
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase (obtén estas claves de tu proyecto Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 4. Configurar Supabase

#### a) **Base de Datos - Crear Tablas**

1. Ve a **SQL Editor** en tu proyecto Supabase
2. Ejecuta los scripts en orden:

```bash
# Script 1: Crear tabla de perfiles
\i scripts/01-create-tables.sql

# Script 2: Insertar datos de ejemplo (opcional)
\i scripts/02-seed-data.sql

# Scripts adicionales para correcciones y mejoras
\i scripts/03-add-food-location-columns.sql
\i scripts/04-fix-rls-policies.sql
\i scripts/05-fix-rls-campaigns.sql
```

#### b) **Configurar Storage**

1. Ve a **Storage** en Supabase
2. Crea los siguientes buckets:
   - `food-images` (para fotos de alimentos)
   - `avatars` (para fotos de perfil)
   - `campaign-images` (para imágenes de campañas)

3. Configura políticas de acceso público si lo necesitas

#### c) **Configurar Autenticación**

1. Ve a **Authentication > Providers**
2. Habilita **Email Provider**
3. Ve a **Authentication > URL Configuration**
4. Añade tus URLs de redirección:
   ```
   Redirect URL: http://localhost:3000/auth/callback
   (Para producción: https://tu-dominio.com/auth/callback)
   ```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
.
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Página de inicio
│   ├── globals.css               # Estilos globales
│   │
│   ├── auth/                     # Autenticación
│   │   └── page.tsx              # Login/Register
│   │
│   ├── dashboard/                # Dashboard principal
│   │   └── page.tsx
│   │
│   ├── alimentos/                # Gestión de alimentos
│   │   ├── page.tsx              # Lista de alimentos
│   │   ├── [id]/                 # Detalle de alimento
│   │   └── nuevo/                # Crear donación
│   │
│   ├── mapa/                     # Mapa interactivo
│   │   ├── page.tsx
│   │   └── loading.tsx
│   │
│   ├── eventos/                  # Eventos de voluntariado
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   ├── nuevo/
│   │   └── loading.tsx
│   │
│   ├── campanas/                 # Campañas solidarias
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   ├── nueva/
│   │   └── loading.tsx
│   │
│   ├── usuarios/                 # Gestión de usuarios
│   │   └── page.tsx
│   │
│   ├── admin/                    # Panel administrativo
│   │   └── page.tsx
│   │
│   ├── perfil/                   # Perfil de usuario
│   │   └── page.tsx
│   │
│   ├── configuraciones/          # Configuraciones
│   │   └── page.tsx
│   │
│   └── notificaciones/           # Centro de notificaciones
│       └── page.tsx
│
├── components/                   # Componentes reutilizables
│   ├── theme-provider.tsx        # Tema global
│   │
│   ├── auth/                     # Componentes de autenticación
│   │   ├── auth-form.tsx
│   │   ├── auth-provider.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout
│   │   └── navbar.tsx
│   │
│   ├── chat/                     # Chat widget
│   │   └── chat-widget.tsx
│   │
│   ├── mapa/                     # Componentes de mapa
│   │   ├── mapa-interactivo.tsx
│   │   ├── location-picker-modal.tsx
│   │   └── map-picker-content.tsx
│   │
│   ├── admin/                    # Componentes admin
│   │   ├── campaigns-management.tsx
│   │   ├── donations-management.tsx
│   │   ├── events-management.tsx
│   │   ├── users-management.tsx
│   │   └── reports.tsx
│   │
│   ├── donor/                    # Componentes para donantes
│   │   └── received-requests.tsx
│   │
│   ├── settings/                 # Configuraciones
│   │   ├── settings-provider.tsx
│   │   └── profile-privacy-display.tsx
│   │
│   └── ui/                       # shadcn/ui Components
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ... (30+ componentes)
│
├── lib/                          # Utilidades y configuración
│   ├── supabase.ts               # Cliente Supabase
│   ├── auth.ts                   # Funciones de autenticación
│   ├── notifications.ts          # Utilidades de notificaciones
│   ├── privacy.ts                # Políticas de privacidad
│   └── utils.ts                  # Funciones auxiliares
│
├── hooks/                        # React Hooks personalizados
│   ├── use-mobile.tsx
│   ├── use-settings-features.ts
│   └── use-toast.ts
│
├── styles/                       # Estilos globales
│   └── globals.css
│
├── scripts/                      # Scripts SQL
│   ├── 01-create-tables.sql
│   ├── 02-seed-data.sql
│   ├── 03-add-food-location-columns.sql
│   ├── 04-fix-rls-policies.sql
│   ├── 05-fix-rls-campaigns.sql
│   ├── 06-fix-rls-profiles-insert.sql
│   ├── 07-fix-triggers.sql
│   └── ...
│
├── public/                       # Archivos estáticos
├── components.json               # Configuración shadcn/ui
├── tailwind.config.ts            # Configuración Tailwind
├── tsconfig.json                 # Configuración TypeScript
├── next.config.mjs               # Configuración Next.js
├── postcss.config.mjs            # Configuración PostCSS
├── package.json
└── README.md
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuario con roles y datos personales |
| `roles` | Definición de roles del sistema |
| `food_categories` | Categorías de alimentos (frutas, lácteos, etc.) |
| `food_items` | Productos donados con ubicación y estado |
| `food_requests` | Solicitudes de alimentos |
| `campaigns` | Campañas solidarias |
| `monetary_donations` | Donaciones monetarias |
| `volunteer_events` | Eventos de voluntariado |
| `event_participants` | Participación en eventos |
| `notifications` | Sistema de notificaciones |

### Características de Seguridad
- ✅ **Row Level Security (RLS)**: Cada usuario solo ve sus datos
- ✅ **Triggers automáticos**: Auditoria y validación
- ✅ **Políticas granulares**: Acceso por rol
- ✅ **Encriptación**: Datos sensibles protegidos
- ✅ **Validaciones**: A nivel de base de datos

## 🎮 Guía de Uso por Rol

### 👨‍🌾 Donante
1. **Registrarse** con email y datos
2. **Ir a "Alimentos" > "Donar Alimentos"**
3. **Completar información**:
   - Tipo de alimento
   - Cantidad y fecha de vencimiento
   - Ubicación (usar mapa interactivo)
   - Foto (opcional)
4. **Ver solicitudes** de beneficiarios
5. **Coordinar entrega** mediante el chat

### 👥 Beneficiario
1. **Registrarse** con datos de organización
2. **Explorar alimentos disponibles**
3. **Solicitar alimentos** de interés
4. **Recibir notificaciones** de estado
5. **Ver historial** de alimentos recibidos

### 🤝 Voluntario
1. **Registrarse** como voluntario
2. **Ver eventos disponibles** en la sección "Eventos"
3. **Unirse a eventos** de su interés
4. **Participar en actividades**
5. **Acceder a herramientas** de coordinación

### 👨‍💼 Administrador
1. **Acceder a "Admin"**
2. **Gestionar usuarios** (crear, editar, eliminar)
3. **Moderar contenido** (aprobar/rechazar)
4. **Crear campañas** solidarias
5. **Ver reportes y analytics**
6. **Configurar sistema**

## 🚀 Deployment

### Desplegar en Vercel (Recomendado)

#### Opción 1: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

#### Opción 2: GitHub Integration
1. Conecta tu repositorio en Vercel
2. Configura variables de entorno
3. Vercel despliega automáticamente en cada push

### Configuración de Producción

1. **Variables de entorno en Vercel**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Configurar en Supabase**:
   - Ir a **Settings > General**
   - Actualizar **Auth > URL Configuration** con tu dominio

3. **Configurar CORS** en Supabase:
   - Ir a **Project Settings > CORS**
   - Añadir `https://tu-dominio.com`

### Otras Plataformas
- **Netlify**: Soportado nativamente
- **Railway**: Dockerfile incluido
- **Docker**: Ver [Dockerfile](Dockerfile)

## 📊 Características de Performance

- ⚡ **Server-Side Rendering**: Carga inicial rápida
- 🖼️ **Image Optimization**: Next.js Image con lazy loading
- 📦 **Code Splitting**: Carga de componentes bajo demanda
- 🔄 **Caching**: Estrategia de caché inteligente
- 📱 **Mobile-first**: Responsive design

## ♿ Accesibilidad

- ✅ WCAG 2.1 Level AA
- ✅ Navegación completa por teclado
- ✅ Lectores de pantalla soportados
- ✅ Contraste de colores optimizado
- ✅ Textos alternativos en imágenes

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Coverage report
npm run test:coverage
```

## 📈 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Build
npm run build            # Build para producción
npm run start            # Inicia servidor de producción

# Linting
npm run lint             # Ejecuta ESLint
npm run lint:fix         # Corrige errores automáticos

# Formato
npm run format           # Formatea código con Prettier
```

## 🐛 Troubleshooting

### "Error: Supabase variables not configured"
- Verifica que `.env.local` existe en la raíz
- Confirma que tienes las claves correctas de Supabase
- Reinicia el servidor de desarrollo

### "Error: Connection timeout"
- Verifica tu conexión a internet
- Comprueba que la URL de Supabase sea correcta
- Intenta desde otra red WiFi

### "Error: Row level security issue"
- Ejecuta los scripts de RLS desde SQL Editor
- Verifica que el usuario está autenticado
- Comprueba las políticas RLS en Supabase

## 📚 Documentación Adicional

- [Manual de Usuario](MANUAL_USUARIO.md)
- [Guía de Video Capacitación](GUION_VIDEO_CAPACITACION.md)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork el proyecto**
2. **Crear una rama** (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit cambios** con mensajes descriptivos
4. **Push a la rama** (`git push origin feature/nueva-funcionalidad`)
5. **Abrir Pull Request** describiendo los cambios

### Estándares de Código
- ✅ TypeScript estricto
- ✅ ESLint + Prettier
- ✅ Commits convencionales
- ✅ Tests para nuevas funcionalidades

## 🗺️ Roadmap

### Próximas Funcionalidades v2.0
- [ ] App móvil con React Native
- [ ] Integración con redes sociales
- [ ] Sistema de reputación y reviews
- [ ] API pública RESTful + GraphQL
- [ ] Machine learning para matching automático
- [ ] Notificaciones push (PWA)
- [ ] Integración con sistemas de inventario
- [ ] Programa de gamificación
- [ ] Blockchain para transparencia

### Mejoras Técnicas
- [ ] Migración a Next.js 15
- [ ] PWA completa con service workers
- [ ] Optimización de bundle size
- [ ] Implementación de micro-frontends
- [ ] CI/CD automatizado con GitHub Actions
- [ ] Monitoring con Sentry
- [ ] E2E tests con Playwright

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - ver [LICENSE](LICENSE) para detalles.

## 👏 Agradecimientos

- [Next.js](https://nextjs.org/) - React Framework
- [Supabase](https://supabase.com/) - Backend Open Source
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com/) - Utilidades CSS
- [Leaflet](https://leafletjs.com/) - Mapas interactivos
- Comunidad de code y desarrolladores solidarios

## 📞 Soporte

- 📖 **Documentación**: Ver archivos `.md` en la raíz
- 🐛 **Reportar bugs**: [GitHub Issues](https://github.com/OscarMeza24/BancoDeAlimentos/issues)
- 💬 **Chat de soporte**: Widget integrado en la app
- 📧 **Email**: soporte@bancoalimentos.org

---

<div align="center">
  <h3>Hecho con ❤️ por <a href="https://github.com/OscarMeza24">Oscar Meza</a></h3>
  <p><strong>Transformando comunidades a través de la tecnología y la solidaridad</strong></p>
  
  ⭐ Si este proyecto te es útil, ¡considera darle una estrella en GitHub!
</div>

---

**Desarrollado con ❤️ para crear un impacto social positivo**

*Banco de Alimentos Virtual - Conectando generosidad con necesidad*
