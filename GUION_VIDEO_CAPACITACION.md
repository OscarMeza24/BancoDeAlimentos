# 🎬 GUIÓN DETALLADO - VIDEO DE CAPACITACIÓN
## BANCO DE ALIMENTOS VIRTUAL

---

## 📋 INFORMACIÓN DEL VIDEO

**Duración estimada:** 30-35 minutos  
**Público objetivo:** Desarrolladores, stakeholders, usuarios finales  
**Nivel:** Intermedio-Avanzado  
**Formato:** Tutorial + Demostración práctica

---

## 🎯 OBJETIVOS DE APRENDIZAJE

Al finalizar este video, los participantes podrán:
1. Comprender la arquitectura completa del sistema
2. Instalar y configurar el proyecto localmente
3. Navegar y utilizar todas las funcionalidades
4. Entender la estructura de la base de datos
5. Realizar mantenimiento y mejoras al sistema

---

# 📺 GUIÓN POR SECCIONES

---

## SECCIÓN 1: INTRODUCCIÓN Y CONTEXTO
**⏱️ Duración: 2-3 minutos**

### 🎬 ESCENA 1.1 - Apertura [0:00-0:30]

**[VISUAL: Logo animado del Banco de Alimentos + música suave de fondo]**

**NARRADOR:**
> "Bienvenidos a la capacitación completa del **Banco de Alimentos Virtual**, una plataforma innovadora que conecta la generosidad con la necesidad. En este video aprenderás todo lo necesario para entender, implementar y utilizar este sistema que está cambiando vidas en nuestra comunidad."

**[VISUAL: Transición a pantalla con puntos clave]**

---

### 🎬 ESCENA 1.2 - Problemática y Solución [0:30-2:00]

**[VISUAL: Estadísticas sobre desperdicio de alimentos e inseguridad alimentaria]**

**NARRADOR:**
> "Cada año, millones de toneladas de alimentos se desperdician mientras miles de personas enfrentan inseguridad alimentaria. Nuestra plataforma resuelve este problema mediante:"

**[VISUAL: Animación mostrando 4 puntos]**

1. **Conectar donantes con beneficiarios** de forma rápida y segura
2. **Reducir el desperdicio** mediante alertas de vencimiento
3. **Facilitar el voluntariado** con eventos coordinados
4. **Transparentar las donaciones monetarias** con seguimiento en tiempo real

---

### 🎬 ESCENA 1.3 - Visión General del Sistema [2:00-3:00]

**[VISUAL: Diagrama de arquitectura simplificado]**

**NARRADOR:**
> "El sistema está construido con tecnologías modernas y escalables:"

**[MOSTRAR en pantalla mientras se menciona cada tecnología]**

- ⚛️ **Frontend:** Next.js 14 con TypeScript
- 🎨 **UI:** Tailwind CSS + shadcn/ui  
- 🗄️ **Backend:** Supabase (PostgreSQL + Auth + Storage)
- 🗺️ **Mapas:** React Leaflet
- 📊 **Gráficos:** Recharts

**NARRADOR:**
> "Esta arquitectura nos permite tener una aplicación rápida, segura y fácil de mantener."

---

## SECCIÓN 2: ARQUITECTURA TÉCNICA
**⏱️ Duración: 5-6 minutos**

### 🎬 ESCENA 2.1 - Estructura del Proyecto [3:00-4:30]

**[VISUAL: Captura del VS Code mostrando la estructura de carpetas]**

**NARRADOR:**
> "Analicemos la estructura del proyecto. Como pueden ver, seguimos las mejores prácticas de Next.js 14 con App Router."

**[ZOOM a cada carpeta mientras se explica]**

```
📁 app/
   ├── admin/          → Panel administrativo
   ├── alimentos/      → Gestión de donaciones
   ├── auth/           → Autenticación
   ├── campanas/       → Campañas solidarias
   ├── dashboard/      → Dashboard principal
   ├── eventos/        → Eventos de voluntariado
   ├── mapa/          → Mapa interactivo
   └── perfil/        → Perfil de usuario

📁 components/
   ├── auth/          → Componentes de autenticación
   ├── chat/          → Widget de soporte
   ├── layout/        → Navbar y layouts
   └── ui/            → Componentes reutilizables

📁 lib/
   ├── auth.ts        → Lógica de autenticación
   ├── supabase.ts    → Cliente de Supabase
   └── utils.ts       → Utilidades generales

📁 scripts/
   ├── 01-create-tables.sql    → Creación de tablas
   └── 02-seed-data.sql        → Datos de prueba
```

---

### 🎬 ESCENA 2.2 - Base de Datos [4:30-7:00]

**[VISUAL: Diagrama entidad-relación en pantalla]**

**NARRADOR:**
> "La base de datos es el corazón del sistema. Tenemos 12 tablas principales organizadas en módulos:"

**[MOSTRAR diagrama con colores por módulo]**

#### **🔐 MÓDULO DE USUARIOS**
```sql
-- Tabla: profiles
```
**NARRADOR:**
> "La tabla `profiles` extiende la autenticación de Supabase con roles específicos: donante, beneficiario, voluntario y administrador. Cada perfil almacena información de contacto, ubicación y verificación."

**[HIGHLIGHT en el diagrama: profiles → roles]**

---

#### **🍎 MÓDULO DE ALIMENTOS**
```sql
-- Tablas: food_categories, food_items, food_requests
```

**NARRADOR:**
> "El módulo de alimentos maneja el ciclo completo de donación:"

**[ANIMACIÓN del flujo]**

1. **food_categories** → Categorización (frutas, lácteos, etc.)
2. **food_items** → Registro de donaciones con:
   - Descripción y cantidad
   - Fecha de vencimiento
   - Ubicación de recogida (latitud/longitud)
   - Estado: disponible, reservado, entregado, expirado
3. **food_requests** → Solicitudes de beneficiarios
   - Estado: pendiente, aprobada, rechazada, completada

---

#### **📅 MÓDULO DE EVENTOS**
```sql
-- Tablas: volunteer_events, event_participants
```

**NARRADOR:**
> "Los eventos coordinan el voluntariado. Cada evento tiene una fecha, ubicación, límite de participantes y descripción. Los voluntarios se registran y el sistema controla automáticamente las plazas disponibles."

---

#### **💝 MÓDULO DE CAMPAÑAS**
```sql
-- Tablas: campaigns, monetary_donations
```

**NARRADOR:**
> "Las campañas solidarias permiten donaciones monetarias para causas específicas. Cada campaña tiene una meta, seguimiento del progreso y fechas de inicio y fin."

---

#### **🔔 MÓDULO DE NOTIFICACIONES**
```sql
-- Tabla: notifications
```

**NARRADOR:**
> "El sistema de notificaciones mantiene a los usuarios informados sobre solicitudes, eventos, campañas y actualizaciones del sistema."

---

### 🎬 ESCENA 2.3 - Seguridad con RLS [7:00-9:00]

**[VISUAL: Código SQL de políticas RLS en pantalla]**

**NARRADOR:**
> "La seguridad es fundamental. Implementamos Row Level Security (RLS) en todas las tablas, asegurando que cada usuario solo acceda a sus propios datos."

**[MOSTRAR ejemplos de políticas]**

```sql
-- Ejemplo: Solo el donante ve sus alimentos
CREATE POLICY "Users can view own food items"
ON food_items FOR SELECT
USING (donor_id = auth.uid());

-- Ejemplo: Administradores ven todo
CREATE POLICY "Admins can view all"
ON food_items FOR SELECT
USING (is_admin());
```

**NARRADOR:**
> "Esto significa que aunque alguien obtenga acceso no autorizado, PostgreSQL bloqueará automáticamente cualquier dato al que no tenga permiso."

**[VISUAL: Diagrama de seguridad en capas]**

---

## SECCIÓN 3: INSTALACIÓN Y CONFIGURACIÓN
**⏱️ Duración: 4-5 minutos**

### 🎬 ESCENA 3.1 - Requisitos Previos [9:00-9:45]

**[VISUAL: Pantalla dividida mostrando instalaciones]**

**NARRADOR:**
> "Antes de comenzar, necesitarás tener instalado:"

**[CHECKLIST animado]**

✅ **Node.js 18+** (recomendado 20+)  
✅ **npm, yarn o pnpm** (usamos pnpm en este proyecto)  
✅ **Git** para control de versiones  
✅ **Editor de código** (recomendado: VS Code)  
✅ **Cuenta de Supabase** (gratis)

---

### 🎬 ESCENA 3.2 - Clonar e Instalar [9:45-11:00]

**[VISUAL: Terminal en pantalla completa]**

**NARRADOR:**
> "Comencemos clonando el repositorio e instalando las dependencias."

**[ESCRIBIR en terminal mientras se narra]**

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/BancoAlimentos.git
cd BancoAlimentos

# 2. Instalar dependencias
pnpm install

# Esperar a que termine...
```

**NARRADOR:**
> "Esto instalará todas las librerías necesarias: Next.js, React, Supabase, Tailwind, y más de 40 componentes de UI."

---

### 🎬 ESCENA 3.3 - Configurar Supabase [11:00-13:30]

**[VISUAL: Split screen - Terminal + Navegador con Supabase]**

**NARRADOR:**
> "Ahora configuraremos Supabase, nuestro backend."

#### **Paso 1: Crear Proyecto**

**[MOSTRAR en navegador]**

1. Ve a **supabase.com**
2. Clic en **"New Project"**
3. Completa:
   - Name: "banco-alimentos"
   - Database Password: **[generar contraseña segura]**
   - Region: **[seleccionar más cercana]**

**NARRADOR:**
> "Espera 2-3 minutos mientras Supabase provisiona tu base de datos PostgreSQL."

---

#### **Paso 2: Ejecutar Scripts SQL**

**[VISUAL: SQL Editor de Supabase]**

**NARRADOR:**
> "Una vez listo, ve al SQL Editor y ejecuta los scripts en orden:"

**[MOSTRAR proceso paso a paso]**

1. Abre `scripts/01-create-tables-improved.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor
4. Clic en **"Run"**

**[ESPERAR y mostrar mensaje de éxito]**

**NARRADOR:**
> "Este script crea todas las tablas, triggers, funciones y políticas de seguridad."

5. Repite con `scripts/02-seed-data-improved.sql`

**NARRADOR:**
> "Este segundo script inserta datos de prueba: categorías, usuarios de ejemplo y donaciones de muestra."

---

#### **Paso 3: Configurar Variables de Entorno**

**[VISUAL: VS Code mostrando archivo .env]**

**NARRADOR:**
> "Finalmente, crea un archivo `.env.local` en la raíz del proyecto:"

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-aqui
```

**[MOSTRAR dónde obtener estas credenciales en Supabase]**

**NARRADOR:**
> "Estas credenciales las encuentras en Settings → API de tu proyecto Supabase."

---

### 🎬 ESCENA 3.4 - Primera Ejecución [13:30-14:30]

**[VISUAL: Terminal en pantalla completa]**

**NARRADOR:**
> "¡Estamos listos para ejecutar el proyecto!"

```bash
pnpm dev
```

**[MOSTRAR salida de terminal]**

```
▲ Next.js 15.2.4
- Local:        http://localhost:3000
- Ready in 2.1s
```

**[NAVEGADOR abre en localhost:3000]**

**NARRADOR:**
> "¡Perfecto! El sistema está corriendo. Ahora exploremos todas las funcionalidades."

---

## SECCIÓN 4: FUNCIONALIDADES - DEMO COMPLETA
**⏱️ Duración: 12-15 minutos**

### 🎬 ESCENA 4.1 - Sistema de Autenticación [14:30-16:00]

**[VISUAL: Página de login en pantalla]**

**NARRADOR:**
> "Comencemos con el sistema de autenticación. La aplicación soporta múltiples roles con permisos diferenciados."

#### **Demo: Registro de Usuario**

**[HACER en pantalla]**

1. Clic en **"Registrarse"**
2. Completar formulario:
   ```
   Nombre: Juan Pérez
   Email: juan@ejemplo.com
   Password: [contraseña segura]
   Rol: Donante
   Teléfono: +52 123 456 7890
   Ciudad: Guadalajara
   ```
3. Clic en **"Registrarse"**

**NARRADOR:**
> "El sistema crea automáticamente el perfil en la tabla `profiles` y envía un email de verificación."

**[MOSTRAR bandeja de entrada con email de verificación]**

---

#### **Demo: Login**

**[HACER en pantalla]**

1. Usar credenciales de prueba:
   ```
   Email: donante@test.com
   Password: Test123!
   ```
2. Clic en **"Iniciar Sesión"**

**[REDIRIGE a dashboard]**

**NARRADOR:**
> "Al iniciar sesión, el sistema valida las credenciales con Supabase Auth, verifica el rol del usuario y lo redirige al dashboard personalizado."

---

### 🎬 ESCENA 4.2 - Gestión de Donaciones [16:00-18:30]

**[VISUAL: Página de alimentos]**

**NARRADOR:**
> "Esta es la funcionalidad central: gestionar donaciones de alimentos."

#### **Demo: Ver Alimentos Disponibles**

**[NAVEGAR por la lista]**

**NARRADOR:**
> "Los usuarios pueden ver todos los alimentos disponibles con información detallada:"

**[SEÑALAR cada elemento en una tarjeta]**

- 📸 Imagen del producto
- 📝 Nombre y descripción
- 📊 Cantidad y unidad
- 📅 Fecha de vencimiento
- 📍 Ubicación de recogida
- 👤 Información del donante

**[USAR filtros]**

**NARRADOR:**
> "Los filtros permiten buscar por nombre, categoría o estado."

---

#### **Demo: Donar Alimentos (Donante)**

**[NAVEGAR a Alimentos → Nuevo]**

**NARRADOR:**
> "Como donante, registrar una donación es muy sencillo:"

**[COMPLETAR formulario paso a paso]**

```
Nombre: Manzanas Rojas
Descripción: Manzanas orgánicas en excelente estado
Categoría: Frutas
Cantidad: 20
Unidad: kilogramos
Fecha de Vencimiento: [7 días desde hoy]
Ubicación: Guadalajara, Jalisco
Latitud: 20.6597 (autocompletado)
Longitud: -103.3496 (autocompletado)
```

**[SUBIR imagen]**

**NARRADOR:**
> "Podemos agregar una foto del producto. El sistema la almacena en Supabase Storage."

**[CLICK en Registrar Donación]**

**[MOSTRAR mensaje de éxito y redirección]**

**NARRADOR:**
> "¡Listo! La donación está ahora disponible para beneficiarios."

---

#### **Demo: Solicitar Alimentos (Beneficiario)**

**[CAMBIAR a cuenta de beneficiario]**

**NARRADOR:**
> "Ahora veamos cómo un beneficiario solicita alimentos."

**[HACER en pantalla]**

1. Navegar a **Alimentos**
2. Ver las manzanas recién donadas
3. Clic en **"Ver Detalles"**
4. Revisar información
5. Clic en **"Solicitar Alimento"**

**[MOSTRAR diálogo de confirmación]**

**NARRADOR:**
> "Al confirmar, se crea una solicitud en la base de datos y se notifica automáticamente al donante."

---

#### **Demo: Aprobar Solicitud (Donante)**

**[VOLVER a cuenta de donante]**

**[MOSTRAR notificación nueva]**

**NARRADOR:**
> "El donante recibe una notificación instantánea de la nueva solicitud."

**[NAVEGAR a la notificación]**

1. Clic en **notificación**
2. Ver detalles del solicitante
3. Clic en **"Aprobar Solicitud"**

**[MOSTRAR cambio de estado]**

**NARRADOR:**
> "El sistema actualiza el estado de la donación a 'reservado' y notifica al beneficiario para coordinar la entrega."

---

### 🎬 ESCENA 4.3 - Mapa Interactivo [18:30-20:00]

**[VISUAL: Página del mapa]**

**NARRADOR:**
> "El mapa interactivo es una herramienta poderosa para visualizar recursos cercanos."

**[HACER zoom out para ver todos los marcadores]**

**NARRADOR:**
> "Observen cómo el mapa muestra:"

**[SEÑALAR cada tipo de marcador]**

- 🍽️ **Marcadores verdes:** Alimentos disponibles
- 📅 **Marcadores azules:** Eventos de voluntariado
- 🏢 **Marcadores naranjas:** Organizaciones beneficiarias

---

#### **Demo: Filtros del Mapa**

**[USAR los filtros]**

**NARRADOR:**
> "Podemos filtrar por tipo de recurso..."

**[ACTIVAR/DESACTIVAR cada filtro]**

1. Solo alimentos → Ver únicamente donaciones
2. Solo eventos → Ver actividades de voluntariado
3. Solo organizaciones → Ver centros de distribución

---

#### **Demo: Geolocalización**

**[CLIC en botón "Mi Ubicación"]**

**NARRADOR:**
> "El sistema puede usar la ubicación del usuario para mostrar recursos cercanos."

**[MAPA se centra en ubicación actual]**

**[CLIC en un marcador cercano]**

**NARRADOR:**
> "Al hacer clic en un marcador, vemos los detalles completos y la distancia desde nuestra ubicación."

**[MOSTRAR popup con información]**

```
📍 Manzanas Rojas
🎯 1.2 km de distancia
📅 Vence en 7 días
📦 20 kg disponibles
```

---

### 🎬 ESCENA 4.4 - Eventos de Voluntariado [20:00-22:00]

**[VISUAL: Página de eventos]**

**NARRADOR:**
> "Los eventos coordinan el trabajo voluntario y las actividades comunitarias."

#### **Demo: Ver Eventos**

**[NAVEGAR por la lista de eventos]**

**NARRADOR:**
> "Cada evento muestra información clave:"

**[SEÑALAR elementos en una tarjeta]**

- 📅 Fecha y hora
- 📍 Ubicación
- 👥 Voluntarios registrados / máximo
- 📝 Descripción de actividades
- ⚡ Estado: programado, en curso, completado

---

#### **Demo: Registrarse en Evento**

**[CLIC en un evento]**

**NARRADOR:**
> "Registrarse es muy simple:"

1. Ver detalles completos del evento
2. Clic en **"Unirse al Evento"**
3. Confirmar participación

**[MOSTRAR confirmación]**

**NARRADOR:**
> "El contador de voluntarios se actualiza automáticamente mediante un trigger en la base de datos."

**[SEÑALAR contador: "24/50 voluntarios"]**

---

#### **Demo: Crear Evento (Voluntario/Admin)**

**[NAVEGAR a Crear Evento]**

**NARRADOR:**
> "Los voluntarios experimentados y administradores pueden crear nuevos eventos:"

**[COMPLETAR formulario]**

```
Título: Distribución de Alimentos - Zona Norte
Descripción: Jornada de entrega en comunidades vulnerables
Fecha: [próximo sábado]
Hora: 09:00 AM
Ubicación: Centro Comunitario Norte
Máx. Voluntarios: 30
Tipo: Distribución
```

**[CLIC en Crear Evento]**

**NARRADOR:**
> "El evento queda registrado y visible para todos los usuarios en el mapa y la lista de eventos."

---

### 🎬 ESCENA 4.5 - Campañas Solidarias [22:00-23:30]

**[VISUAL: Página de campañas]**

**NARRADOR:**
> "Las campañas solidarias permiten recaudar fondos para causas específicas con total transparencia."

#### **Demo: Ver Campañas Activas**

**[MOSTRAR lista de campañas]**

**NARRADOR:**
> "Cada campaña incluye:"

**[SEÑALAR elementos]**

- 🎯 Meta monetaria
- 📊 Progreso actual (barra visual)
- 📅 Fecha de inicio y fin
- 📝 Descripción de la causa
- 💵 Total recaudado
- 👥 Número de donantes

---

#### **Demo: Realizar Donación Monetaria**

**[CLIC en una campaña]**

1. Ver detalles completos
2. Seleccionar monto ($10, $25, $50, o personalizado)
3. Ingresar $50
4. Clic en **"Donar Ahora"**

**[MOSTRAR simulación de pago]**

**NARRADOR:**
> "En producción, esto integraría con pasarelas de pago como Stripe o PayPal. Por ahora, simula el proceso."

**[MOSTRAR actualización de progreso]**

**NARRADOR:**
> "La barra de progreso se actualiza instantáneamente gracias a triggers en la base de datos que suman automáticamente las donaciones."

---

### 🎬 ESCENA 4.6 - Panel Administrativo [23:30-25:30]

**[VISUAL: Login como administrador]**

**NARRADOR:**
> "El panel administrativo proporciona control total del sistema."

**[USAR credenciales de admin]**

```
Email: admin@test.com
Password: Admin123!
```

---

#### **Demo: Dashboard de Estadísticas**

**[MOSTRAR dashboard]**

**NARRADOR:**
> "El dashboard muestra métricas clave en tiempo real:"

**[SEÑALAR cada sección]**

**📊 Tarjetas de Resumen:**
- 👤 Total de usuarios (por rol)
- 🍎 Alimentos donados
- 📋 Solicitudes completadas
- 💰 Dinero recaudado

**📈 Gráficos:**
- Donaciones por mes (línea de tiempo)
- Distribución por categoría (pie chart)
- Eventos por estado (barras)
- Usuarios activos (área)

**📋 Actividad Reciente:**
- Últimas donaciones
- Nuevos registros
- Solicitudes pendientes

---

#### **Demo: Gestión de Usuarios**

**[NAVEGAR a sección de usuarios]**

**NARRADOR:**
> "Los administradores pueden ver y gestionar todos los usuarios:"

**[MOSTRAR tabla de usuarios]**

**Funcionalidades disponibles:**
- 🔍 Buscar por nombre o email
- 🎭 Filtrar por rol
- ✅ Verificar/desverificar usuarios
- 🚫 Suspender cuentas
- 📊 Ver estadísticas individuales

---

#### **Demo: Gestión de Contenido**

**[NAVEGAR entre secciones]**

**NARRADOR:**
> "Los administradores tienen control total sobre:"

1. **Alimentos:** Aprobar, editar o eliminar donaciones
2. **Eventos:** Revisar y aprobar eventos creados por usuarios
3. **Campañas:** Crear, editar o finalizar campañas
4. **Categorías:** Agregar nuevas categorías de alimentos

---

### 🎬 ESCENA 4.7 - Perfil de Usuario [25:30-26:30]

**[VISUAL: Página de perfil]**

**NARRADOR:**
> "Cada usuario tiene un perfil personalizado con su impacto individual."

**[MOSTRAR secciones del perfil]**

#### **Información Personal**
- 📸 Avatar (editable)
- 📝 Datos de contacto
- 📍 Ubicación
- ✅ Estado de verificación

#### **Estadísticas Personales**

**[SEÑALAR métricas según el rol]**

**Para Donantes:**
- 📦 Total de alimentos donados
- ✅ Donaciones completadas
- 🎯 Tasa de aprobación
- 💚 Impacto (kg donados)

**Para Beneficiarios:**
- 📋 Solicitudes realizadas
- ✅ Solicitudes aprobadas
- 📦 Alimentos recibidos

**Para Voluntarios:**
- 📅 Eventos participados
- ⏰ Horas de servicio
- 🏆 Insignias ganadas

---

#### **Demo: Editar Perfil**

**[CLIC en Editar Perfil]**

1. Cambiar foto de perfil
2. Actualizar teléfono
3. Modificar dirección
4. Guardar cambios

**NARRADOR:**
> "Los cambios se guardan instantáneamente en Supabase."

---

### 🎬 ESCENA 4.8 - Chat de Soporte [26:30-27:30]

**[VISUAL: Widget de chat en esquina inferior derecha]**

**NARRADOR:**
> "El sistema incluye un asistente virtual para ayudar a los usuarios."

**[CLIC en el widget de chat]**

**[VENTANA de chat se expande]**

#### **Demo: Uso del Chat**

**[ESCRIBIR pregunta]**

```
Usuario: ¿Cómo puedo donar alimentos?
```

**[MOSTRAR respuesta automática]**

```
Bot: ¡Hola! Para donar alimentos:
1. Ve a la sección "Alimentos"
2. Haz clic en "Donar Alimentos"
3. Completa el formulario con los detalles
4. ¡Listo! Tu donación estará disponible

¿Necesitas ayuda con algo más?
```

**NARRADOR:**
> "El chatbot utiliza contexto inteligente según la página donde se encuentra el usuario y puede responder preguntas frecuentes sobre donaciones, solicitudes, eventos y más."

---

## SECCIÓN 5: MANUAL DE USUARIO DETALLADO
**⏱️ Duración: 3-4 minutos**

### 🎬 ESCENA 5.1 - Guías por Rol [27:30-29:00]

**[VISUAL: Animación dividida en 3 columnas]**

**NARRADOR:**
> "El manual de usuario proporciona guías específicas para cada rol."

---

#### **👤 PARA DONANTES**

**[MOSTRAR checklist animado]**

**NARRADOR:**
> "Los donantes deben seguir estas mejores prácticas:"

✅ **Donar alimentos en buen estado**
- Verificar que no estén vencidos
- Asegurar buenas condiciones de almacenamiento
- Ser honesto con las fechas de caducidad

✅ **Proporcionar información precisa**
- Descripción detallada del producto
- Cantidad exacta
- Instrucciones claras de recogida

✅ **Responder rápidamente**
- Revisar solicitudes diariamente
- Comunicarse con beneficiarios
- Coordinar entregas eficientemente

❌ **Evitar:**
- Alimentos vencidos o en mal estado
- Productos sin etiquetas de información
- Alimentos que requieren refrigeración sin garantía

---

#### **👥 PARA BENEFICIARIOS**

**[MOSTRAR guía paso a paso]**

**NARRADOR:**
> "Los beneficiarios pueden maximizar su acceso a alimentos:"

✅ **Búsqueda efectiva**
- Usar filtros para encontrar lo necesario
- Verificar ubicaciones cercanas en el mapa
- Revisar fechas de vencimiento

✅ **Solicitar responsablemente**
- Solo solicitar lo que realmente necesitan
- Coordinar recogida en tiempo acordado
- Confirmar recepción en el sistema

✅ **Mantener buena reputación**
- Cumplir compromisos de recogida
- Comunicar si no pueden recoger
- Agradecer a los donantes

---

#### **🤝 PARA VOLUNTARIOS**

**[MOSTRAR calendario de eventos]**

**NARRADOR:**
> "Los voluntarios son el motor de la comunidad:"

✅ **Participación activa**
- Registrarse en eventos con anticipación
- Llegar puntual el día del evento
- Seguir instrucciones del coordinador

✅ **Compromiso**
- Solo registrarse si pueden asistir
- Avisar si no pueden participar
- Documentar su experiencia

✅ **Crear comunidad**
- Invitar a amigos y familiares
- Compartir eventos en redes sociales
- Proponer nuevas iniciativas

---

### 🎬 ESCENA 5.2 - Seguridad y Buenas Prácticas [29:00-30:30]

**[VISUAL: Íconos de seguridad]**

**NARRADOR:**
> "La seguridad es responsabilidad de todos. Sigue estas recomendaciones:"

#### **🔒 Seguridad de Cuenta**

✅ Usar contraseñas fuertes (mínimo 8 caracteres)
✅ Nunca compartir tu contraseña
✅ Cerrar sesión en dispositivos compartidos
✅ Verificar tu email para mayor seguridad

#### **🤝 Seguridad en Entregas**

✅ Coordinarse en lugares públicos y seguros
✅ Preferir horarios diurnos
✅ Informar a alguien sobre la reunión
✅ Verificar identidad usando la plataforma

❌ **NUNCA:**
- Compartir información bancaria
- Realizar pagos fuera de la plataforma
- Encontrarse en lugares privados con desconocidos
- Ignorar señales de alarma

#### **📱 Privacidad**

**NARRADOR:**
> "El sistema protege tu información personal. Solo se comparte lo necesario para coordinar donaciones. Puedes:"

- Ver qué información es pública
- Ajustar configuración de privacidad
- Reportar usuarios sospechosos
- Eliminar tu cuenta cuando desees

---

## SECCIÓN 6: MANTENIMIENTO Y MEJORAS
**⏱️ Duración: 2-3 minutos**

### 🎬 ESCENA 6.1 - Estructura del Código [30:30-31:30]

**[VISUAL: VS Code con código]**

**NARRADOR:**
> "Para desarrolladores que necesiten mantener o mejorar el sistema, aquí hay puntos clave:"

#### **Componentes Reutilizables**

**[MOSTRAR carpeta components/ui]**

**NARRADOR:**
> "Usamos shadcn/ui, una colección de componentes accesibles y personalizables. Todos están en `components/ui` y pueden modificarse según necesidades."

#### **Gestión de Estado**

**[MOSTRAR código con hooks]**

**NARRADOR:**
> "El estado se maneja con React hooks nativos y Supabase realtime. Para agregar nuevas funcionalidades en tiempo real, utiliza las suscripciones de Supabase."

#### **Rutas y Navegación**

**[MOSTRAR carpeta app]**

**NARRADOR:**
> "El routing es file-based con Next.js App Router. Cada carpeta en `app` es una ruta. Para agregar páginas nuevas, solo crea una carpeta con un `page.tsx`."

---

### 🎬 ESCENA 6.2 - Agregar Funcionalidades [31:30-32:30]

**[VISUAL: Ejemplo de código]**

**NARRADOR:**
> "Veamos un ejemplo rápido de cómo agregar una nueva funcionalidad."

#### **Ejemplo: Agregar Sistema de Calificaciones**

**[MOSTRAR código paso a paso]**

**1. Crear tabla en Supabase**
```sql
CREATE TABLE ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  donation_id uuid REFERENCES food_items(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp DEFAULT NOW()
);
```

**2. Crear componente React**
```typescript
// components/ratings/rating-form.tsx
export function RatingForm({ donationId }: Props) {
  // Lógica del componente
}
```

**3. Integrar en la página**
```typescript
// app/alimentos/[id]/page.tsx
import { RatingForm } from '@/components/ratings/rating-form'
```

**NARRADOR:**
> "Así de simple es extender el sistema gracias a su arquitectura modular."

---

### 🎬 ESCENA 6.3 - Deployment [32:30-33:30]

**[VISUAL: Logos de plataformas de deployment]**

**NARRADOR:**
> "Para poner el sistema en producción, recomendamos Vercel para el frontend y Supabase para el backend."

#### **Pasos de Deployment**

**[MOSTRAR comandos y pasos]**

**1. Preparar el Proyecto**
```bash
# Asegurar que todo funciona localmente
pnpm build
pnpm start
```

**2. Configurar Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**3. Configurar Variables de Entorno en Vercel**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

**4. Configurar Dominio Custom** (opcional)

**NARRADOR:**
> "Vercel maneja automáticamente SSL, CDN y optimizaciones. Tu sitio estará disponible globalmente en minutos."

---

## SECCIÓN 7: CONCLUSIÓN Y RECURSOS
**⏱️ Duración: 1-2 minutos**

### 🎬 ESCENA 7.1 - Resumen de Características [33:30-34:00]

**[VISUAL: Grid animado con todas las características]**

**NARRADOR:**
> "En resumen, el Banco de Alimentos Virtual incluye:"

**[MOSTRAR íconos animados]**

✅ Sistema de autenticación con múltiples roles  
✅ Gestión completa de donaciones  
✅ Mapa interactivo geolocalizado  
✅ Eventos de voluntariado  
✅ Campañas solidarias  
✅ Panel administrativo robusto  
✅ Notificaciones en tiempo real  
✅ Chat de soporte inteligente  
✅ Seguridad de nivel empresarial  
✅ Diseño responsive y accesible  

---

### 🎬 ESCENA 7.2 - Recursos Adicionales [34:00-34:45]

**[VISUAL: Lista de recursos en pantalla]**

**NARRADOR:**
> "Para seguir aprendiendo y obtener ayuda, consulta estos recursos:"

📚 **Documentación del Proyecto**
- README.md - Visión general técnica
- MANUAL_USUARIO.md - Guía completa de uso
- ANALISIS_BASE_DE_DATOS.md - Detalles de la BD

🔗 **Enlaces Útiles**
- Next.js Docs: nextjs.org/docs
- Supabase Docs: supabase.com/docs
- Tailwind CSS: tailwindcss.com/docs
- shadcn/ui: ui.shadcn.com

💬 **Soporte**
- GitHub Issues para reportar bugs
- Email: soporte@bancoalimentos.org
- Comunidad Discord (si aplica)

---

### 🎬 ESCENA 7.3 - Llamado a la Acción [34:45-35:30]

**[VISUAL: Imágenes inspiradoras de impacto social]**

**NARRADOR:**
> "El Banco de Alimentos Virtual es más que una aplicación, es una herramienta para transformar comunidades."

**[MOSTRAR estadísticas de impacto]**

**Con esta plataforma, puedes:**
- 🍎 Reducir desperdicio de alimentos
- ❤️ Ayudar a familias necesitadas
- 🤝 Coordinar voluntariado eficientemente
- 💰 Transparentar donaciones monetarias
- 📊 Medir impacto social real

**NARRADOR:**
> "Te invitamos a implementar, personalizar y mejorar este sistema. Cada línea de código que agregues puede cambiar vidas."

---

### 🎬 ESCENA 7.4 - Cierre [35:30-36:00]

**[VISUAL: Logo del Banco de Alimentos con música inspiradora]**

**NARRADOR:**
> "Gracias por completar esta capacitación. Ahora tienes el conocimiento para instalar, utilizar y mantener el Banco de Alimentos Virtual."

**[TEXTO EN PANTALLA]**
```
🌟 JUNTOS PODEMOS HACER LA DIFERENCIA 🌟

Banco de Alimentos Virtual
Conectando generosidad con necesidad

© 2026 - Open Source
```

**NARRADOR:**
> "Recuerda: La tecnología es el medio, la solidaridad es el fin. ¡Adelante!"

**[FADE OUT con música]**

---

## 📋 NOTAS DE PRODUCCIÓN

### 🎨 Elementos Visuales Necesarios

1. **Intro/Outro**
   - Logo animado del proyecto
   - Música de fondo (libre de derechos)
   - Transiciones suaves

2. **Capturas de Pantalla**
   - Todas las páginas del sistema
   - Flujos de usuario completos
   - Dashboard con datos

3. **Diagramas**
   - Arquitectura del sistema
   - Modelo entidad-relación
   - Flujos de datos

4. **Código en Pantalla**
   - Usar tema claro de VS Code
   - Resaltar sintaxis
   - Zoom en partes importantes

### 🎤 Notas para el Narrador

- **Tono:** Profesional pero amigable
- **Velocidad:** Moderada (120-140 palabras/minuto)
- **Pausas:** Después de puntos clave para permitir comprensión
- **Énfasis:** En características importantes y advertencias de seguridad

### 📹 Configuración Técnica

**Resolución:** 1920x1080 (Full HD)  
**Frame Rate:** 30 fps  
**Software recomendado:**
- OBS Studio para grabación de pantalla
- Audacity para audio
- DaVinci Resolve para edición

### ⏱️ Distribución del Tiempo

| Sección | Tiempo | Porcentaje |
|---------|--------|------------|
| Introducción | 3 min | 8% |
| Arquitectura | 6 min | 17% |
| Instalación | 5 min | 14% |
| Demo Funcional | 14 min | 39% |
| Manual Usuario | 4 min | 11% |
| Mantenimiento | 3 min | 8% |
| Conclusión | 1 min | 3% |
| **TOTAL** | **36 min** | **100%** |

---

## 🎯 CHECKLIST PRE-GRABACIÓN

### Preparación del Ambiente

- [ ] Limpiar escritorio y cerrar aplicaciones innecesarias
- [ ] Configurar tema claro en VS Code
- [ ] Tener base de datos con datos de prueba
- [ ] Preparar cuentas de prueba (donante, beneficiario, voluntario, admin)
- [ ] Verificar que todas las funcionalidades funcionan
- [ ] Tener manual de usuario abierto para referencia

### Equipo Técnico

- [ ] Micrófono configurado y probado
- [ ] Cámara (si se incluye presentador)
- [ ] Iluminación adecuada
- [ ] Internet estable
- [ ] Software de grabación listo

### Material de Apoyo

- [ ] Guión impreso o en segunda pantalla
- [ ] Diagramas exportados
- [ ] Credenciales de prueba anotadas
- [ ] URLs importantes guardadas

---

## 💡 TIPS PARA UNA GRABACIÓN EXITOSA

### Durante la Grabación

1. **Practica primero:** Haz un ensayo completo antes de grabar
2. **Habla claramente:** Pronuncia bien cada palabra técnica
3. **Usa pausas:** Permite que la información se asimile
4. **Señala en pantalla:** Usa el cursor para guiar la atención
5. **Mantén ritmo:** No corras ni vayas demasiado lento

### Post-Producción

1. **Edita errores:** Corta partes con errores o tartamudeos
2. **Agrega subtítulos:** Facilita comprensión multiidioma
3. **Inserta marcas de tiempo:** En la descripción del video
4. **Agrega gráficos:** Overlays con puntos clave
5. **Revisa audio:** Elimina ruidos de fondo

### Distribución

1. **YouTube:** Canal principal con capítulos
2. **Playlist:** Crear serie si se divide en partes
3. **Documentación:** Enlazar desde README.md
4. **Redes sociales:** Snippets cortos para promoción

---

## 📌 VARIANTES DEL GUIÓN

### Versión Corta (15 minutos)
Enfocarse solo en:
- Instalación rápida (3 min)
- Demo de funcionalidades principales (10 min)
- Recursos (2 min)

### Versión para Usuarios Finales (20 minutos)
Enfocarse en:
- Cómo usar la plataforma (15 min)
- Mejores prácticas (3 min)
- Seguridad (2 min)

### Versión para Desarrolladores (40 minutos)
Incluir adicionalmente:
- Deep dive en código (10 min)
- Patrones de diseño usados (5 min)
- Extensiones y personalizaciones (5 min)

---

## ✅ CHECKLIST POST-PRODUCCIÓN

- [ ] Video exportado en múltiples resoluciones
- [ ] Audio normalizado (-14 LUFS para YouTube)
- [ ] Subtítulos generados y revisados
- [ ] Thumbnail atractivo diseñado
- [ ] Descripción con timestamps
- [ ] Enlace a repositorio incluido
- [ ] Archivos de proyecto documentados

---

**¡Todo listo para crear un video de capacitación profesional y completo!** 🎬✨
