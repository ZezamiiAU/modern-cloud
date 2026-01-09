# Zezamii Pro Identity & Activity Workstation

## Overview

A high-performance data workstation for managing user identities, credentials, and real-time activity across all Zezamii products. Built with TanStack Table v8 and shadcn/ui for maximum performance and flexibility.

---

## Technical Architecture

### Core Technologies

- **TanStack Table v8** - Enterprise-grade table with sorting, filtering, column resizing, virtualization
- **shadcn/ui** - Accessible, customizable UI components
- **Sheet Component** - Right-side drawer for activity details
- **Recharts** - Sparkline charts for behavioral trends
- **Date-fns** - Relative time formatting

### Dependencies to Add

```json
{
  "@tanstack/react-table": "^8.11.0",
  "recharts": "^2.10.0",
  "date-fns": "^3.0.0"
}
```

---

## Component Architecture

### 1. IdentityWorkstation (Main Component)

**Location:** `packages/ui/src/components/identity-workstation.tsx`

```typescript
interface IdentityWorkstationProps {
  users: User[];
  onUserClick?: (userId: string) => void;
  loading?: boolean;
  className?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  team: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  credentials: {
    mobile: boolean;
    pin: boolean;
    card: boolean;
    qr?: boolean;
  };
  activitySparkline: number[]; // 7-day activity counts
  lastEvent?: {
    type: 'access' | 'rooms' | 'lockers' | 'bookings' | 'vision';
    action: string;
    timestamp: Date;
  };
  activeCoverage?: {
    spacesAllowed: number;
    devicesAllowed: number;
  };
}
```

### 2. WorkstationToolbar

**Location:** `packages/ui/src/components/workstation-toolbar.tsx`

**Features:**
- Search input with debounce (300ms)
- Filter dropdowns (Team, Role, Status)
- Column visibility toggle
- Export button (CSV/JSON)
- Active filter chips

```typescript
interface WorkstationToolbarProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filters: {
    team?: string;
    role?: string;
    status?: string;
  };
  onFilterChange: (key: string, value: string | null) => void;

  // Teams, roles, statuses for dropdowns
  teams: string[];
  roles: string[];
  statuses: Array<{ value: string; label: string }>;

  // Column Visibility
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (columns: Record<string, boolean>) => void;
  availableColumns: Array<{ id: string; label: string }>;

  // Export
  onExport: (format: 'csv' | 'json') => void;
  exportLoading?: boolean;

  // Filter count
  activeFilterCount: number;
  onClearFilters: () => void;
}
```

### 3. ActivityDrawer

**Location:** `packages/ui/src/components/activity-drawer.tsx`

**Features:**
- Slide from right with glassmorphic blur
- User summary header
- Scrollable timeline (last 50 events)
- Color-coded product icons
- Relative timestamps

```typescript
interface ActivityDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User;
  events: ActivityEvent[];
  loading?: boolean;
}

interface ActivityEvent {
  id: string;
  type: 'access' | 'rooms' | 'lockers' | 'bookings' | 'vision' | 'cloud';
  action: string;
  description: string;
  timestamp: Date;
  location?: string;
  device?: string;
  metadata?: Record<string, any>;
}
```

### 4. ActivityTimeline

**Location:** `packages/ui/src/components/activity-timeline.tsx`

**Features:**
- Vertical timeline with color-coded dots
- Product-specific icons
- Relative timestamps ("2 minutes ago")
- Expandable event details
- Infinite scroll or pagination

```typescript
interface ActivityTimelineProps {
  events: ActivityEvent[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}
```

### 5. BehavioralSparkline

**Location:** `packages/ui/src/components/behavioral-sparkline.tsx`

**Features:**
- 7-day activity trend
- Miniature line chart (Recharts)
- Tooltip showing daily counts
- Color-coded by intensity

```typescript
interface BehavioralSparklineProps {
  data: number[]; // 7 data points
  width?: number;
  height?: number;
  color?: string;
  showTooltip?: boolean;
}
```

### 6. CredentialIcons

**Location:** `packages/ui/src/components/credential-icons.tsx`

**Features:**
- Display multiple credential types
- Icons: Mobile (Smartphone), PIN (Hash), Card (CreditCard), QR (QrCode)
- Active/inactive states
- Tooltips for each type

```typescript
interface CredentialIconsProps {
  credentials: {
    mobile: boolean;
    pin: boolean;
    card: boolean;
    qr?: boolean;
  };
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  activeColor?: string;
  inactiveColor?: string;
}
```

---

## TanStack Table Configuration

### Column Definitions

```typescript
const columns: ColumnDef<User>[] = [
  // User Column (Avatar + Name)
  {
    id: 'user',
    accessorKey: 'name',
    header: 'User',
    size: 250,
    enableSorting: true,
    enableResizing: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.avatar} />
          <AvatarFallback>{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },

  // Team Column
  {
    id: 'team',
    accessorKey: 'team',
    header: 'Team',
    size: 150,
    enableSorting: true,
    enableResizing: true,
  },

  // Role Column
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    size: 150,
    enableSorting: true,
    enableResizing: true,
  },

  // Status Column
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    enableSorting: true,
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} />
    ),
  },

  // Credentials Column
  {
    id: 'credentials',
    header: 'Credentials',
    size: 150,
    enableSorting: false,
    cell: ({ row }) => (
      <CredentialIcons credentials={row.original.credentials} />
    ),
  },

  // Behavioral Sparkline Column
  {
    id: 'activity',
    header: 'Activity (7d)',
    size: 120,
    enableSorting: false,
    cell: ({ row }) => (
      <BehavioralSparkline data={row.original.activitySparkline} />
    ),
  },

  // Last Event Column
  {
    id: 'lastEvent',
    header: 'Last Event',
    size: 200,
    enableSorting: true,
    sortingFn: (a, b) => {
      const aTime = a.original.lastEvent?.timestamp.getTime() || 0;
      const bTime = b.original.lastEvent?.timestamp.getTime() || 0;
      return aTime - bTime;
    },
    cell: ({ row }) => {
      const event = row.original.lastEvent;
      if (!event) return <span className="text-muted-foreground text-xs">No activity</span>;

      const productIcons = {
        access: <AccessIcon className="w-4 h-4 text-purple-500" />,
        rooms: <RoomsIcon className="w-4 h-4 text-teal-500" />,
        lockers: <LockersIcon className="w-4 h-4 text-blue-500" />,
        bookings: <BookingsIcon className="w-4 h-4 text-indigo-500" />,
        vision: <VisionIcon className="w-4 h-4 text-purple-400" />,
      };

      return (
        <div className="flex items-center gap-2">
          {productIcons[event.type]}
          <div>
            <div className="text-xs font-medium">{event.action}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(event.timestamp, { addSuffix: true })}
            </div>
          </div>
        </div>
      );
    },
  },
];
```

### Table Features Configuration

```typescript
const table = useReactTable({
  data: filteredUsers,
  columns,

  // Sorting
  state: {
    sorting,
    columnVisibility,
    columnFilters,
  },
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),

  // Column Resizing
  enableColumnResizing: true,
  columnResizeMode: 'onChange',

  // Column Visibility
  onColumnVisibilityChange: setColumnVisibility,

  // Filtering
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),

  // Pagination (optional)
  getPaginationRowModel: getPaginationRowModel(),

  getCoreRowModel: getCoreRowModel(),
});
```

---

## UI/UX Specifications

### Visual Design

**Theme: Modern 2026 Light Mode**
- Background: `bg-gray-50`
- Cards: `bg-white` with `border border-gray-200`
- Shadows: `shadow-sm` for cards, `shadow-lg` for drawer
- Glassmorphic effects on drawer: `backdrop-blur-xl bg-white/95`

**Typography:**
- Font: Inter Variable (already in use)
- Headers: `font-semibold`
- Body: `font-normal`
- Sizes: Follow Tailwind scale

**Product Color Coding:**
```css
--access-color: rgb(168, 85, 247);   /* Purple */
--rooms-color: rgb(20, 184, 166);     /* Teal */
--lockers-color: rgb(59, 130, 246);   /* Blue */
--bookings-color: rgb(99, 102, 241);  /* Indigo */
--vision-color: rgb(192, 132, 252);   /* Purple-400 */
--cloud-color: rgb(156, 163, 175);    /* Gray-400 */
```

### Layout Specifications

**Toolbar:**
- Height: `64px`
- Padding: `px-6 py-4`
- Border: `border-b border-gray-200`
- Background: `bg-white`
- Flex layout: `flex items-center justify-between gap-4`

**Table:**
- Row Height: `56px` minimum
- Cell Padding: `px-4 py-3`
- Header: `bg-gray-50 border-b-2 border-gray-200`
- Hover: `hover:bg-gray-50 transition-colors`
- Border: Subtle borders between rows

**Activity Drawer:**
- Width: `560px` (desktop), `100%` (mobile)
- Slide animation: `transition-transform duration-300 ease-out`
- Backdrop: `bg-black/20 backdrop-blur-sm`
- Content: `backdrop-blur-xl bg-white/95 shadow-2xl`
- Padding: `p-6`
- Border: `border-l border-gray-200`

### Glassmorphic Drawer Effect

```css
.activity-drawer {
  backdrop-filter: blur(24px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
}
```

---

## Feature Specifications

### 1. Search Functionality

- **Debounce:** 300ms
- **Scope:** Searches across name, email, team fields
- **Placeholder:** "Search by name, email, or team..."
- **Clear button:** X icon appears when search has value
- **Icon:** Search (lucide-react)

### 2. Filter System

**Team Filter:**
- Dropdown with all unique teams
- "All Teams" option to clear
- Shows count of users per team

**Role Filter:**
- Dropdown with all unique roles
- "All Roles" option to clear
- Shows count of users per role

**Status Filter:**
- Multi-select checkbox dropdown
- Options: Active, Inactive, Pending
- Can select multiple

**Filter Chips:**
- Appear below toolbar when filters active
- Show filter name and value
- Removable with X button
- "Clear All" button when 2+ filters active

### 3. Column Management

**View Toggle:**
- Dropdown with checkbox list
- Shows all available columns
- Toggles visibility
- Persisted to localStorage
- Default: All columns visible

**Column Resizing:**
- Drag handle on column borders
- Minimum width: `100px`
- Maximum width: `500px`
- Shows resize cursor on hover

### 4. Export Functionality

**Export Button:**
- Dropdown with CSV and JSON options
- Exports current filtered/sorted data
- Includes all columns (even hidden ones)
- Shows loading spinner during export
- Download filename: `zezamii-users-{date}.{format}`

**CSV Format:**
```csv
Name,Email,Team,Role,Status,Mobile,PIN,Card,QR,Last Event,Last Event Time
John Doe,john@example.com,IT,Admin,active,true,true,false,false,Access granted,2024-01-07T10:30:00Z
```

**JSON Format:**
```json
[
  {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "team": "IT",
    "role": "Admin",
    "status": "active",
    "credentials": {
      "mobile": true,
      "pin": true,
      "card": false,
      "qr": false
    },
    "lastEvent": {
      "type": "access",
      "action": "Access granted",
      "timestamp": "2024-01-07T10:30:00Z"
    }
  }
]
```

### 5. Activity Drawer Features

**Header Section:**
```
┌─────────────────────────────────────┐
│  [Avatar]  John Doe                 │
│            john@example.com         │
│            IT Team • Admin          │
│                                     │
│  Active Coverage                    │
│  Allowed in 14 Spaces               │
│  Access to 8 Devices                │
└─────────────────────────────────────┘
```

**Timeline Section:**
- Vertical scroll (max-height: `calc(100vh - 250px)`)
- Shows last 50 events
- Grouped by date ("Today", "Yesterday", "Last 7 days")
- Infinite scroll or "Load More" button

**Event Card:**
```
┌─────────────────────────────────────┐
│ [●] [Icon] Action Title             │
│            Detailed description     │
│            Location • Device        │
│            2 minutes ago            │
└─────────────────────────────────────┘
```

**Color Coding:**
- Access: Purple dot + icon
- Rooms: Teal dot + icon
- Lockers: Blue dot + icon
- Bookings: Indigo dot + icon
- Vision: Purple-400 dot + icon
- Cloud: Gray dot + icon

### 6. Behavioral Sparkline

**Implementation:**
- Library: Recharts `<Sparkline>` or custom SVG
- Data: Array of 7 numbers (last 7 days)
- Width: `80px`
- Height: `24px`
- Line color: Brand color
- Tooltip: Shows exact count on hover
- Animation: Smooth entrance

**Example:**
```
Day:    M   T   W   T   F   S   S
Count: [5, 12, 8, 15, 10, 3, 7]
Visual: ___/‾‾‾\__/‾‾‾\___ (simplified)
```

---

## Data Flow

### 1. Loading State

```typescript
<IdentityWorkstation
  users={users}
  loading={isLoading}
/>
```

Shows skeleton loaders:
- Toolbar: Disabled inputs
- Table: 10 skeleton rows with shimmer effect
- Columns: Gray rectangles matching column widths

### 2. User Interaction Flow

```
User clicks row
  ↓
onUserClick(userId) fired
  ↓
Parent fetches full activity data
  ↓
ActivityDrawer opens with loading state
  ↓
Data loads
  ↓
Timeline animates in
```

### 3. Filter Flow

```
User changes filter
  ↓
Filter state updates
  ↓
TanStack Table re-filters data
  ↓
Filter chips update
  ↓
Active filter count updates
```

### 4. Export Flow

```
User clicks Export → CSV
  ↓
Show loading spinner
  ↓
Generate CSV from current filtered data
  ↓
Trigger browser download
  ↓
Hide loading spinner
  ↓
Show success toast (optional)
```

---

## Performance Considerations

### Virtualization

For large datasets (>1000 rows):
- Implement TanStack Virtual with TanStack Table
- Render only visible rows + buffer
- Estimated row height: `56px`

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 56,
  overscan: 10,
});
```

### Memoization

```typescript
const filteredUsers = useMemo(() => {
  let result = users;

  if (searchQuery) {
    result = result.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.team.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply other filters...

  return result;
}, [users, searchQuery, filters]);
```

### Debouncing

```typescript
const debouncedSearch = useMemo(
  () => debounce((value: string) => setSearchQuery(value), 300),
  []
);
```

---

## Accessibility

### Keyboard Navigation

- **Tab:** Navigate through toolbar controls, table rows
- **Enter/Space:** Activate buttons, open drawer
- **Escape:** Close drawer, clear search
- **Arrow Keys:** Navigate table cells (optional)
- **Ctrl/Cmd + F:** Focus search input

### ARIA Labels

```typescript
<input
  type="search"
  aria-label="Search users by name, email, or team"
  placeholder="Search..."
/>

<button
  aria-label="Export to CSV"
  aria-haspopup="menu"
>
  Export
</button>

<Sheet
  role="dialog"
  aria-labelledby="drawer-title"
  aria-describedby="drawer-description"
>
  <h2 id="drawer-title">{user.name}</h2>
  <p id="drawer-description">Activity timeline and user details</p>
</Sheet>
```

### Screen Reader Support

- Announce filter count: "3 filters active"
- Announce sort changes: "Sorted by Name, ascending"
- Announce row selection: "Selected John Doe"
- Live region for search results: "Showing 15 of 150 users"

---

## Responsive Design

### Desktop (≥1024px)

- Full toolbar with all controls
- All columns visible
- Drawer: 560px width from right
- Table: Horizontal scroll if needed

### Tablet (768px - 1023px)

- Toolbar: Stack filters below search
- Hide less important columns by default
- Drawer: 480px width from right

### Mobile (<768px)

- Toolbar: Vertical stack, simplified controls
- Table: Card-based layout (no table)
- Drawer: Full screen overlay
- Bottom sheet for filters

**Mobile Card Layout:**
```
┌─────────────────────────────────────┐
│  [Avatar]  John Doe                 │
│            john@example.com         │
│                                     │
│  IT Team • Admin • Active           │
│  [Mobile] [PIN] [Card]              │
│                                     │
│  Last Event: Access granted         │
│  2 minutes ago                      │
└─────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Add TanStack Table dependency
- [ ] Add Recharts dependency
- [ ] Add date-fns dependency
- [ ] Create component files structure
- [ ] Set up TypeScript interfaces

### Phase 2: Core Table (Days 2-3)
- [ ] Build IdentityWorkstation shell
- [ ] Implement TanStack Table configuration
- [ ] Create column definitions
- [ ] Add sorting functionality
- [ ] Add column resizing
- [ ] Add column visibility toggle

### Phase 3: Toolbar (Day 4)
- [ ] Build WorkstationToolbar component
- [ ] Implement search with debounce
- [ ] Add filter dropdowns
- [ ] Create filter chips
- [ ] Add export functionality (CSV/JSON)

### Phase 4: Visual Components (Day 5)
- [ ] Build CredentialIcons component
- [ ] Build BehavioralSparkline with Recharts
- [ ] Style User column with Avatar
- [ ] Style Last Event column with product icons
- [ ] Add StatusBadge integration

### Phase 5: Activity Drawer (Days 6-7)
- [ ] Build ActivityDrawer with Sheet
- [ ] Create user summary header
- [ ] Build ActivityTimeline component
- [ ] Implement scrollable event feed
- [ ] Add color-coded product icons
- [ ] Apply glassmorphic styling
- [ ] Add relative timestamps

### Phase 6: Polish & Testing (Day 8)
- [ ] Add loading states everywhere
- [ ] Add empty states
- [ ] Implement accessibility features
- [ ] Test keyboard navigation
- [ ] Test responsive design
- [ ] Performance testing with large datasets
- [ ] Add error boundaries

### Phase 7: Integration (Days 9-10)
- [ ] Create example usage in Cloud app
- [ ] Document all props and examples
- [ ] Create Storybook stories (optional)
- [ ] Write integration guide

---

## Example Usage

```typescript
// apps/cloud/src/app/identity/page.tsx
'use client';

import { useState } from 'react';
import { IdentityWorkstation, ActivityDrawer } from '@repo/ui';
import { api } from '@/lib/trpc';

export default function IdentityPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch users
  const { data: users, isLoading } = api.users.list.useQuery();

  // Fetch selected user's activity
  const { data: activity, isLoading: activityLoading } = api.users.activity.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setDrawerOpen(true);
  };

  const selectedUser = users?.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Identity Workstation</h1>

        <IdentityWorkstation
          users={users || []}
          onUserClick={handleUserClick}
          loading={isLoading}
        />

        <ActivityDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          user={selectedUser!}
          events={activity || []}
          loading={activityLoading}
        />
      </div>
    </div>
  );
}
```

---

## Future Enhancements

### Phase 2 (Optional)
- [ ] Bulk actions (activate/deactivate multiple users)
- [ ] Inline editing (double-click cell to edit)
- [ ] Advanced filters (date ranges, credential combinations)
- [ ] Saved filter presets
- [ ] Real-time updates (WebSocket integration)
- [ ] Activity heatmap visualization
- [ ] Export to PDF with custom template
- [ ] Column reordering (drag & drop)

### Performance Optimizations
- [ ] Server-side pagination for 10k+ users
- [ ] Server-side sorting and filtering
- [ ] Infinite scroll for activity timeline
- [ ] Service worker caching for offline access

---

## Success Metrics

- **Performance:** Table renders <100ms for 1000 rows
- **Search:** Results appear <300ms after typing
- **Export:** CSV generates <2s for 1000 rows
- **Drawer:** Opens/closes <300ms with smooth animation
- **Accessibility:** 100% keyboard navigable, WCAG 2.1 AA compliant

---

## Questions for Confirmation

1. Should the Activity Drawer show real-time updates or static snapshot?
2. Do we need bulk selection/actions in Phase 1?
3. Should sparklines be clickable to show detailed chart?
4. Export permissions - any restrictions on who can export?
5. Should we implement server-side pagination initially or client-side is fine?
6. Inter Variable font - already installed or need to add to fonts?
