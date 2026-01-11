# 🛠️ Guía de Desarrollador - Banco de Alimentos Virtual

<div align="center">
  <h3>Para Contribuidores y Mantenedores del Proyecto</h3>
  <p>
    <a href="#-inicio-rápido">Inicio Rápido</a> •
    <a href="#-arquitectura">Arquitectura</a> •
    <a href="#-desarrollo">Desarrollo</a> •
    <a href="#-api--base-de-datos">API & BD</a> •
    <a href="#-testing">Testing</a> •
    <a href="#-despliegue">Despliegue</a>
  </p>
</div>

---

## 📋 Tabla de Contenidos

1. [Inicio Rápido](#-inicio-rápido)
2. [Arquitectura General](#-arquitectura)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura de Carpetas](#-estructura-de-carpetas)
5. [Guía de Desarrollo](#-desarrollo)
6. [Base de Datos](#-base-de-datos)
7. [API y Rutas](#-api--rutas)
8. [Componentes](#-componentes)
9. [Testing](#-testing)
10. [Despliegue](#-despliegue)
11. [Buenas Prácticas](#-buenas-prácticas)
12. [Troubleshooting](#-troubleshooting)

---

## 🚀 Inicio Rápido

### Requisitos Previos

```bash
# Verificar versiones requeridas
node --version    # v18.17+
npm --version     # 9.0+
git --version     # 2.40+
```

### Setup Inicial (5 minutos)

```bash
# 1. Clonar y entrar al proyecto
git clone https://github.com/OscarMeza24/BancoDeAlimentos.git
cd "BancoAlimentos - Vinculacion"

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Actualizar .env.local con tus credenciales de Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# 5. Iniciar servidor de desarrollo
npm run dev

# ✅ Visita http://localhost:3000
```

### Primeras Acciones

1. **Configurar Git**
   ```bash
   git config user.name "Tu Nombre"
   git config user.email "tu.email@example.com"
   git remote -v  # Verificar repositorio
   ```

2. **Crear rama de feature**
   ```bash
   git checkout -b feature/nombre-feature
   ```

3. **Linting antes de commitear**
   ```bash
   npm run lint:fix
   ```

---

## 🏗️ Arquitectura

### Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 16 (Frontend)                  │
├─────────────────────────────────────────────────────────────┤
│  ├─ App Router (app/)                                       │
│  ├─ React Components (components/)                          │
│  ├─ Hooks personalizados (hooks/)                           │
│  └─ Utilidades y librerías (lib/)                           │
├─────────────────────────────────────────────────────────────┤
│  TypeScript + Tailwind CSS + shadcn/ui                      │
├─────────────────────────────────────────────────────────────┤
│                    HTTP / WebSockets                         │
├─────────────────────────────────────────────────────────────┤
│                    Supabase (Backend)                        │
├─────────────────────────────────────────────────────────────┤
│  ├─ PostgreSQL (Base de datos)                              │
│  ├─ Auth (Autenticación JWT)                                │
│  ├─ Storage (S3 compatible)                                 │
│  └─ Realtime (WebSockets)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
Usuario
   ↓
[Login/Register] → Supabase Auth
   ↓
[JWT Token] ← Supabase
   ↓
[Almacenar en sesión]
   ↓
[Requests con token] → API Supabase
   ↓
[Row Level Security] → Base de datos
```

### Roles y Permisos

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Donante    │ Beneficiario │  Voluntario  │ Administrador│
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ✓ Donar      │ ✓ Solicitar  │ ✓ Unirse evt │ ✓ Todo       │
│ ✓ Editar     │ ✓ Ver mapa   │ ✓ Ver mapa   │ ✓ Moderar    │
│ ✓ Ver mapa   │ ✓ Donar $    │ ✓ Crear evt  │ ✓ Reportes   │
│ ✓ Voluntario │ ✓ Voluntario │ ✓ Donar $    │ ✓ Usuarios   │
│ ✓ Donar $    │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 🛠️ Stack Tecnológico

### Frontend (Client-side)

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 16.1 | Framework React/SSR |
| **React** | 19 | Librería UI |
| **TypeScript** | 5 | Tipado estático |
| **Tailwind CSS** | 3.4 | Estilos utilitarios |
| **shadcn/ui** | Latest | Componentes base |
| **React Hook Form** | 7.54 | Gestión de formularios |
| **Zod** | 3.24 | Validación de datos |
| **React Leaflet** | 5.0 | Mapas interactivos |
| **Recharts** | 2.15 | Gráficos |
| **Lucide React** | 0.454 | Iconos |

### Backend & Data

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Supabase** | Latest | BaaS completo |
| **PostgreSQL** | 15+ | Base de datos |
| **Supabase Auth** | Latest | JWT/Auth |
| **Supabase Storage** | Latest | Almacenamiento S3 |
| **Realtime** | - | WebSockets |
| **Row Level Security** | - | Seguridad |

### Herramientas de Desarrollo

| Herramienta | Uso |
|------------|-----|
| **ESLint** | Linting |
| **Prettier** | Formateo |
| **TypeScript** | Tipado |
| **Git** | Versionamiento |
| **Vercel** | Deployment |

---

## 📁 Estructura de Carpetas

```
BancoAlimentos/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Layout raíz
│   ├── page.tsx                      # Home page
│   ├── globals.css                   # Estilos globales
│   │
│   ├── auth/                         # Rutas de autenticación
│   │   └── page.tsx
│   │
│   ├── dashboard/                    # Dashboard principal
│   │   └── page.tsx
│   │
│   ├── alimentos/                    # Gestión de alimentos
│   │   ├── page.tsx                  # Lista
│   │   ├── [id]/                     # Detalle dinámico
│   │   │   └── page.tsx
│   │   └── nuevo/                    # Crear nuevo
│   │       └── page.tsx
│   │
│   ├── mapa/                         # Mapa interactivo
│   │   ├── page.tsx
│   │   └── loading.tsx
│   │
│   ├── eventos/                      # Eventos de voluntariado
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── nuevo/page.tsx
│   │
│   ├── campanas/                     # Campañas solidarias
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── nueva/page.tsx
│   │
│   ├── admin/                        # Panel administrativo
│   │   └── page.tsx
│   │
│   ├── perfil/                       # Gestión de perfil
│   │   └── page.tsx
│   │
│   ├── usuarios/                     # Gestión de usuarios
│   │   └── page.tsx
│   │
│   ├── configuraciones/              # Configuraciones
│   │   └── page.tsx
│   │
│   └── notificaciones/               # Centro de notificaciones
│       └── page.tsx
│
├── components/                       # Componentes reutilizables
│   ├── theme-provider.tsx            # Tema (dark/light)
│   │
│   ├── auth/                         # Autenticación
│   │   ├── auth-form.tsx
│   │   ├── auth-provider.tsx         # Contexto de auth
│   │   └── ...
│   │
│   ├── layout/                       # Layout componentes
│   │   └── navbar.tsx                # Barra de navegación
│   │
│   ├── chat/                         # Chat widget
│   │   └── chat-widget.tsx
│   │
│   ├── mapa/                         # Componentes de mapa
│   │   ├── mapa-interactivo.tsx
│   │   ├── location-picker-modal.tsx
│   │   └── map-picker-content.tsx
│   │
│   ├── admin/                        # Admin components
│   │   ├── campaigns-management.tsx
│   │   ├── donations-management.tsx
│   │   ├── events-management.tsx
│   │   ├── users-management.tsx
│   │   └── reports.tsx
│   │
│   ├── donor/                        # Componentes donante
│   │   └── received-requests.tsx
│   │
│   ├── settings/                     # Configuraciones
│   │   ├── settings-provider.tsx
│   │   └── profile-privacy-display.tsx
│   │
│   └── ui/                           # shadcn/ui Components
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ... (30+ components)
│
├── lib/                              # Utilidades y configuración
│   ├── supabase.ts                   # Cliente Supabase
│   ├── auth.ts                       # Funciones de auth
│   ├── notifications.ts              # Sistema de notificaciones
│   ├── privacy.ts                    # Políticas de privacidad
│   └── utils.ts                      # Funciones auxiliares
│
├── hooks/                            # Custom React Hooks
│   ├── use-mobile.tsx
│   ├── use-settings-features.ts
│   └── use-toast.ts
│
├── styles/                           # Estilos globales
│   └── globals.css
│
├── scripts/                          # Scripts SQL
│   ├── 01-create-tables.sql
│   ├── 02-seed-data.sql
│   ├── 03-add-food-location-columns.sql
│   ├── 04-fix-rls-policies.sql
│   ├── 05-fix-rls-campaigns.sql
│   ├── 06-fix-rls-profiles-insert.sql
│   ├── 07-fix-triggers.sql
│   ├── 08-verify-trigger.sql
│   ├── 09-add-missing-campaign-columns.sql
│   ├── 10-add-columns-to-volunteer-events.sql
│   ├── 11-add-notification-indexes.sql
│   └── README.md
│
├── public/                           # Archivos estáticos
│
├── .env.example                      # Variables de entorno (plantilla)
├── .env.local                        # Variables de entorno (local)
├── .gitignore
├── components.json                   # Config shadcn/ui
├── next.config.mjs                   # Config Next.js
├── tsconfig.json                     # Config TypeScript
├── tailwind.config.ts                # Config Tailwind
├── postcss.config.mjs                # Config PostCSS
├── package.json
├── pnpm-lock.yaml
├── README.md                         # Documentación
├── MANUAL_USUARIO.md                 # Manual de usuario
└── DEVELOPER_GUIDE.md                # Este archivo
```

---

## 💻 Desarrollo

### Configurar Entorno Local

#### 1. Variables de Entorno

```bash
# Copiar plantilla
cp .env.example .env.local

# Editar .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Obtener credenciales de Supabase:**
1. Ve a [supabase.com](https://supabase.com)
2. Crea nuevo proyecto o abre existente
3. Ve a Settings > API
4. Copia `Project URL` y `anon public key`

#### 2. Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abre http://localhost:3000
```

### Convenciones de Código

#### TypeScript Estricto

```typescript
// ✅ CORRECTO - Tipos explícitos
interface User {
  id: string
  name: string
  email: string
}

const getUser = async (id: string): Promise<User> => {
  // ...
}

// ❌ EVITAR - Tipos implícitos
const getUser = (id) => {
  // ...
}
```

#### Componentes React

```typescript
// ✅ CORRECTO - Componente funcional con tipos
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export default function Button({
  onClick,
  children,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// ❌ EVITAR - Componentes sin tipos
export default function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

#### Manejo de Errores

```typescript
// ✅ CORRECTO - Try/catch y tipos
try {
  const data = await fetchData()
  return data
} catch (error) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`)
  }
  throw error
}

// ❌ EVITAR - Sin manejo de errores
const data = await fetchData()
```

#### Async/Await en Componentes

```typescript
// ✅ CORRECTO - En useEffect
useEffect(() => {
  const loadData = async () => {
    try {
      const result = await fetchData()
      setData(result)
    } catch (error) {
      console.error(error)
    }
  }
  loadData()
}, [])

// ❌ EVITAR - Async directamente en useEffect
useEffect(async () => {
  const result = await fetchData()
}, [])
```

### Patrones Comunes

#### Autenticación

```typescript
// lib/auth.ts - Funciones de autenticación
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

#### Consultas a Base de Datos

```typescript
// Obtener datos
async function getFoodItems() {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Insertar datos
async function createFoodItem(item: FoodItem) {
  const { data, error } = await supabase
    .from('food_items')
    .insert([item])
    .select()
  
  if (error) throw error
  return data[0]
}

// Actualizar datos
async function updateFoodItem(id: string, updates: Partial<FoodItem>) {
  const { data, error } = await supabase
    .from('food_items')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// Eliminar datos
async function deleteFoodItem(id: string) {
  const { error } = await supabase
    .from('food_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
```

#### Manejo de Errores Comunes

```typescript
// Timeout en conexión
const handleAuthError = (error: any): string => {
  if (error.message.includes('Timeout')) {
    return 'Conexión tardando. Verifica tu internet.'
  }
  if (error.message.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  return error.message || 'Error desconocido'
}
```

### Debugging

```bash
# Ver logs en servidor
npm run dev

# DevTools del navegador (F12)
# - Console: Errores y logs
# - Network: Requests a Supabase
# - Storage: Sesión y localStorage

# Testing en desarrollo
npm run lint       # Verificar errores
npm run build      # Probar build
```

---

## 🗄️ Base de Datos

### Esquema Principales

#### Tabla: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  avatar_url TEXT,
  role VARCHAR DEFAULT 'user',  -- 'donor', 'beneficiary', 'volunteer', 'admin'
  phone VARCHAR,
  address TEXT,
  city VARCHAR,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: food_items
```sql
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id),
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,  -- 'fruits', 'dairy', 'vegetables', etc.
  quantity DECIMAL,
  unit VARCHAR,  -- 'kg', 'liters', 'units', etc.
  expiry_date DATE,
  location_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  status VARCHAR DEFAULT 'available',  -- 'available', 'reserved', 'delivered', 'expired'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: food_requests
```sql
CREATE TABLE food_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id UUID REFERENCES food_items(id),
  beneficiary_id UUID REFERENCES profiles(id),
  status VARCHAR DEFAULT 'pending',  -- 'pending', 'accepted', 'completed', 'rejected'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: volunteer_events
```sql
CREATE TABLE volunteer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES profiles(id),
  title VARCHAR NOT NULL,
  description TEXT,
  event_type VARCHAR,  -- 'distribution', 'collection', 'training'
  event_date TIMESTAMP,
  location_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_volunteers INT,
  status VARCHAR DEFAULT 'pending',  -- 'pending', 'approved', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Política: Los usuarios solo ven sus propios datos
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Política: Los donantes ven las solicitudes a sus alimentos
CREATE POLICY "Donors can view requests"
ON food_requests FOR SELECT
USING (
  food_item_id IN (
    SELECT id FROM food_items WHERE donor_id = auth.uid()
  ) OR beneficiary_id = auth.uid()
);
```

### Insertar Datos de Prueba

```sql
-- Insertar usuario de prueba
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'Test User',
  'donor'
);

-- Insertar alimento de prueba
INSERT INTO food_items (
  donor_id, name, category, quantity, unit, expiry_date, status
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Manzanas rojas',
  'fruits',
  50,
  'kg',
  NOW() + INTERVAL '7 days',
  'available'
);
```

---

## 🔗 API & Rutas

### Rutas principales en Next.js

```
GET  /                          # Página de inicio
POST /api/auth/register         # Registro
POST /api/auth/login            # Login
GET  /api/auth/logout           # Logout

GET  /alimentos                  # Listar alimentos
POST /alimentos                  # Crear alimento
GET  /alimentos/[id]            # Detalle de alimento
PUT  /alimentos/[id]            # Editar alimento
DELETE /alimentos/[id]          # Eliminar alimento

GET  /mapa                       # Mapa interactivo
GET  /eventos                    # Listar eventos
POST /eventos                    # Crear evento
GET  /eventos/[id]              # Detalle de evento

GET  /campanas                   # Listar campañas
POST /campanas/[id]/donar       # Donar a campaña

GET  /perfil                     # Mi perfil
PUT  /perfil                     # Editar perfil
```

### Llamadas a Supabase desde Cliente

```typescript
// Típico patrón en componentes/páginas
'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function FoodList() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const { data, error } = await supabase
          .from('food_items')
          .select('*')
          .eq('status', 'available')

        if (error) throw error
        setFoods(data || [])
      } catch (error) {
        console.error('Error fetching foods:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [])

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      {foods.map(food => (
        <div key={food.id}>{food.name}</div>
      ))}
    </div>
  )
}
```

---

## 🎨 Componentes

### Estructura de un Componente

```typescript
// components/example/example.tsx
'use client'  // Si es cliente

import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ExampleProps {
  title: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export default function Example({
  title,
  onClick,
  variant = 'primary'
}: ExampleProps) {
  const [state, setState] = useState(false)

  useEffect(() => {
    // Efectos aquí
  }, [])

  return (
    <div className="p-4">
      <h2>{title}</h2>
      <Button 
        onClick={() => {
          setState(!state)
          onClick?.()
        }}
      >
        Click me
      </Button>
    </div>
  )
}
```

### Usar shadcn/ui

```typescript
// Instalar componente
npx shadcn-ui@latest add button

// Usar en componente
import { Button } from '@/components/ui/button'

export default function MyComponent() {
  return <Button>Click</Button>
}
```

### Formularios con React Hook Form + Zod

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 1. Definir esquema
const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
})

type FormData = z.infer<typeof schema>

// 2. Componente
export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      <Input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <Button type="submit">Send</Button>
    </form>
  )
}
```

---

## 🧪 Testing

### Testing Unitario

```bash
# Ejecutar tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Escribir Tests

```typescript
// __tests__/utils.test.ts
import { formatDate } from '@/lib/utils'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-01-11')
    const result = formatDate(date)
    expect(result).toBe('11/01/2026')
  })
})
```

### Testing de Componentes

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import Button from '@/components/ui/button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    screen.getByText('Click me').click()
    expect(onClick).toHaveBeenCalled()
  })
})
```

---

## 🚀 Despliegue

### Desplegar en Vercel

#### Opción 1: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy a producción
vercel --prod
```

#### Opción 2: GitHub Integration

1. Push a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa proyecto
4. Configura variables de entorno
5. Vercel despliega automáticamente

### Variables de Entorno en Producción

En Vercel, ir a Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
```

### Checklist Pre-Deployment

- ✅ Tests pasan (`npm run test`)
- ✅ Build exitoso (`npm run build`)
- ✅ No hay errores de tipo (`npm run type-check`)
- ✅ ESLint pasa (`npm run lint`)
- ✅ Variables de entorno configuradas
- ✅ Supabase RLS actualizado
- ✅ Dominio configurado en Supabase Auth

### Post-Deployment

```bash
# Verificar sitio en producción
https://tu-dominio.vercel.app

# Ver logs en Vercel
vercel logs

# Revert a versión anterior si hay problemas
vercel rollback
```

---

## ✨ Buenas Prácticas

### Commits Convencionales

```bash
# Formato: type(scope): subject
# Ejemplos:
git commit -m "feat(auth): add login form"
git commit -m "fix(map): resolve zoom issue"
git commit -m "docs(readme): update installation steps"
git commit -m "style(components): format button styling"
git commit -m "refactor(api): simplify fetch logic"
git commit -m "test(utils): add date formatting tests"
```

**Tipos válidos:**
- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Cambios de documentación
- `style` - Cambios de estilo (no lógica)
- `refactor` - Refactorización de código
- `test` - Nuevos tests
- `chore` - Cambios de build/dependencias

### Pull Requests

```markdown
## Descripción
Breve descripción de cambios

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Cambio que rompe compatibilidad
- [ ] Cambio de documentación

## Cómo ha sido testeado
Describe cómo verificaste los cambios

## Checklist
- [ ] Mi código sigue el estilo del proyecto
- [ ] He ejecutado `npm run lint:fix`
- [ ] He añadido tests
- [ ] Los tests pasan localmente
- [ ] He actualizado la documentación
```

### Performance

```typescript
// ✅ CORRECTO - Memoización
import { memo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  return <div>{data}</div>
})

// ✅ CORRECTO - Lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// ❌ EVITAR - Re-renders innecesarios
const handleClick = () => { /* ... */ }  // Nueva función cada render
```

### Seguridad

```typescript
// ✅ CORRECTO - Validar input
import { z } from 'zod'

const schema = z.string().min(1).max(100)
const validated = schema.parse(userInput)

// ❌ EVITAR - Confiar en input del usuario
const value = userInput  // ¿Qué pasa si contiene scripts?
```

---

## 🔧 Troubleshooting

### Errores Comunes

#### "Supabase variables not configured"
```
Solución:
1. Verifica que .env.local existe en raíz
2. Confirma que tienes NEXT_PUBLIC_SUPABASE_URL
3. Confirma que tienes NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Reinicia el servidor (npm run dev)
```

#### "Connection timeout"
```
Solución:
1. Verifica tu conexión a internet
2. Comprueba que la URL de Supabase es correcta
3. Verifica que tu proyecto Supabase está activo
4. Intenta desde otra red
```

#### "Row level security issue"
```
Solución:
1. Verifica que el usuario está autenticado
2. Ejecuta los scripts de RLS en SQL Editor:
   - 04-fix-rls-policies.sql
   - 05-fix-rls-campaigns.sql
3. Verifica las políticas RLS en cada tabla
```

#### "Module not found"
```
Solución:
1. Verifica el path en import (case-sensitive en Linux)
2. Asegúrate que el archivo existe
3. Verifica tsconfig.json paths
4. Ejecuta: npm install
```

#### "Build fails in Vercel but works locally"
```
Solución:
1. Ejecuta: npm run build (local)
2. Verifica tipos: npx tsc --noEmit
3. Verifica que todas las variables de entorno están en Vercel
4. Revisa los logs de Vercel en detalle
```

### Debug Mode

```typescript
// Activar logs de Supabase
const supabaseClient = createClient(url, key, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'app/1.0.0'
    }
  }
})

// En consola del navegador
console.log(supabaseClient)
```

### Performance Debugging

```bash
# Analizar bundle
npx next/bundle-analyzer

# Benchmarking
npm run build
npm start  # Medir tiempo de startup

# Memory usage
node --max-old-space-size=4096 node_modules/.bin/next build
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Herramientas Útiles
- [VS Code](https://code.visualstudio.com) - Editor
- [Git](https://git-scm.com) - Versionamiento
- [Vercel CLI](https://vercel.com/cli) - Deployment
- [Supabase CLI](https://supabase.com/docs/guides/cli) - Local development

### Extensiones VS Code Recomendadas
- ESLint
- Prettier
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- REST Client

---

## 🤝 Contribuir

### Workflow de Desarrollo

1. **Fork & Clone**
   ```bash
   git clone https://github.com/tu-usuario/BancoDeAlimentos.git
   cd "BancoAlimentos - Vinculacion"
   ```

2. **Crear rama**
   ```bash
   git checkout -b feature/mi-feature
   ```

3. **Desarrollar**
   ```bash
   npm run dev
   # Hacer cambios...
   npm run lint:fix
   ```

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat(feature): add amazing feature"
   git push origin feature/mi-feature
   ```

5. **Pull Request**
   - Abre PR en GitHub
   - Describe cambios
   - Espera revisión

### Code Review

- Se revisa: funcionalidad, tests, estilo, documentación
- Se requiere aprobación antes de merge
- Los cambios pueden ser solicitados

---

## 📞 Contacto

- **Issues**: GitHub Issues
- **Email**: soporte@bancoalimentos.org
- **Discord**: [Community Discord]
- **Email Dev**: dev@bancoalimentos.org

---

<div align="center">
  <h3>¡Gracias por contribuir al Banco de Alimentos Virtual! 🍏</h3>
  <p>Tu código ayuda a reducir el desperdicio y combatir el hambre</p>
</div>
