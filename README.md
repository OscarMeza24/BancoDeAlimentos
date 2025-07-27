<div align="center">
  <h1>🍏 Banco de Alimentos Virtual</h1>
  <p>
    <strong>Conectando donantes con quienes más lo necesitan</strong>
  </p>
  <p>
    <a href="#características-principales">Características</a> •
    <a href="#-tecnologías">Tecnologías</a> •
    <a href="-instalación">Instalación</a> •
    <a href="#-contribución">Contribución</a> •
    <a href="#-licencia">Licencia</a>
  </p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
  [![GitHub stars](https://img.shields.io/github/stars/OscarMeza24/BancoDeAlimentos?style=social)](https://github.com/OscarMeza24/BancoDeAlimentos/stargazers)

  ---
</div>

## 🌟 Acerca del Proyecto

Banco de Alimentos Virtual es una plataforma web innovadora que conecta a donantes de alimentos con organizaciones y personas beneficiarias. Nuestro objetivo es reducir el desperdicio de alimentos y facilitar el acceso a comida a quienes más lo necesitan, todo a través de una interfaz intuitiva y segura.

[![Vista Previa](https://via.placeholder.com/800x400.png?text=Banco+de+Alimentos+Virtual+Preview "Ver vista previa")](https://bancodealimentos.ejemplo.com)

## 🚀 Características Principales

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

## 🛠️ Tecnologías

El proyecto utiliza las siguientes tecnologías principales:

### Frontend
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Mapas**: React Leaflet
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts

### Backend
- **Plataforma**: Supabase
- **Base de Datos**: PostgreSQL
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **Funciones Serverless**: Supabase Edge Functions

### Herramientas de Desarrollo
- **Control de Versiones**: Git + GitHub
- **Formateo**: Prettier
- **Linting**: ESLint
- **Tipado**: TypeScript
- **Pruebas**: Jest + React Testing Library

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js 18 o superior
- npm 9 o superior
- Una cuenta de [Supabase](https://supabase.com/)
- Git

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Functions)
- **UI**: Tailwind CSS + shadcn/ui components
- **Autenticación**: Supabase Auth con Row Level Security
- **Base de Datos**: PostgreSQL con triggers y políticas RLS
- **Storage**: Supabase Storage para imágenes
- **Deployment**: Vercel (recomendado)

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/OscarMeza24/BancoDeAlimentos.git
   cd BancoDeAlimentos
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configura las variables de entorno**
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Obtén las credenciales de tu proyecto Supabase en Configuración > API
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. **Configura Supabase**

   - **Base de Datos**:
     ```sql
     -- Ejecuta en SQL Editor de Supabase
     -- 1. Crea las tablas
     \i scripts/01-create-tables.sql
     
     -- 2. Inserta datos iniciales (opcional)
     \i scripts/02-seed-data.sql
     ```

   - **Storage**:
     1. Ve a Storage > Create bucket
     2. Crea los buckets necesarios: `food-images`, `avatars`
     3. Configura las políticas de acceso público según sea necesario

   - **Autenticación**:
     1. Ve a Authentication > Providers
     2. Habilita el proveedor de correo/contraseña
     3. Configura las URLs de redirección en Authentication > URL Configuration

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🚀 Despliegue

Puedes desplegar fácilmente en Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOscarMeza24%2FBancoDeAlimentos)

O seguir la [guía de despliegue](DEPLOYMENT.md) para otras plataformas.

## 🗂 Estructura del Proyecto

```bash
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
```

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

## 👥 Contribución

¡Las contribuciones son bienvenidas! Por favor lee nuestra [guía de contribución](CONTRIBUTING.md) para empezar.

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">
  Hecho con ❤️ por <a href="https://github.com/OscarMeza24">Oscar Meza</a>
</div>

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
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

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

```bash
# Ejecutar tests

npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

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
