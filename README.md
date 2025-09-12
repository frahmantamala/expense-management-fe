# Expense Management Frontend

A modern, domain-driven expense management system built with Nuxt 3, TypeScript, and Nuxt and separation of concerns principles.

## 🏗️ Architecture Overview

This application follows **Domain-Driven Design (DDD)** principles with clear separation of concerns:

### 📁 Project Structure

```
expense-management-fe/
├── types/
│   └── domain.ts                 # Domain models, enums, and interfaces
├── services/
│   ├── api/
│   │   └── client.ts            # HTTP client with error handling
│   └── domain/
│       └── expense.ts           # Domain services (ExpenseService, ApprovalService, etc.)
├── composables/
│   ├── useApiClient.ts          # API client composable
│   ├── useExpenses.ts           # Expense management composable
│   └── useFormValidation.ts     # Form validation utilities
├── components/
│   └── expense/
│       ├── ExpenseCard.vue      # Expense display component
│       ├── ExpenseForm.vue      # Expense creation/editing form
│       ├── ExpenseStatusBadge.vue
│       ├── PaymentStatusBadge.vue
│       └── ExpenseActionModals.vue
├── pages/
│   ├── index.vue               # Landing page
│   └── expenses/
│       ├── index.vue           # Expense list page
│       └── create.vue          # Create expense page
└── app/
    └── app.vue                 # Main app layout
```

## Core Features

### Business Logic Implementation

Based on your sequence diagram, the system handles:

1. **Auto-Approval for Small Expenses (< 1M IDR)**
   - Automatic approval and payment processing
   - Real-time status updates

2. **Manager Approval Workflow (≥ 1M IDR)**
   - Pending approval state
   - Manager approve/reject actions
   - Payment processing after approval

3. **Payment Processing**
   - Payment status tracking
   - Payment failure handling
   - Payment retry functionality

## 🛠️ Technical Implementation

### 1. **Domain Services** (DDD Layer)
- `ExpenseService`: CRUD operations for expenses
- `ApprovalService`: Approval workflow management
- `PaymentService`: Payment operations and retry logic
- `CategoryService`: Expense category management

### 2. **Composables** (Reactive State Management)
- `useExpenses`: Complete expense management with reactive state
- `useFormValidation`: Reusable form validation logic
- `useApiClient`: HTTP client with error handling

### 3. **Components** (UI Layer)
- Fully reactive components with TypeScript
- Comprehensive form validation
- Status indicators and action buttons
- Modal dialogs for confirmations

### 4. **API Integration**
- RESTful API client with proper error handling
- TypeScript interfaces for all API responses
- Environment-based configuration

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Development

```bash
# Type checking
pnpm nuxt typecheck

# Linting
pnpm lint

# Testing (when tests are added)
pnpm test
```

## 📊 Key Features

### 1. **Expense Management**
- Create, read, update, delete expenses
- File upload for receipts (JPEG, PNG, PDF)
- Real-time validation and error handling
- Responsive design for mobile/desktop

### 2. **Approval Workflow**
- Automatic approval for expenses < 1M IDR
- Manager approval interface
- Rejection with reason tracking
- Status change notifications

### 3. **Payment Processing**
- Payment status tracking
- Failure handling with retry mechanism
- Visual status indicators
- Payment history

### 4. **User Experience**
- Intuitive form validation
- Loading states and error handling
- Responsive design
- Accessible UI components

## 🏛️ Architecture

### Domain-Driven Design (DDD)
- Clear domain models and business rules
- Separation of business logic from UI
- Domain services for complex operations

### Separation of Concerns
- API layer separate from business logic
- UI components focused on presentation
- State management in composables

## 🔍 Code Quality

### TypeScript
- Strict type checking enabled
- Domain models with proper interfaces
- Type-safe API calls and responses

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Proper HTTP error handling

### Validation
- Client-side form validation
- Business rule enforcement
- File upload validation
