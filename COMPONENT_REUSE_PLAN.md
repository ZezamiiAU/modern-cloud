# Zezamii Component Reuse Implementation Plan

> **🚀 ARCHITECTURE UPDATE (2026-01-07):**
> Phase 1 has been upgraded to build a production-grade **Identity & Activity Workstation** using **TanStack Table v8**, **shadcn/ui**, and **Recharts**. This high-performance workstation will serve as the foundation for all future data tables across Zezamii products. See `IDENTITY_WORKSTATION_SPEC.md` for complete specifications.

## Executive Summary

This document outlines the systematic extraction and implementation of 10 high-priority reusable components from v0 prototypes into the production monorepo. The goal is to eliminate duplication across 70+ existing components and establish consistent, reusable building blocks for all 6 Zezamii products (Cloud, Access, Lockers, Rooms, Bookings, Vision).

**Current State:**
- 70+ UI components scattered across v0 prototypes
- 15+ feature-specific components with heavy duplication
- Inconsistent table implementations, filter patterns, and status displays
- Basic components exist but lack advanced features

**Target State:**
- Unified component library in `packages/ui` powered by **TanStack Table v8**
- **Identity & Activity Workstation** as flagship data table implementation
- Consistent design patterns across all products
- Reduced duplication and maintenance burden
- Enterprise features: sorting, filtering, pagination, search, export, column management
- Modern 2026 aesthetic with glassmorphic effects

---

## Gap Analysis

### Components That Exist (Need Enhancement)

| Component | Location | Current Features | Missing Features |
|-----------|----------|------------------|------------------|
| **DataTable** | `packages/ui/src/components/data-table.tsx` | Basic table, column formatting, StatusBadge | Sorting, filtering, pagination, search, row selection, loading states |
| **StatusBadge** | `packages/ui/src/components/data-table.tsx` (lines 41-66) | 4 color variants (success, failed, pending, warning) | Icons, more variants (active, inactive, info), size variants |
| **StatCard** | `packages/ui/src/components/stat-card.tsx` | Label, value, change indicator, icon support | Trend arrows, comparison mode, loading skeleton |
| **PageHeader** | `packages/ui/src/components/page-header.tsx` | Title, description, actions slot | Breadcrumbs, tabs, back button |

### Components That Don't Exist (Need Creation)

1. **FilterBar** - Comprehensive filter component with search, chips, segments, dropdowns
2. **ActivityFeed/Timeline** - Vertical timeline with event icons and timestamps
3. **ResourceSelector** - Multi-select dropdown with search and integration badges
4. **DrawerPanel** - Slide-out panel from right with tabs and sections
5. **CredentialIcon** - Icon mapper for credential types with consistent styling
6. **IntegrationBadge** - Predefined colors per integration type
7. **EmptyState** - Enhanced empty state with variants and CTAs

---

## Phased Implementation Plan

### Phase 1: Critical Reusable Components (Week 1-2)
**Priority: CRITICAL** - Most duplicated across codebase

> **ARCHITECTURE UPDATE:** Phase 1 will build the **Identity & Activity Workstation** using **TanStack Table v8** and **shadcn/ui**. This is a production-grade implementation that will serve as the foundation for all future data tables across Zezamii products.
>
> **See:** `IDENTITY_WORKSTATION_SPEC.md` for complete technical specifications.

#### 1.1 Identity Workstation (TanStack Table-based)
- **Effort:** 8-10 days
- **Architecture:** TanStack Table v8 + shadcn/ui + Recharts
- **Dependencies to Add:**
  - `@tanstack/react-table`: ^8.11.0
  - `recharts`: ^2.10.0
  - `date-fns`: ^3.0.0

- **Core Features:**
  - **Toolbar:** Search (debounced), Filter dropdowns (Team/Role/Status), Export (CSV/JSON), Column visibility toggle
  - **TanStack Table:** Sortable headers, resizable columns, column visibility management
  - **Specialized Columns:**
    - User (Avatar + Name + Email)
    - Team, Role, Status (with StatusBadge)
    - Credentials (Mobile/PIN/Card icons)
    - Behavioral Sparkline (7-day activity chart)
    - Last Event (Product icon + timestamp)
  - **Activity Drawer:** Right-side Sheet with user summary, timeline of last 50 events, glassmorphic styling
  - **Performance:** Row virtualization for 1000+ rows

- **Components Created:**
  - `identity-workstation.tsx` - Main table component
  - `workstation-toolbar.tsx` - Search, filters, export, column visibility
  - `activity-drawer.tsx` - Slide-out drawer with user details
  - `activity-timeline.tsx` - Scrollable event feed
  - `behavioral-sparkline.tsx` - 7-day activity chart
  - `credential-icons.tsx` - Credential type icons

- **Design:** Modern 2026 Light Mode, Inter Variable font, glassmorphic blur on drawer

**Implementation Phases:**
1. Days 1: Setup dependencies, create component structure
2. Days 2-3: Core TanStack Table with sorting, resizing, visibility
3. Day 4: Toolbar with search, filters, export
4. Day 5: Visual components (sparklines, credential icons)
5. Days 6-7: Activity Drawer with timeline
6. Day 8: Polish, loading states, accessibility
7. Days 9-10: Integration examples, documentation

#### 1.2 Enhanced StatusBadge (Standalone)
- **Effort:** 1 day
- **Note:** Required by Identity Workstation, extracted for reusability
- **Features:**
  - Extract from data-table.tsx to standalone component
  - Add icon support (lucide-react icons)
  - Add size variants (sm, md, lg)
  - Add more status types: active, inactive, info, error
  - Add dot variant (minimal badge with colored dot)
- **Files:**
  - Create: `packages/ui/src/components/status-badge.tsx`
  - Update: `packages/ui/src/components/identity-workstation.tsx` (import StatusBadge)

#### 1.3 FilterBar Component (Standalone - Optional)
- **Effort:** 1 day
- **Note:** Much of this is now integrated into WorkstationToolbar. This standalone version is for simpler use cases.
- **Features:**
  - Search input with debounce
  - Filter chips (removable)
  - Segmented control for view modes
  - Dropdown filters
  - Clear all filters button
  - Filter count badge
- **Files:**
  - Create: `packages/ui/src/components/filter-bar.tsx`
  - Create: `packages/ui/src/components/filter-chip.tsx`
  - Create: `packages/ui/src/components/segmented-control.tsx`
- **Decision:** Build this if other products need simpler filtering without full table. Can defer to Phase 2.

**Phase 1 Deliverables:**
- **Identity Workstation:** Production-ready workstation with 6 sub-components
- **StatusBadge:** Standalone badge component
- **FilterBar:** (Optional) Simpler filter component for non-table use cases
- Full TypeScript types and documentation
- Integration example in Cloud app
- `IDENTITY_WORKSTATION_SPEC.md` technical specification

---

### Phase 2: Dashboard Components (Week 3)
**Priority: HIGH** - Used across all product dashboards

> **Note:** ActivityTimeline is already built as part of Identity Workstation in Phase 1. This phase focuses on standalone dashboard components.

#### 2.1 Enhanced MetricCard (StatCard)
- **Effort:** 1-2 days
- **Features to Add:**
  - Trend arrows (up/down/neutral)
  - Comparison mode (vs previous period)
  - Loading skeleton state
  - Sparkline mini-chart option (leverage BehavioralSparkline from Phase 1)
  - Click handler for drill-down
- **Files:**
  - Enhance: `packages/ui/src/components/stat-card.tsx`
  - Rename to: `packages/ui/src/components/metric-card.tsx` (consider)

#### 2.2 ActivityFeed (Standalone)
- **Effort:** 1 day
- **Note:** Already built as `activity-timeline.tsx` in Phase 1. This task extracts it as standalone component for use outside the drawer.
- **Features:**
  - Vertical timeline layout
  - Event icons (lucide-react)
  - Timestamps (relative and absolute)
  - Event type variants (info, success, warning, error)
  - Avatar support for user events
  - Expandable event details
  - Loading state with skeleton
- **Files:**
  - Extract: `packages/ui/src/components/activity-feed.tsx` (from activity-timeline.tsx)
  - Create: `packages/ui/src/components/timeline-item.tsx`

**Phase 2 Deliverables:**
- Enhanced MetricCard with trends and comparisons
- Standalone ActivityFeed component
- Integration examples with real data
- Responsive design for mobile/tablet

---

### Phase 3: Form & Specialized Components (Week 4)
**Priority: MEDIUM** - Product-specific but reusable

> **Note:** CredentialIcons is already built as part of Identity Workstation in Phase 1.

#### 3.1 ResourceSelector
- **Effort:** 2 days
- **Features:**
  - Search with debounce
  - Multi-select with checkboxes
  - Integration badges per resource
  - Selected items display
  - Clear selection button
  - Loading and empty states
- **Files:**
  - Create: `packages/ui/src/components/resource-selector.tsx`

#### 3.2 CredentialIcons (Standalone)
- **Effort:** 0.5 day
- **Note:** Already built as `credential-icons.tsx` in Phase 1. This task ensures it's properly documented and exported for standalone use.
- **Features:**
  - Type mapping (card, phone, pin, qr, etc.)
  - Consistent icon sizing
  - Tooltip with credential type
  - Color variants per type
- **Files:**
  - Document: `packages/ui/src/components/credential-icons.tsx`
  - Ensure exported in `packages/ui/src/index.ts`

#### 3.3 IntegrationBadge
- **Effort:** 0.5 day
- **Features:**
  - Predefined colors per integration (Xero, MYOB, Google, etc.)
  - Icon + label layout
  - Size variants
- **Files:**
  - Create: `packages/ui/src/components/integration-badge.tsx`

#### 3.4 DrawerPanel (Generic)
- **Effort:** 1 day
- **Note:** ActivityDrawer is already built in Phase 1. This creates a generic, reusable drawer panel component.
- **Features:**
  - Slide from right animation
  - Tab navigation within drawer
  - Close button and overlay
  - Responsive (full screen on mobile)
  - Section dividers
- **Files:**
  - Extract/Generalize: `packages/ui/src/components/drawer-panel.tsx` (from activity-drawer.tsx)
  - Create: `packages/ui/src/components/drawer-tabs.tsx`

#### 3.5 Enhanced EmptyState
- **Effort:** 1 day
- **Features:**
  - Variants: no-data, no-results, error, coming-soon
  - Icon support
  - Title + description
  - Primary and secondary action buttons
  - Illustration support (optional)
- **Files:**
  - Create: `packages/ui/src/components/empty-state.tsx`

**Phase 3 Deliverables:**
- 5 specialized components
- Integration with existing forms and modals
- Accessibility compliance (ARIA labels, keyboard nav)

---

## Component Specifications

### 1. Enhanced DataTable

**API:**
```typescript
interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  format?: ColumnFormat;
  className?: string;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];

  // Search & Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  // Sorting
  sortable?: boolean;
  defaultSort?: { key: keyof T; direction: 'asc' | 'desc' };
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;

  // Pagination
  paginated?: boolean;
  pageSize?: number;
  totalRows?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;

  // Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;

  // States
  loading?: boolean;
  emptyState?: React.ReactNode;

  // Styling
  title?: string;
  description?: string;
  className?: string;
}
```

**Usage Example:**
```typescript
<DataTable
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', format: 'status' },
  ]}
  data={users}
  searchable
  paginated
  pageSize={10}
  selectable
  onSelectionChange={(rows) => setSelectedUsers(rows)}
/>
```

---

### 2. FilterBar Component

**API:**
```typescript
interface FilterChip {
  id: string;
  label: string;
  value: string;
  removable?: boolean;
}

interface FilterSegment {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdown {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  // Search
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;

  // Filter Chips
  chips?: FilterChip[];
  onChipRemove?: (chipId: string) => void;

  // Segmented Control
  segments?: FilterSegment[];
  activeSegment?: string;
  onSegmentChange?: (segment: string) => void;

  // Dropdown Filters
  dropdowns?: FilterDropdown[];

  // Actions
  onClearAll?: () => void;
  filterCount?: number;

  className?: string;
}
```

**Usage Example:**
```typescript
<FilterBar
  searchValue={search}
  searchPlaceholder="Search people..."
  onSearchChange={setSearch}

  chips={[
    { id: '1', label: 'Active', value: 'active' },
    { id: '2', label: 'IT Department', value: 'dept-it' },
  ]}
  onChipRemove={(id) => removeFilter(id)}

  segments={[
    { value: 'all', label: 'All', count: 150 },
    { value: 'active', label: 'Active', count: 120 },
    { value: 'inactive', label: 'Inactive', count: 30 },
  ]}
  activeSegment="all"
  onSegmentChange={setSegment}

  onClearAll={() => clearAllFilters()}
  filterCount={2}
/>
```

---

### 3. Enhanced StatusBadge

**API:**
```typescript
type StatusVariant =
  | 'success' | 'failed' | 'pending' | 'warning'
  | 'active' | 'inactive' | 'info' | 'error';

type StatusSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  icon?: boolean;
  size?: StatusSize;
  variant?: 'default' | 'dot';
  className?: string;
}
```

**Usage Example:**
```typescript
<StatusBadge status="success" icon />
<StatusBadge status="pending" label="In Progress" size="sm" />
<StatusBadge status="active" variant="dot" />
```

---

### 4. MetricCard (Enhanced StatCard)

**API:**
```typescript
interface MetricCardProps {
  label: string;
  value: string | number;

  // Trend
  trend?: {
    value: number; // percentage change
    direction: 'up' | 'down' | 'neutral';
    label?: string; // e.g., "vs last month"
  };

  // Comparison
  comparison?: {
    current: number;
    previous: number;
    label: string;
  };

  // Visual
  icon?: IconName;
  sparkline?: number[]; // data points for mini chart

  // States
  loading?: boolean;

  // Interaction
  onClick?: () => void;
  href?: string;

  className?: string;
}
```

**Usage Example:**
```typescript
<MetricCard
  label="Total Users"
  value={1234}
  trend={{ value: 12.5, direction: 'up', label: 'vs last month' }}
  icon="users"
  onClick={() => navigate('/users')}
/>
```

---

### 5. ActivityFeed/Timeline

**API:**
```typescript
interface TimelineEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: IconName;
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: React.ReactNode;
  expandable?: boolean;
  details?: React.ReactNode;
}

interface ActivityFeedProps {
  events: TimelineEvent[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onEventClick?: (eventId: string) => void;
  className?: string;
}
```

**Usage Example:**
```typescript
<ActivityFeed
  events={[
    {
      id: '1',
      type: 'success',
      icon: 'check-circle',
      title: 'Access granted to Building A',
      description: 'John Doe was granted access',
      timestamp: new Date(),
      user: { name: 'Admin User' },
    },
    {
      id: '2',
      type: 'warning',
      icon: 'alert-triangle',
      title: 'Failed access attempt',
      timestamp: new Date(),
    },
  ]}
/>
```

---

### 6. ResourceSelector

**API:**
```typescript
interface Resource {
  id: string;
  name: string;
  type?: string;
  integration?: string;
  metadata?: Record<string, any>;
}

interface ResourceSelectorProps {
  resources: Resource[];
  selectedIds?: string[];
  onChange: (selectedIds: string[]) => void;

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;

  // Filtering
  filterByType?: boolean;
  filterByIntegration?: boolean;

  // Display
  showIntegrationBadges?: boolean;
  multiSelect?: boolean;

  // States
  loading?: boolean;
  emptyState?: React.ReactNode;

  className?: string;
}
```

**Usage Example:**
```typescript
<ResourceSelector
  resources={allSpaces}
  selectedIds={selectedSpaceIds}
  onChange={setSelectedSpaceIds}
  searchable
  multiSelect
  showIntegrationBadges
  filterByIntegration
/>
```

---

### 7. CredentialIcon

**API:**
```typescript
type CredentialType = 'card' | 'phone' | 'pin' | 'qr' | 'biometric' | 'key';

interface CredentialIconProps {
  type: CredentialType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}
```

**Usage Example:**
```typescript
<CredentialIcon type="card" size="md" showTooltip />
<CredentialIcon type="phone" />
```

---

### 8. IntegrationBadge

**API:**
```typescript
type IntegrationType = 'xero' | 'myob' | 'google' | 'microsoft' | 'slack' | 'custom';

interface IntegrationBadgeProps {
  type: IntegrationType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}
```

**Usage Example:**
```typescript
<IntegrationBadge type="xero" />
<IntegrationBadge type="google" label="Google Workspace" showIcon />
```

---

### 9. DrawerPanel

**API:**
```typescript
interface DrawerTab {
  id: string;
  label: string;
  icon?: IconName;
  content: React.ReactNode;
}

interface DrawerPanelProps {
  open: boolean;
  onClose: () => void;

  // Content
  title?: string;
  description?: string;
  tabs?: DrawerTab[];
  children?: React.ReactNode;

  // Layout
  width?: 'sm' | 'md' | 'lg' | 'xl';

  // Footer
  footer?: React.ReactNode;

  className?: string;
}
```

**Usage Example:**
```typescript
<DrawerPanel
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Person Details"
  tabs={[
    { id: 'info', label: 'Info', content: <PersonInfo /> },
    { id: 'access', label: 'Access', content: <AccessHistory /> },
    { id: 'credentials', label: 'Credentials', content: <Credentials /> },
  ]}
  footer={
    <Button onClick={handleSave}>Save Changes</Button>
  }
/>
```

---

### 10. Enhanced EmptyState

**API:**
```typescript
type EmptyStateVariant = 'no-data' | 'no-results' | 'error' | 'coming-soon';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  icon?: IconName;
  illustration?: React.ReactNode;
  title: string;
  description?: string;

  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  className?: string;
}
```

**Usage Example:**
```typescript
<EmptyState
  variant="no-data"
  icon="users"
  title="No people yet"
  description="Get started by adding your first person"
  primaryAction={{
    label: "Add Person",
    onClick: () => openAddModal()
  }}
/>
```

---

## Migration Strategy

### For Each Component

1. **Create Component** - Implement in `packages/ui/src/components/`
2. **Export** - Add to `packages/ui/src/index.ts`
3. **Document** - Add usage examples and props documentation
4. **Test** - Create basic integration tests
5. **Migrate** - Update consuming apps one product at a time

### Migration Order (Products)

1. **Cloud** - Base product, lowest risk
2. **Access** - Most mature, good test case
3. **Lockers, Rooms** - Medium complexity
4. **Bookings, Vision** - Newest products, easiest to migrate

### Rollout Strategy

- **Week 1**: Phase 1 components ready → Migrate Cloud product
- **Week 2**: Phase 2 components ready → Migrate Access + Lockers
- **Week 3**: Phase 3 components ready → Migrate Rooms + Bookings + Vision

---

## Design System Integration

### Color Tokens
All components should use existing design system colors:
- Product colors: `access`, `lockers`, `rooms`, `bookings`, `vision`, `cloud`
- Semantic colors: `brand`, `destructive`, `muted`, `accent`
- Status colors: Use StatusBadge color mapping

### Typography
- Use Tailwind typography utilities
- Maintain existing font scale

### Spacing
- Use Tailwind spacing scale (1-12)
- Consistent padding/margin patterns

### Icons
- Primary: lucide-react icons
- Custom: Product icons from `product-icons.tsx`

---

## Success Metrics

### Quantitative
- **Reduce duplication**: 70+ components → 10 core reusable components
- **Code reduction**: Estimate 30-40% reduction in UI code
- **Bundle size**: Monitor and maintain or reduce current bundle size

### Qualitative
- **Consistency**: All products use same components with same behavior
- **Developer experience**: Easier to build new features
- **Maintenance**: Single source of truth for fixes and enhancements

---

## Timeline Summary

| Phase | Duration | Components | Status |
|-------|----------|------------|--------|
| Phase 1 | Weeks 1-2 (10 days) | **Identity Workstation** (TanStack Table + 6 sub-components), StatusBadge, (Optional) FilterBar | 🔴 Not Started |
| Phase 2 | Week 3 (5 days) | Enhanced MetricCard, Standalone ActivityFeed | 🔴 Not Started |
| Phase 3 | Week 4 (5 days) | ResourceSelector, IntegrationBadge, Generic DrawerPanel, EmptyState, CredentialIcons docs | 🔴 Not Started |

**Total Duration:** 4 weeks (20 working days)

**Major Deliverable:** Identity & Activity Workstation (Phase 1) - See `IDENTITY_WORKSTATION_SPEC.md`

---

## Next Steps

1. ✅ **Complete Gap Analysis** - DONE
2. 🔄 **Review This Plan** - In Progress (awaiting user approval)
3. ⏳ **Begin Phase 1 Implementation** - Not Started
4. ⏳ **Migrate Cloud Product** - Not Started
5. ⏳ **Iterate and Refine** - Not Started

---

## Notes

- All components should be **server-compatible** where possible (default export as RSC)
- For client components, use `"use client"` directive at top
- Maintain **TypeScript strict mode** compliance
- Follow **accessibility best practices** (ARIA labels, keyboard navigation)
- Add **loading skeletons** for all components with loading states
- Include **empty states** for all list/table components

---

## Questions for Review

### Identity Workstation Specific
1. Should the Activity Drawer show real-time updates (WebSocket) or static snapshot?
2. Do we need bulk selection/actions in Phase 1?
3. Should sparklines be clickable to show detailed chart modal?
4. Export permissions - any restrictions on who can export user data?
5. Should we implement server-side pagination initially or client-side is fine for <1000 users?
6. Inter Variable font - already installed globally or need to add to fonts?

### General Component Questions
7. Should we create Storybook stories for these components?
8. Do we need unit tests (Jest/React Testing Library)?
9. Should MetricCard replace StatCard or coexist?
10. Timeline for this work - 4 weeks realistic?
11. Any additional components from v0 catalog we should prioritize?

### Architecture Decisions
12. TanStack Table v8 - approved for all future tables across products?
13. Recharts for data visualizations - standard choice or alternatives?
14. Should we build the optional standalone FilterBar in Phase 1 or defer?
