# Span Tracker - Flutter Rebuild Phase 1: Architecture & Folder Structure

This document outlines the architectural decisions and folder structure for rewording Span Tracker as a high-quality, production-grade Flutter application.

## 1. Architectural Pattern: Clean Architecture + Riverpod

We will adhere to **Clean Architecture** principles to ensure separation of concerns, testability, and scalability. The app is divided into three main layers:

### A. **Domain Layer** (The Core)

- **Responsibility**: Contains the business logic and enterprise rules. It is independent of UI, database, or external frameworks.
- **Contents**:
  - **Entities**: Pure Dart classes representing core data (e.g., `Task`, `DailyProgress`).
  - **Repositories (Interfaces)**: Abstract contracts defining data operations (e.g., `ITaskRepository`).
  - **UseCases**: Classes enclosing specific business rules (e.g., `GetTasksForDay`, `CalculateStreak`).

### B. **Data Layer** (The Implementation)

- **Responsibility**: Handles data retrieval and storage. It implements the Domain interfaces.
- **Contents**:
  - **Models**: DTOs (Data Transfer Objects) that extend Entities with JSON parsing/serialization logic (e.g., `TaskModel`).
  - **Data Sources**:
    - _Remote_: Supabase API calls.
    - _Local_: Local database (Isar or Hive) for offline-first support.
  - **Repositories (Implementation)**: Concrete classes that coordinate data sources to fulfill domain repository contracts (e.g., `TaskRepositoryImpl`).

### C. **Presentation Layer** (The UI)

- **Responsibility**: displays data and handles user interactions.
- **Contents**:
  - **Screens/Pages**: Full-screen views.
  - **Widgets**: Reusable UI components.
  - **State Management (Riverpod)**:
    - _Providers_: Exposure of state (Repositories, UseCases).
    - _Notifiers_: `StateNotifier` or `AsyncNotifier` managing UI state.

---

## 2. Technology Stack

- **Framework**: Flutter
- **Language**: Dart 3 (Strong typing, null safety)
- **State Management**: `flutter_riverpod` (v2.0+) with code generation annotations.
- **Routing**: `go_router` (Nested navigation, deep linking).
- **Immutable Data**: `freezed` & `json_serializable` (Union types, pattern matching, copyWith).
- **Backend**: `supabase_flutter`.
- **Local Storage**: `isar` or `hive` (for offline caching).
- **UI Components**: Custom widgets inspired by Shadcn/Material 3.

---

## 3. Folder Structure

We will use a **feature-first** or **layer-first** hybrid structure. Given the scale, a **layer-first** structure within `core` and **feature-based** structure for main modules is often best, but for strict Clean Architecture, we often group by layer.

**Proposed Structure:**

```
lib/
├── main.dart                     # Entry point, app configuration
├── app.dart                      # Root widget (MaterialApp, Theme, Router)
├── core/                         # Shared utilities across features
│   ├── config/                   # Env vars, flavor config
│   ├── constants/                # App constants, assets paths
│   ├── error/                    # Custom exceptions, failure classes
│   ├── theme/                    # AppTheme, ColorPalettes, Typography
│   ├── utils/                    # Date formatters, Validators, Extensions
│   └── di/                       # Dependency Injection setup (Riverpod providers)
├── data/                         # DATA LAYER
│   ├── datasources/
│   │   ├── local/                # Local DB implementation
│   │   └── remote/               # Supabase API clients
│   ├── models/                   # DTOs (fromJson/toJson)
│   └── repositories/             # Concrete implementations of repositories
├── domain/                       # DOMAIN LAYER
│   ├── entities/                 # Plain Dart Objects
│   ├── repositories/             # Abstract Interfaces
│   └── usecases/                 # Business Logic classes
└── presentation/                 # PRESENTATION LAYER
    ├── routing/                  # GoRouter configuration
    ├── screens/                  # Application Screens
    │   ├── auth/
    │   ├── dashboard/
    │   ├── tasks/
    │   ├── analytics/
    │   └── settings/
    └── widgets/                  # Shared/Reusable UI Components
        ├── buttons/
        ├── inputs/
        ├── cards/
        └── dialogs/
```

## 4. Key Design Decisions

### Mobile Ergonomics

- **Navigation**: Bottom Navigation Bar for primary sections (Dashboard, Tasks, Analytics).
- **Interaction**: Swipe gestures for tasks (Swipe left to delete/skip, Swipe right to complete).
- **Reachability**: Primary actions (FAB, big buttons) placed at the bottom 1/3 of the screen.

### Offline-First

- The app must work without internet.
- **Read**: Always read from Local DB.
- **Write**: Write to Local DB -> Queue Sync Job -> Push to Supabase when online.
- The logic currently in `syncService.ts` will be refactored into a robust `SyncRepository` in the Data Layer.

### Riverpod Usage

- Use `Provider` for Dependencies (Repositories, UseCases).
- Use `AsyncNotifierProvider` for async data (fetching tasks).
- Use `StateProvider` for simple ephemeral UI state (filters, toggles).

## 5. Next Steps (Phase 2)

- Define `Task` and `DailyProgress` entities in `domain/entities`.
- Create Repository Interfaces in `domain/repositories`.
- Set up Freezed models in `data/models`.
