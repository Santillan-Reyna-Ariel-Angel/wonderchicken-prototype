# Wonder Chicken — Frontend Prototype: Reporte de Análisis Técnico

> **Versión analizada:** Prototipo de frontend (estado a septiembre 2026)
> **Stack:** React 19 + Vite 6 + TypeScript 5.8 + Tailwind CSS 4 + Zustand 5
> **Propósito del sistema:** POS (Point of Sale) y núcleo de operaciones para cadena de restaurantes de pollo broaster en Bolivia
> **Tipo de entregable:** Prototipo funcional con datos mock (sin backend real, salvo el wrapper de `@google/genai` declarado en `package.json`)

---

## 1. Resumen ejecutivo

Wonder Chicken es un **prototipo de sistema POS integral** que cubre ventas en caja, configuración de variantes de productos (pollo broaster con presas intercambiables), KDS (Kitchen Display System), gestión de turnos y cajas, registro de clientes y administración multi-sucursal.

**Características clave:**

- **4 roles de usuario** con permisos diferenciados: `SUPER_ADMIN`, `ADMIN`, `CAJERA`, `DESPACHADORA`
- **15 pantallas** accesibles según rol
- **~17 componentes** entre específicos y reutilizables
- **~9.600 líneas de código** distribuidas en `src/`
- **Sin persistencia real** — todos los datos viven en memoria (Zustand stores + `useState`) o en mocks estáticos
- **Modo claro/oscuro** con persistencia en `localStorage`
- **Cumplimiento normativo SIN Bolivia** referenciado en textos (RND 102100000011, facturación nominada > Bs. 1.000)

> **⚠️ Nota importante sobre el estado del prototipo:** la mayoría de handlers son simulados (`alert`, `confirm`, `setTimeout`, `showToast` con string estático). No hay llamadas reales a APIs excepto las referenciadas en `metadata.json` (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) que no tienen endpoint visible.

---

## 2. Stack tecnológico

### 2.1 Dependencias principales (`package.json`)

| Dependencia | Versión | Propósito |
|---|---|---|
| `react`, `react-dom` | 19.0.1 | UI library core |
| `vite` | 6.2.3 | Bundler y dev server |
| `typescript` | 5.8.2 | Tipado estático |
| `tailwindcss` | 4.1.14 | Estilos utility-first (v4 con `@tailwindcss/vite`) |
| `zustand` | 5.0.15 | Estado global compartido |
| `lucide-react` | 0.546.0 | Iconografía (poco usado; predomina Material Symbols) |
| `motion` | 12.23.24 | Animaciones (poco usado; predominan CSS transitions) |
| `express` | 4.21.2 | (declarado pero no usado en `src/`) |
| `@google/genai` | 2.4.0 | SDK de Gemini (declarado, sin uso visible) |
| `zod` | 4.6.5 | Validación de esquemas (declarado, sin uso visible) |
| `dotenv` | 17.2.3 | Variables de entorno (declarado, sin uso visible) |

> **Hallazgo:** varias dependencias están declaradas pero **no se utilizan** en el código actual (`express`, `@google/genai`, `zod`, `dotenv`, `motion`, `lucide-react`). Esto sugiere que el frontend está preparado para integraciones futuras o que el scaffolding proviene de un template más amplio.

### 2.2 Scripts disponibles

```bash
bun run dev      # vite --port=3000 --host=0.0.0.0
bun run build    # vite build
bun run preview  # vite preview
bun run lint     # tsc --noEmit
bun run clean    # rm -rf dist server.js
```

> **Convención:** usa **Bun** (hay `bun.lock` de 76KB). No hay `package-lock.json` ni `pnpm-lock.yaml`.

### 2.3 Configuración de Vite (`vite.config.ts`)

- **Plugin React 5** + **Plugin Tailwind 4**
- **Alias `@/`** → raíz del proyecto
- **HMR controlado** vía env `DISABLE_HMR` (true = sin hot reload, false = modo normal)
- Sirve en `0.0.0.0:3000`

### 2.4 TypeScript (`tsconfig.json`)

- Target ES2022, módulo ESNext
- `jsx: "react-jsx"` (sin importar React en cada archivo)
- `allowImportingTsExtensions: true`
- `experimentalDecorators: true` (declarado pero no usado)
- `paths: { "@/*": ["./*"] }` (declarado pero no usado — los imports usan relativos)

---

## 3. Estructura del proyecto

```
src/
├── main.tsx                         # Entry point + ThemeProvider
├── App.tsx                          # Router declarativo (349 líneas)
├── index.css                        # Estilos globales + dark mode
├── types.ts                         # Tipos de dominio (217 líneas)
│
├── config/
│   ├── api.ts                       # Constante API_PREFIX = '/api/v1'
│   └── colors.ts                    # BRAND_COLORS tokens
│
├── context/
│   └── ThemeContext.tsx             # Dark/light mode (58 líneas)
│
├── data/
│   └── mockData.ts                  # INITIAL_PRODUCTS, CUSTOMERS, ORDERS (450 líneas)
│
├── features/                        # Stores Zustand organizados por dominio
│   ├── auth/stores/auth.store.ts    # Login + sesión activa
│   ├── orders/stores/orders.store.ts # KDS tickets + órdenes completadas
│   └── shifts/stores/shifts.store.ts # Apertura/cierre de turno
│
├── commonComponents/                # UI reutilizable (5 componentes)
│   ├── AppModal.tsx                 # Modal base con header rojo, body, footer
│   ├── ConfirmDialog.tsx            # Wrapper de AppModal para confirmaciones
│   ├── EmptyState.tsx               # Estado vacío con icono + CTA
│   ├── CommonTable.tsx              # Tabla genérica tipada <T> (178 líneas)
│   └── ActionModal.tsx              # Botón que abre modal
│
└── components/                      # Pantallas y modales específicos (17 archivos)
    ├── Header.tsx                   # Top bar global (231 líneas)
    ├── Sidebar.tsx                  # Navegación lateral con roles (280 líneas)
    ├── LoginScreen.tsx              # Login con credenciales demo (336 líneas)
    ├── POSScreen.tsx                # Punto de venta (678 líneas)
    ├── KitchenScreen.tsx            # KDS + pantalla pública (523 líneas)
    ├── CatalogScreen.tsx            # Gestión de productos + variantes (1229 líneas)
    ├── ClientsScreen.tsx            # CRM de clientes (668 líneas)
    ├── ShiftScreen.tsx              # Apertura de turno (598 líneas)
    ├── ShiftControlScreen.tsx       # Arqueo y acta Z (527 líneas)
    ├── PendingOrdersScreen.tsx      # Pedidos para llevar (412 líneas)
    ├── HistoryScreen.tsx            # Historial de tickets (255 líneas)
    ├── PersonnelScreen.tsx          # Gestión de operadores (460 líneas)
    ├── BranchesScreen.tsx           # Gestión de sucursales (457 líneas)
    ├── PublicOrderScreen.tsx        # Tracker público (254 líneas)
    ├── SuperAdminDashboard.tsx      # Dashboard global (211 líneas)
    ├── BranchAdminDashboard.tsx     # Dashboard de sucursal (240 líneas)
    ├── ComboVariantModal.tsx        # Modal de configuración de combo (779 líneas)
    ├── CustomItemModal.tsx          # Modal de venta custom (718 líneas)
    └── PaymentModal.tsx             # Modal de cobro (465 líneas)
```

### 3.1 Convenciones observadas

- **Imports relativos**, no se usa el alias `@/`
- **No hay barrel files** (`index.ts` que reexporte)
- **No hay separación por capas** (no existen carpetas `services/`, `hooks/`, `utils/`)
- **Componentes auto-contenidos**: cada pantalla maneja su propio `useState` y toasts locales
- **Sin tests** (no hay `vitest`, `jest`, ni archivos `*.test.ts`)

---

## 4. Lógica de los componentes

### 4.1 Patrón general de pantallas

Cada pantalla sigue un patrón consistente:

```tsx
export const XxxScreen: React.FC<XxxScreenProps> = (props) => {
  // 1. Estado local (useState para filtros, búsquedas, formularios)
  // 2. Estado de modales (showModal, selectedItem, toast)
  // 3. Handlers con showToast() o confirm() simulado
  // 4. Datos derivados (filteredList, totals)
  // 5. Render con estructura:
  //    - Toast fijo
  //    - Header con título + acciones
  //    - Filtros/búsqueda
  //    - Contenido principal (tabla/grid/cards)
  //    - Modal(es) al final
  return (...);
};
```

### 4.2 Router declarativo (`App.tsx`)

El proyecto **no usa `react-router`**. La navegación se hace con un único `useState<ScreenType>`:

```tsx
// src/App.tsx:30
const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
  return !shift.isOpen ? 'apertura-turno' : 'pos-ventas';
});
```

**Reglas de routing:**

| Pantalla | Acceso |
|---|---|
| `login` | Estado inicial o `handleLogout` |
| `comanda-publica` | Solo desde `LoginScreen` (link "rastreador público") |
| `apertura-turno` | Cuando `!shift.isOpen` (mostrada full-bleed como login) |
| `pos-ventas`, `catalogo-y-variantes`, etc. | Switch en `<main>` con offset por sidebar |

> **⚠️ Implicancia:** al ser router declarativo por estado, **no hay URLs reales ni deep-linking**. `BrowserRouter` no existe. El `metadata.json` declara `requestFramePermissions: []`, confirmando que es una SPA pura.

### 4.3 Sistema de roles

El rol se guarda en `userRole` (state en `App.tsx`) y en `useAuthStore.user.role`. Cada rol tiene un set de pantallas:

| Rol | Pantallas accesibles |
|---|---|
| `CAJERA` | pos-ventas, apertura-turno, historial, clientes, pedidos-pendientes |
| `DESPACHADORA` | despacho-cocina (KDS), comanda-publica |
| `ADMIN` | branch-admin, catálogo, personal, control-turnos, clientes, pos-ventas, historial, pedidos-pendientes |
| `SUPER_ADMIN` | super-admin, sucursales, clientes, catálogo, control-turnos, personal |

La lógica vive en `Sidebar.tsx` (función `getNavSections()`), no hay guards de ruta.

### 4.4 Flujo principal de venta (`POSScreen`)

```
1. Cajera selecciona productos (catálogo filtrable)
   ↓
2. Si el producto es configurable (variantRules), abre ComboVariantModal
   - Selecciona presas (pecho/ala/pierna/entrepierna)
   - Selecciona acompañamiento (mixto/papa/arroz/smiles)
   - Selecciona bebida y temperatura (si aplica)
   ↓
3. Cart se actualiza (lineItem con config: ComboConfiguration)
   ↓
4. Cajera selecciona método de pago:
   - [F1] Registrar Pago → PaymentModal (Efectivo/QR/Pendiente)
   - Pago Pendiente → crea orden PENDING_PAYMENT
   ↓
5. App.tsx recibe onCompleteSale → push a orders state → vuelve al POS
   ↓
6. La orden aparece automáticamente en KitchenScreen (KDS)
```

### 4.5 Flujo KDS (`KitchenScreen`)

```
NUEVO (orden llega del POS)
   ↓ click "Iniciar Preparación"
EN_PREPARACION
   ↓ click "Marcar Listo"
LISTO
   ↓ click "Avisar a Pantalla" (proyecta en PublicOrderScreen)
ANUNCIADO
   ↓ click "Marcar Entregado"
ENTREGADO (sale de la cola visible)
```

---

## 5. Comunicación entre componentes

### 5.1 Tres canales de comunicación

#### A) Props / callbacks (lifting state up)

Es el patrón **dominante** en el proyecto. Ejemplo típico:

```tsx
// App.tsx → POSScreen
<POSScreen
  products={products}
  customers={customers}
  activeCustomer={activeCustomer}
  onSelectCustomer={setActiveCustomer}
  onNavigateToClients={() => setCurrentScreen('clientes')}
  onCompleteSale={handleCompleteSale}  // callback hacia App
/>

// POSScreen → ComboVariantModal
<ComboVariantModal
  isOpen={showComboModal}
  product={selectedProductForConfig}
  onClose={() => { setShowComboModal(false); setSelectedProductForConfig(null); }}
  onConfirm={handleConfirmCombo}  // callback que agrega al carrito
/>
```

> **Ventaja:** flujo unidireccional claro y testeable.
> **Desventaja:** prop drilling pesado en árboles profundos (ej. POSScreen → PaymentModal → Customer dropdown).

#### B) Zustand stores (estado compartido)

Tres stores, organizados por dominio en `features/`:

| Store | Responsabilidad | Consumido por |
|---|---|---|
| `useAuthStore` | `user`, `isAuthenticated`, `login()`, `logout()`, `switchRole()` | Header, LoginScreen (vía App) |
| `useOrdersStore` | `completedOrders[]`, `kdsTickets[]`, `addOrder()`, `markReady()`, `deliverOrder()`, `settlePendingOrder()` | KitchenScreen, BranchAdminDashboard |
| `useShiftsStore` | `shift: ShiftState`, `openShift()`, `closeShift()`, `setCashierName()`, `incrementOrderNumber()` | Header (turno activo), Sidebar (badge turno abierto), ShiftScreen, ShiftControlScreen, App |

> **⚠️ Hallazgo importante:** el POSScreen y App.tsx **NO usan los stores**. Manejan su propio `useState` para `products`, `customers`, `orders`, `activeCustomer`. Esto significa que **el estado del POS no se comparte con KitchenScreen** — son dos sistemas de datos paralelos. La integración real (POS → KDS) está simulada solo en `orders.store.ts` pero no se invoca desde el flujo de venta.

#### C) React Context (solo para tema)

`ThemeContext` provee `theme`, `toggleTheme()`, `setTheme()`. Consumido por `Header`, `LoginScreen`, `ShiftScreen`, `PublicOrderScreen`.

> **Decisión correcta:** el tema se mantiene fuera de Zustand porque debe persistir en `localStorage` y aplica globalmente.

### 5.2 Diagrama de comunicación

```
                    ┌──────────────┐
                    │   App.tsx    │  (router + estado de alto nivel)
                    └──────┬───────┘
                           │ props + callbacks
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      ┌──────────┐  ┌──────────┐  ┌──────────┐
      │ Header   │  │ Sidebar  │  │ Pantalla │
      │(context) │  │(store)   │  │ actual   │
      └──────────┘  └──────────┘  └────┬─────┘
                                       │ props + callbacks
                                ┌──────┼──────┐
                                ▼      ▼      ▼
                          ┌────────┐ ┌────────┐ ┌────────┐
                          │ Modal 1│ │ Modal 2│ │ Modal 3│
                          └────────┘ └────────┘ └────────┘
                                │
                                ▼
                          ┌─────────────────┐
                          │ commonComponents│
                          │ (AppModal, ...) │
                          └─────────────────┘
```

---

## 6. Componentes reutilizables

### 6.1 `AppModal` — el corazón del sistema

**Archivo:** `src/commonComponents/AppModal.tsx`

Es el contenedor base para TODOS los modales. Características:

- **Estructura fija de 3 partes:**
  - Header rojo `#d32f2f` con icono + título + descripción + botón cerrar
  - Body blanco con scroll
  - Footer gris claro con botones (Cancelar + Confirmar)
- **API rica:** `icon`, `title`, `description`, `children`, `onConfirm`, `confirmLabel`, `confirmIcon`, `confirmDisabled`, `confirmLoading`, `showCancel`, `cancelLabel`, `maxWidth` (`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`), `footerExtra`, `customFooter`, `hideFooter`
- **Atajos de teclado:** cierra con `Escape`
- **Accesibilidad:** `role="dialog"`, `aria-modal="true"`, `aria-label="Cerrar modal"`
- **Animación:** clase `animate-fade-in` (Tailwind keyframes custom)

### 6.2 `ConfirmDialog` — diálogo destructivo

Wrapper delgado sobre `AppModal` con icono `warning` o `help` según `isDestructive`.

### 6.3 `EmptyState` — estado vacío consistente

```tsx
<EmptyState
  icon="search_off"
  title="No se encontraron clientes"
  description="Intente ajustar los términos de búsqueda"
  actionLabel="Crear nuevo"
  onAction={() => ...}
/>
```

### 6.4 `CommonTable<T>` — tabla genérica tipada

**Archivo:** `src/commonComponents/CommonTable.tsx`

Componente potente con:
- **Genéricos TypeScript** (`<T>` para tipado fuerte de filas)
- **Definición declarativa de columnas** (`ColumnDef<T>`)
- **Búsqueda opcional** (`showSearch`, `searchFilter` personalizable o fallback que recorre valores)
- **Estado de loading** con skeletons animados
- **Estado de error** con banner rojo
- **Empty state** automático usando `EmptyState`
- **Paginación** (placeholder visual, no funcional)
- **Acciones en header** (`actionsHeader` slot)

**Usado por:** `SuperAdminDashboard`, `BranchAdminDashboard`. Otros componentes (`ClientsScreen`, `PersonnelScreen`, etc.) **reimplementan tablas manualmente** en lugar de usar este componente reutilizable.

> **Oportunidad de mejora:** homogeneizar todas las tablas usando `CommonTable`.

### 6.5 `ActionModal` — botón + modal

Combina un botón disparador con un modal pre-configurado. Útil cuando una acción siempre abre el mismo diálogo.

---

## 7. Estilos globales y locales

### 7.1 Sistema de diseño (`index.css` + `tailwind.config` implícito)

#### Paleta de marca (`config/colors.ts`)

```ts
BRAND_COLORS = {
  primary: '#d32f2f',        // Rojo Wonder Chicken
  primaryDark: '#af101a',    // Rojo institucional profundo
  secondary: '#fbc02d',      // Amarillo Wonder Chicken
  secondaryAccent: '#fec330', // Amarillo mostaza cálido
  darkSurface: '#141b2b',    // Navy slate (header, sidebar, textos)
  darkSurfaceAlt: '#293040',
  lightBg: '#f9f9ff',        // Background general
  lightCard: '#ffffff',
  lightBorder: '#e1e8fd',
  textPrimary: '#141b2b',
  textSecondary: '#5b403d',
  success: '#15803d',        // Verde (entregado, listo)
  warning: '#b45309',
  error: '#ba1a1a',
}
```

#### Tipografía

| Familia | Uso |
|---|---|
| **Geist** (300-800) | UI general (texto base en `body`) |
| **JetBrains Mono** (400-700) | Códigos, montos, datos técnicos (clase `.font-mono`) |
| **Material Symbols Outlined** | Iconografía en toda la app |

Fuentes cargadas vía Google Fonts en `index.html:14`.

### 7.2 Sistema de dark mode

**Estrategia:** CSS pura con selectores múltiples (`.dark`, `[data-theme="dark"]`, `[data-toolpad-color-scheme="dark"]`, `body.dark-theme`).

**Mecanismo:**
1. `ThemeContext` lee `localStorage.wonder_theme` y `prefers-color-scheme`
2. Aplica atributos: `data-toolpad-color-scheme`, `data-theme`, clase `.dark`, clase `body.dark-theme`
3. CSS usa selectores múltiples con `!important` para override de Tailwind utilities

**Mapeo de tokens light → dark (MUI-style):**

| Token | Light | Dark |
|---|---|---|
| `background.default` | `#f9f9ff` | `#0b0f19` |
| `background.paper` | `#ffffff` | `#131b2e` |
| `background.subtle` | `#f1f3ff` | `#1a233b` |
| `text.primary` | `#141b2b` | `#f8fafc` |
| `text.secondary` | `#5b403d` / `#64748b` | `#94a3b8` |
| `divider` | `#e1e8fd` | `#263554` |
| `action.hover` | `#f1f3ff` | `#243050` |

> **Observación:** la estrategia cubre explícitamente backgrounds custom (`#f9f9ff`, `#f1f3ff`, `#fff8f7`, `#f8f9fc`, `#f1f5f9`, `bg-slate-50`, `bg-gray-50`), borders custom, text colors, inputs/selects/textareas, header, sidebar, modales, badges y tablas. Es **completa** pero redundante (4 selectores equivalentes).

### 7.3 Estilos locales (inline en cada componente)

Todos los estilos son **inline con Tailwind utilities**. No hay CSS Modules, styled-components, ni Emotion. Esto genera:

- ✅ **Pro:** Sin overhead de build, portabilidad máxima, fácil de copiar/pegar entre componentes.
- ❌ **Contra:** clases muy largas (`"px-3 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] cursor-pointer"`), repetición masiva entre componentes similares.

> **Oportunidad de mejora:** extraer componentes de UI primitivos (`<Button variant="primary" size="sm">`, `<Input icon="..." />`, `<Badge tone="success">`) usando `@apply` de Tailwind o clases compuestas.

### 7.4 Patrones visuales recurrentes

| Patrón | Implementación |
|---|---|
| Toast notificación | `fixed bottom-4 right-4 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg` (idéntico en 8+ archivos) |
| Card blanco con borde | `bg-white rounded-xl border border-[#e1e8fd] shadow-xs` |
| Botón primario | `bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono font-bold` |
| Botón secundario outline | `bg-[#f1f3ff] hover:bg-[#e9edff] border border-[#e1e8fd]` |
| Input con icono | `<div className="relative">` + `<span className="material-symbols-outlined absolute left-2.5 top-2">` + `<input>` |
| Badge de estado | `<span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">` |
| Tabla con header | `<thead className="bg-[#f1f3ff] text-[#5b403d] font-mono uppercase tracking-wider">` |

---

## 8. Interfaces y modelo de datos

### 8.1 Tipos centrales (`src/types.ts`)

#### `UserRole`
```ts
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CAJERA' | 'DESPACHADORA';
```

#### `ScreenType`
Union literal con 24 valores, incluyendo variantes con formato URL (`'/login'`, `'/super-admin'`, etc.) **que no se usan para routing real**.

#### `OrderType`
```ts
type OrderType = 'MESA' | 'LLEVAR';
```

#### `OrderStatus` (8 estados)

| Estado | Etiqueta |
|---|---|
| `CREATED` | Creado |
| `CONFIRMED` | Confirmado |
| `PREPARING` | En preparación |
| `READY` | Listo |
| `DELIVERED` | Entregado |
| `CLOSED` | Cerrado |
| `PENDING_PAYMENT` | Pago pendiente |
| `CANCELLED` | Cancelado |

> **Inconsistencia:** hay **dos sistemas de status paralelos:**
> - `CompletedOrder.status`: `'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO'` (3-4 valores)
> - `KitchenScreen` local: `'NUEVO' | 'EN_PREPARACION' | 'LISTO' | 'ANUNCIADO' | 'ENTREGADO'` (5 valores)
>
> Estos sistemas **no se sincronizan** — el estado del KDS es local a la pantalla.

#### `Product` — modelo complejo

```ts
interface Product {
  id: string;
  code: string;             // SKU (P-001, B-001, E-001)
  name: string;
  description: string;
  price: number;
  basePrice?: number;
  category: string;         // 'principales' | 'bebidas' | 'extras'
  imageUrl: string;
  active: boolean;
  isSellable?: boolean;
  isInventoryItem?: boolean;
  variants?: ProductVariant[];
  variantRules?: ProductVariantRules;  // ⭐ Reglas del plato
  badge?: string;
  piecesBadge?: string;
  isCombo?: boolean;
  isPopular?: boolean;
  configurable?: boolean;
  inventariable?: string;
  variantNotes?: string;
  variantsCount?: number;
  optionsPreview?: string;
  stockControl?: string;
}
```

#### `ProductVariantRules` — corazón del dominio

```ts
interface ProductVariantRules {
  presCount?: number;              // 2 o 4 presas
  allowedPresas?: {                // tipos permitidos
    pecho: boolean;
    ala: boolean;
    pierna: boolean;
    entrepierna: boolean;
  };
  defaultSide?: string;            // 'mixto' | 'solo-papa' | 'solo-arroz' | 'smiles'
  allowedSides?: string[];         // sustituciones sin costo (PDR §2.1)
  hasIncludedDrink?: boolean;
  defaultDrink?: string;
  allowedDrinks?: string[];        // intercambiables mismo volumen/precio
}
```

#### `ComboConfiguration` — lo que el cajero arma

```ts
interface ComboConfiguration {
  presas: PresasCount;             // { ala, pecho, pierna, entrepierna }
  side?: 'mixto' | 'solo-arroz' | 'solo-papa' | 'smiles' | string;
  drink?: string;
  temperature?: 'FRÍA' | 'NATURAL';
  notes?: string;                  // resumen en texto plano para KDS
}
```

#### `OrderItem`

```ts
interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  isCombo?: boolean;
  config?: ComboConfiguration;     // ⭐ si es combo, guarda la configuración
  customDetails?: string;          // ⭐ notas de venta custom
}
```

#### `CompletedOrder`

```ts
interface CompletedOrder {
  ticketNumber: string;
  timestamp: string;
  orderType: OrderType;
  tableNumber?: string;            // solo si orderType === 'MESA'
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'EFECTIVO' | 'QR' | 'PENDIENTE';
  cashReceived?: number;
  cashChange?: number;
  status: 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
  cashier: string;
}
```

#### `ShiftState`

```ts
interface ShiftState {
  isOpen: boolean;
  shiftPeriod: 'MAÑANA' | 'NOCHE';
  cashRegisterId: '01' | '02';
  initialAmount: number;
  openedAt?: string;
  cashierName: string;
  token?: string;
  lastOrderNumber: number;
}
```

#### `Customer`

```ts
interface Customer {
  id: string;
  ci: string;
  ciExt?: string;            // LP, SC, CB, OR, PT, TJ, CH, BE, PA, EA
  nit?: string;              // para facturación corporativa
  fullName: string;
  firstName?: string;
  lastName?: string;
  gender?: 'Hombre' | 'Mujer';
  phone: string;
  email?: string;
  birthdate?: string;
  businessName?: string;
  isCorporate?: boolean;
  isFrequent?: boolean;
  branch?: string;
  lastOrderTime?: string;
  lastOrderAmount?: number;
}
```

### 8.2 Mock data (`src/data/mockData.ts`)

- **12 productos** organizados en 3 categorías:
  - **Principales** (7): Cuarto de Pollo, Porción Media, Combo Wonder, Medio Pollo, Porción Completa, Super Wonder, Wonder Pop
  - **Bebidas** (2): Coca Cola 500ml, Mocochinchi 500ml
  - **Extras** (3): Smiles McCain, Porción Papas, Porción Arroz
- **9 clientes** (1 sin nombre + 8 con datos completos, mezclando personas naturales y empresas)
- **3 órdenes iniciales** (`#00142`, `#00141`, `#00140`) con distintos estados

### 8.3 Stores Zustand

#### `useAuthStore`

```ts
{
  isAuthenticated: boolean;
  user: UserSession | null;
  login(role: UserRole, customName?: string): void;
  logout(): void;
  switchRole(role: UserRole): void;
}
```

`DEMO_PROFILES` contiene 4 perfiles predefinidos (uno por rol) con `id`, `name`, `email`, `ci`, `role`, `branchId`, `branchName`, `token` (JWT simulado).

#### `useOrdersStore`

```ts
{
  completedOrders: CompletedOrder[];
  kdsTickets: KDSTicket[];
  addOrder(order, isPendingPayment?): void;
  markReady(ticketId): void;
  deliverOrder(ticketId): void;
  settlePendingOrder(ticketId, paymentMethod): void;
}
```

> **⚠️ Acoplamiento fuerte:** `addOrder()` mapea `OrderItem.config` a `KDSTicketItem.details` con formato texto plano. Esto significa que el formato del KDS está hardcodeado en el store.

#### `useShiftsStore`

```ts
{
  shift: ShiftState;
  openShift({shiftPeriod, cashRegisterId, initialAmount, cashierName}): void;
  closeShift(): void;
  setCashierName(name): void;
  incrementOrderNumber(): number;  // retorna siguiente número
}
```

### 8.4 Config

- `API_PREFIX = '/api/v1'` — declarado pero **no se usa** (no hay fetch en el código)
- `BRAND_COLORS` — usado solo en `SuperAdminDashboard` para import

---

## 9. Pantallas — análisis funcional

### 9.1 `LoginScreen` (336 líneas)

**Funcionalidad:** autenticación simulada con credenciales demo.

- **Demo credentials** hardcodeadas (4 roles)
- **Auto-fill** al click en una fila
- **Validación** solo por email (regex) + password >= 4 chars
- **Detección de rol por email:** si contiene "super" → SUPER_ADMIN, "admin" → ADMIN, "despacho"/"kds" → DESPACHADORA, resto → CAJERA
- **Feedback animado** durante verificación (simulado con `setTimeout`)
- **Atajo de teclado:** Enter en el form

### 9.2 `POSScreen` (678 líneas) — el más complejo

**Layout:** dos columnas (catálogo izq + carrito der) sobre flex.

**Estado interno:**
- `selectedCategory`: `'all' | 'principales' | 'bebidas' | 'extras'`
- `searchQuery`: string
- `orderType`: `'MESA' | 'LLEVAR'`
- `tableNumber`: string
- `cartItems: OrderItem[]`
- `showCustomerDropdown`, `customerSearch`: para autocomplete
- `showComboModal`, `selectedProductForConfig`, `showPaymentModal`, `showCustomModal`: modales

**Funcionalidades:**
- **Filtrado** por categoría + búsqueda textual (nombre, descripción, código)
- **Cards de producto** con imagen, badge, piezas, precio
- **Click en card** abre modal de combo si es configurable, sino agrega directo
- **Cart con qty +/-, remove, subtotal automático**
- **Autocomplete de clientes** con opción "S/N" (sin nombre)
- **Tres acciones de cobro:**
  - [F1] Registrar Pago (Efectivo/QR) → PaymentModal
  - Pago Pendiente [FR-011] → crea orden sin cobrar
  - Limpiar Pedido
- **Toast notifications** (3 segundos)

### 9.3 `KitchenScreen` (523 líneas) — KDS

**Estado interno:**
- `tickets: KDSTicket[]` (mock inicial de 4 tickets: 105, 103, 102, 101)
- `filter`: `'ALL' | 'EN_PREPARACION' | 'LISTO' | 'MESA' | 'LLEVAR'`
- `searchQuery`: string

**Funcionalidades:**
- **Filtros múltiples** (estado + tipo de orden)
- **Cards por comanda** con borde de color según estado:
  - Verde: LISTO / ANUNCIADO
  - Rojo: EN_PREPARACION / NUEVO
  - Amber: PAGO PENDIENTE
- **Botones contextuales** según estado:
  - NUEVO → "Iniciar Preparación"
  - EN_PREPARACION → "Marcar Listo"
  - LISTO → "Avisar a Pantalla"
  - ANUNCIADO → "Marcar Entregado"
- **Modal de Pantalla Pública de Turnos** (fullscreen dark mode) con dos secciones:
  - LISTOS PARA RECOGER (verde)
  - EN PREPARACIÓN (amber)
- **Alerta FR-011** en comandas con pago pendiente

### 9.4 `CatalogScreen` (1229 líneas) — el más extenso

**Layout:** tabla con filtros + 2 modales (reglas + nuevo producto).

**Funcionalidades:**
- **Filtros:** categoría, estado (activo/inactivo), búsqueda
- **Tabla con 9 columnas:** código, producto+imagen, categoría, precio, variantes, reglas, control presas, POS activo, acciones
- **Toggle activo/inactivo** por fila (switch animado)
- **Modal "Reglas de Armado"** (solo lectura) con 3 tabs:
  - Presas obligatorias (con count + tipos permitidos)
  - Acompañamiento y sustituciones
  - Bebida y extras
- **Modal "Registrar Nuevo Producto"** con 5 filas:
  1. Nombre + Código/SKU
  2. Precio base + Categoría (con opción custom)
  3. Descripción
  4. Flags booleanos (`active`, `isSellable`, `isInventoryItem`)
  5. Reglas de variante con 3 sub-tabs (presas, acompañantes, bebidas)

> **Complejidad alta:** el modal de nuevo producto replica la estructura de `ComboVariantModal` (3 tabs). Hay potencial para extraer sub-componentes.

### 9.5 `ClientsScreen` (668 líneas)

**Funcionalidades:**
- Tabla con búsqueda full-text (nombre, CI, NIT, teléfono, email)
- Paginación (5/10/20 por página)
- Modal unificado para crear/editar clientes
- **Toggle corporativo:** muestra campos NIT + Razón Social si es empresa
- **Validación de CI/NIT** con extensiones departamentales (LP, SC, CB, OR, PT, TJ, CH, BE, PA, EA)
- **Nota legal SIN** sobre facturación nominada > Bs. 1.000

### 9.6 `ShiftScreen` (598 líneas)

**Dos modos:**
- `standalone={true}` → mostrado cuando `!shift.isOpen` (full-bleed como login)
- `standalone={false}` → integrado en `<main>`

**Formulario de apertura:**
- Paso 1: Período (MAÑANA / NOCHE)
- Paso 2: Caja (01 / 02 / 03 bloqueada)
- Paso 3: Fondo inicial (con presets 100/150/200/+Bs.20/+Bs.50)

**Si ya está abierto:** muestra resumen con datos del operador, sucursal, fondo, fecha.

### 9.7 `ShiftControlScreen` (527 líneas) — Arqueo y cierre

**Funcionalidades:**
- Tabla de cajas activas con totales
- **Conteo físico de efectivo** con denominaciones (200/100/50/20/10 + monedas)
- **Cuadre operativo** con cálculo automático:
  - Fondo inicial + Ventas efectivo - Gastos - Vales
  - Diferencia vs. efectivo contado
  - Banner de estado: OK / Sobrante / Faltante
- **Modal "Acta Z"** con todos los datos para impresión fiscal

### 9.8 `PendingOrdersScreen` (412 líneas)

**Funcionalidades:**
- Grid de pedidos pendientes (3 iniciales: 103, 106, 108)
- **Botón "Cobrar Pedido"** abre `PaymentModal` reutilizado
- **Botón "Cancelar"** con `confirm()` nativo del browser
- Modal de "Confirmación de Despacho" (info)

### 9.9 `HistoryScreen` (255 líneas)

**Funcionalidades:**
- Tabla de órdenes con búsqueda
- **Modal de reimpresión** que simula ticket térmico con layout de 80mm

### 9.10 `PersonnelScreen` (460 líneas)

**Funcionalidades:**
- Tabla de operadores con filtro por rol
- Toggle activo/inactivo
- Modal para registrar nuevo operador (nombre, CI, teléfono, email, rol, sucursal)
- Nota de seguridad sobre `bcryptjs`

### 9.11 `BranchesScreen` (457 líneas)

**Funcionalidades:**
- Tabla de sucursales (3 iniciales)
- Toggle de estado de red
- Modal para crear nueva sucursal con sync automático de catálogo

### 9.12 `PublicOrderScreen` (254 líneas)

**Funcionalidades:**
- Buscador de ticket (default `#105`)
- Stepper visual de progreso: Confirmado → En Preparación → Listo → Entregado
- Lee `kdsTickets` desde `useOrdersStore`

### 9.13 Dashboards

- **`SuperAdminDashboard` (211 líneas):** KPIs globales (ventas hoy +14.2%, sedes conectadas) + tabla de sucursales usando `CommonTable`.
- **`BranchAdminDashboard` (240 líneas):** 4 KPI cards (ventas turno, comandas KDS, pago pendiente, estado turno) + tabla de arqueos.

### 9.14 Modales específicos

| Modal | Líneas | Función |
|---|---|---|
| `ComboVariantModal` | 779 | Selección rápida o granular de presas, acompañamiento, bebida + temperatura |
| `CustomItemModal` | 718 | Venta customizada en 3 pasos (presas, acompañantes, bebidas) con cálculo en tiempo real |
| `PaymentModal` | 465 | Cobro con efectivo (cálculo de cambio), QR, o pendiente (FR-011) |

---

## 10. Hallazgos y oportunidades

### 10.1 Fortalezas

1. **Sistema de diseño consistente:** paleta y patrones visuales repetidos correctamente en todo el codebase.
2. **Dark mode completo y bien implementado:** cubre explícitamente backgrounds, borders, inputs, modales, badges.
3. **Modelo de dominio rico:** `ProductVariantRules` permite representar fielmente la lógica del negocio (pollo broaster con presas intercambiables).
4. **Componentes reutilizables potentes:** `AppModal` y `CommonTable<T>` están bien diseñados y son extensibles.
5. **TypeScript estricto:** uso de generics (`<T>` en `CommonTable`), union types para roles/screens/status.

### 10.2 Debilidades y oportunidades

#### Arquitectura

| Problema | Impacto | Recomendación |
|---|---|---|
| **Estado duplicado** entre `App.tsx` (useState) y `useOrdersStore` | POSScreen y KitchenScreen no comparten datos reales; KDS muestra mocks | Mover products/orders/customers a stores Zustand; conectar `handleCompleteSale` con `useOrdersStore.addOrder()` |
| **Dos sistemas de OrderStatus** (`CompletedOrder.status` vs `KitchenScreen.status`) | Estados desincronizados | Unificar usando `OrderStatus` de `types.ts` |
| **No hay routing real** | Imposible hacer deep-linking, compartir URLs, browser back/forward | Adoptar `react-router-dom` v6 (modo declarativo es limitante para producción) |
| **No hay services layer** | Toda lógica de fetch eventual quedará en componentes | Crear `src/services/` con funciones async (hoy no hay pero se necesita cuando se integre backend) |

#### Calidad de código

| Problema | Impacto | Recomendación |
|---|---|---|
| **Repetición masiva de UI patterns** (toasts, cards, inputs) | ~30% más código del necesario | Extraer `<Toast>`, `<Card>`, `<Button>`, `<TextField>`, `<Badge>` como primitivos |
| **Handlers simulados** (`alert`, `confirm`, `showToast`) | No refleja comportamiento real | Reemplazar por `useConfirmDialog()` y feedback real |
| **Catálogos hardcodeados** en componentes (DENOMINATIONS, DRINKS, SIDES) | Duplicación, difícil mantener | Mover a `data/` como catálogos |
| **Sin tests automatizados** | Refactor riesgoso | Adoptar Vitest + React Testing Library; empezar por componentes críticos (`POSScreen`, `PaymentModal`, `ComboVariantModal`) |
| **Dependencias declaradas sin uso** (`express`, `@google/genai`, `zod`, `dotenv`, `motion`, `lucide-react`) | Bundle más grande de lo necesario | Limpiar `package.json` o usarlas |

#### UX y producto

| Problema | Impacto | Recomendación |
|---|---|---|
| **Tickets no se persisten** entre recargas | Pérdida de datos en demo | Agregar persistencia con Zustand `persist` middleware |
| **No hay confirmación real** para acciones críticas (cerrar turno, cancelar comanda) | UX inconsistente (usa `confirm()` nativo del browser) | Usar `ConfirmDialog` con mensajes descriptivos |
| **Búsqueda de clientes sin highlighting** de matches | UX pobre en catálogos grandes | Implementar highlighting de texto coincidente |
| **Sin atajos de teclado** reales (los [F1], [F4] son solo labels) | Operador de caja más lento | Implementar `useHotkeys` o `react-hotkeys-hook` |

#### Performance

| Problema | Impacto | Recomendación |
|---|---|---|
| **Re-renders globales** en App.tsx al cambiar `currentScreen` | Re-monta Header/Sidebar en cada navegación | Usar `React.memo` o split con rutas |
| **Sin code-splitting** | Bundle único grande | Implementar `React.lazy` por pantalla |
| **Imágenes externas** (Google CDN URLs hardcodeadas) | Latencia, dependencia externa | Usar `vite-imagetools` o migrar a `next/image`-style local |

### 10.3 Riesgos para producción

1. **Seguridad:** No hay validación de tokens, ni sanitización. Las passwords son CI en texto plano.
2. **Accesibilidad:** Faltan roles ARIA extendidos, focus management en modales, navegación por teclado completa.
3. **Internacionalización:** Textos hardcodeados en español; no hay i18n.
4. **Offline-first:** No hay service worker ni IndexedDB; imposible operar sin conexión.
5. **Fiscal Bolivia:** El sistema referencia normativa SIN pero no genera facturas electrónicas reales.

---

## 11. Recomendaciones priorizadas

### Corto plazo (1-2 sprints)

1. **Unificar el modelo de OrderStatus** en `types.ts` y eliminar la duplicación
2. **Migrar products/orders/customers a Zustand stores** y conectar el flujo POS → KDS
3. **Extraer primitives de UI** (Button, Card, Input, Badge, Toast) usando `@apply`
4. **Reemplazar `alert()`/`confirm()`** por `ConfirmDialog`
5. **Agregar persistencia con Zustand `persist`** para turnos y carrito

### Mediano plazo (3-4 sprints)

1. **Adoptar `react-router-dom`** para routing real con deep-linking
2. **Crear capa de services** para llamadas a API cuando exista backend
3. **Implementar tests con Vitest** para los 3 flujos críticos (POS, KDS, Apertura de turno)
4. **Implementar atajos de teclado** para cajera (F1=cobrar, F2=pendiente, F3=limpiar, F4=cancelar)
5. **Migrar catálogos hardcodeados** a `data/catalogs.ts`

### Largo plazo

1. **Code-splitting por pantalla** con `React.lazy`
2. **Service Worker + IndexedDB** para operación offline
3. **Integración real con SIN Bolivia** para facturación electrónica
4. **Refactor a Screaming Architecture** organizando por dominio (carpetas `pos/`, `kds/`, `shifts/`, `customers/`, `catalog/`, `branches/`)

---

## 12. Conclusión

**Wonder Chicken Frontend Prototype** es un prototipo visualmente pulido y con un modelo de dominio sólido para su vertical (pollerías con configuración granular de presas), pero **no está listo para producción** por la ausencia de backend real, persistencia, routing y tests.

Su principal valor reside en:

- **Sistema de diseño coherente** que sirve como blueprint visual
- **Modelo de datos rico** en `types.ts` que anticipa la complejidad del negocio
- **Componentes reutilizables** (`AppModal`, `CommonTable<T>`) que pueden escalarse

El siguiente paso natural es **conectar los stores Zustand con el flujo de venta real** (POS → `useOrdersStore.addOrder()` → KitchenScreen refleja el cambio) para validar la arquitectura propuesta antes de invertir en backend.

---

**Archivos relevantes:**

- `src/App.tsx` — router declarativo y estado de alto nivel
- `src/types.ts` — modelo de dominio completo
- `src/commonComponents/AppModal.tsx` — base de todos los modales
- `src/commonComponents/CommonTable.tsx` — tabla genérica tipada
- `src/components/POSScreen.tsx` — flujo de venta principal
- `src/components/CatalogScreen.tsx` — gestión de catálogo y reglas (más extenso)
- `src/features/orders/stores/orders.store.ts` — integración POS↔KDS (pendiente de conectar)
- `src/index.css` — sistema de dark mode completo
- `src/config/colors.ts` — tokens de marca
