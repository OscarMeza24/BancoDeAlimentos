# Banco de Alimentos Virtual

Una plataforma web completa que conecta donantes de alimentos con organizaciones y personas beneficiarias, reduciendo el desperdicio de comida y facilitando el acceso a alimentos a quienes más lo necesitan.

## 🎯 Características Principales

### Sistema de Autenticación
- Registro y login con email/contraseña
- Roles diferenciados: Donante, Beneficiario, Voluntario, Administrador
- Perfiles personalizados con verificación

### Gestión de Donaciones
- Registro de alimentos con categorías, cantidades, fechas de vencimiento
- Sistema de imágenes para productos
- Estados de seguimiento (disponible, reservado, entregado, expirado)
- Geolocalización para pickup

### Sistema de Solicitudes
- Beneficiarios pueden solicitar alimentos disponibles
- Notificaciones automáticas entre usuarios
- Seguimiento del estado de solicitudes

### Mapa Interactivo
- Visualización de alimentos disponibles por ubicación
- Eventos de voluntariado geolocalizados
- Organizaciones beneficiarias en el mapa
- Filtros por tipo y distancia

### Eventos de Voluntariado
- Creación y gestión de eventos comunitarios
- Sistema de registro para voluntarios
- Seguimiento de participación

### Campañas Solidarias
- Donaciones monetarias para causas específicas
- Seguimiento de metas y progreso
- Transparencia en el uso de fondos

### Panel Administrativo
- Dashboard con estadísticas en tiempo real
- Gestión de usuarios y contenido
- Reportes de impacto social

### Chat de Soporte
- Asistente virtual integrado
- Respuestas automáticas a preguntas frecuentes
- Soporte contextual por sección

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Functions)
- **UI**: Tailwind CSS + shadcn/ui components
- **Autenticación**: Supabase Auth con Row Level Security
- **Base de Datos**: PostgreSQL con triggers y políticas RLS
- **Storage**: Supabase Storage para imágenes
- **Deployment**: Vercel (recomendado)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### 1. Clonar el repositorio
\`\`\`bash
git clone <repository-url>
cd banco-alimentos-virtual
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno
Crear archivo `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
\`\`\`

### 4. Configurar Supabase

#### Ejecutar scripts de base de datos:
1. Ve a tu proyecto Supabase > SQL Editor
2. Ejecuta `scripts/01-create-tables.sql`
3. Ejecuta `scripts/02-seed-data.sql`

#### Configurar Storage:
1. Ve a Storage > Create bucket
2. Crea buckets: `food-images`, `avatars`
3. Configura políticas públicas para lectura

#### Configurar Auth:
1. Ve a Authentication > Settings
2. Habilita email/password
3. Configura redirect URLs para tu dominio

### 5. Ejecutar en desarrollo
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

\`\`\`
├── app/                    # App Router de Next.js
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── alimentos/         # Gestión de alimentos
│   ├── mapa/              # Mapa interactivo
│   ├── eventos/           # Eventos de voluntariado
│   ├── campanas/          # Campañas solidarias
│   ├── admin/             # Panel administrativo
│   └── perfil/            # Gestión de perfil
├── components/            # Componentes reutilizables
│   ├── auth/              # Componentes de autenticación
│   ├── layout/            # Layout y navegación
│   ├── chat/              # Chat widget
│   └── ui/                # Componentes UI (shadcn)
├── lib/                   # Utilidades y configuración
│   ├── supabase.ts        # Cliente Supabase
│   ├── auth.ts            # Funciones de autenticación
│   └── utils.ts           # Utilidades generales
├── scripts/               # Scripts de base de datos
│   ├── 01-create-tables.sql
│   └── 02-seed-data.sql
└── public/                # Archivos estáticos
\`\`\`

## 🗄️ Esquema de Base de Datos

### Tablas principales:
- `profiles` - Perfiles de usuario con roles
- `food_categories` - Categorías de alimentos
- `food_items` - Productos donados
- `food_requests` - Solicitudes de alimentos
- `campaigns` - Campañas solidarias
- `monetary_donations` - Donaciones monetarias
- `volunteer_events` - Eventos de voluntariado
- `event_participants` - Participación en eventos
- `notifications` - Sistema de notificaciones

### Características de seguridad:
- Row Level Security (RLS) habilitado
- Políticas de acceso por rol
- Triggers para auditoría automática
- Validaciones a nivel de base de datos

## 👥 Roles y Permisos

### Donante
- Registrar y gestionar donaciones de alimentos
- Ver solicitudes de sus productos
- Participar en eventos de voluntariado
- Hacer donaciones monetarias a campañas

### Beneficiario
- Solicitar alimentos disponibles
- Ver historial de alimentos recibidos
- Registrar organización (opcional)
- Participar en eventos comunitarios

### Voluntario
- Unirse a eventos de voluntariado
- Crear eventos (con aprobación)
- Ayudar en logística y distribución
- Acceso a herramientas de coordinación

### Administrador
- Gestión completa de usuarios
- Moderación de contenido
- Creación de campañas
- Acceso a reportes y analytics
- Configuración del sistema

## 🔧 Funcionalidades Técnicas

### Autenticación y Seguridad
- JWT tokens con Supabase Auth
- Row Level Security para protección de datos
- Verificación de email obligatoria
- Políticas de acceso granulares

### Notificaciones
- Sistema de notificaciones en tiempo real
- Alertas por email (configurables)
- Notificaciones push (PWA ready)
- Chat de soporte integrado

### Geolocalización
- Integración con APIs de mapas
- Cálculo de distancias automático
- Filtros por ubicación
- Optimización de rutas de entrega

### Performance
- Server-side rendering con Next.js
- Optimización de imágenes automática
- Caching inteligente
- Lazy loading de componentes

## 📱 Características de Accesibilidad

- Diseño responsive para todos los dispositivos
- Soporte para lectores de pantalla
- Navegación por teclado completa
- Contraste de colores optimizado
- Textos alternativos en imágenes
- Formularios accesibles con validación

## 🚀 Deployment

### Vercel (Recomendado)
\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\`

### Variables de entorno en producción:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Configurar dominio personalizado en Supabase

### Configuración adicional:
1. Configurar redirects en Supabase Auth
2. Actualizar CORS settings
3. Configurar webhooks para notificaciones
4. Optimizar políticas RLS para producción

## 🧪 Testing

\`\`\`bash
# Ejecutar tests
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
\`\`\`

## 📊 Monitoreo y Analytics

- Métricas de uso integradas
- Tracking de donaciones y solicitudes
- Reportes de impacto social
- Monitoreo de performance
- Logs de errores centralizados

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de código:
- TypeScript estricto
- ESLint + Prettier configurados
- Commits convencionales
- Tests para nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [Wiki del proyecto]
- **Issues**: [GitHub Issues]
- **Email**: soporte@bancoalimentos.org
- **Chat**: Widget integrado en la aplicación

## 🔮 Roadmap

### Próximas funcionalidades:
- [ ] App móvil nativa (React Native)
- [ ] Integración con redes sociales
- [ ] Sistema de reputación y reviews
- [ ] API pública para integraciones
- [ ] Machine learning para matching automático
- [ ] Blockchain para transparencia de donaciones
- [ ] Integración con sistemas de inventario
- [ ] Programa de gamificación

### Mejoras técnicas:
- [ ] Migración a Next.js 15
- [ ] Implementación de PWA completa
- [ ] Optimización de bundle size
- [ ] Implementación de micro-frontends
- [ ] CI/CD automatizado
- [ ] Monitoring avanzado con Sentry

---

**Desarrollado con ❤️ para crear un impacto social positivo**

*Banco de Alimentos Virtual - Conectando generosidad con necesidad*
