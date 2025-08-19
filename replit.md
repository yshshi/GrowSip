# Overview

SIPVault is a comprehensive SIP (Systematic Investment Plan) management platform built as a full-stack web application. The system enables users to discover, invest in, and manage SIP plans while providing administrators with tools to create and manage investment plans, users, and system settings. The platform includes sophisticated financial calculators, portfolio tracking, transaction management, and real-time market data visualization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and follows a modern component-based architecture:

**Core Framework**: React 18 with Vite for development and build tooling, providing fast development experience and optimized production builds.

**Routing**: Wouter for client-side routing, chosen for its lightweight footprint compared to React Router while maintaining essential routing functionality.

**State Management**: TanStack Query (React Query) handles server state management, caching, and synchronization, while local component state manages UI interactions. This approach eliminates the need for complex global state management for most use cases.

**UI Components**: Radix UI primitives with shadcn/ui components provide accessible, customizable components. Tailwind CSS handles styling with a utility-first approach, configured with custom design tokens for consistent branding.

**Data Visualization**: Recharts for standard financial charts (area, bar, pie) and plan market data visualization. This provides comprehensive charting capabilities for portfolio tracking and financial analytics.

**Form Handling**: React Hook Form with Zod validation ensures type-safe form handling and client-side validation, reducing server load and improving user experience.

## Backend Architecture

The backend uses a Node.js Express server with a straightforward REST API architecture:

**Server Framework**: Express.js provides the web server foundation with middleware for request processing, authentication, and error handling.

**Authentication**: Integration with Replit's OIDC authentication system handles user authentication and session management. PostgreSQL stores session data with automatic cleanup.

**Database Layer**: Drizzle ORM with PostgreSQL provides type-safe database operations. The schema includes comprehensive tables for users, plans, subscriptions, transactions, market data, and audit logs.

**API Design**: RESTful endpoints organized by domain (auth, plans, subscriptions, transactions, admin) with role-based access control middleware protecting admin routes.

**Data Storage**: Abstract storage interface allows for flexible data layer implementation while maintaining consistent business logic across the application.

## Authentication & Authorization

**User Authentication**: Replit OIDC integration provides secure user authentication with automatic user provisioning and profile management.

**Session Management**: PostgreSQL-backed sessions with configurable TTL and secure cookie settings ensure persistent, secure user sessions.

**Role-Based Access**: Two-tier role system (user/admin) with middleware-enforced access control. Admin routes require elevated privileges for sensitive operations.

**Security Features**: Helmet for security headers, CORS configuration, and session-based authentication provide comprehensive security coverage.

## Database Design

**User Management**: Comprehensive user profiles including KYC status, role management, and audit trails for regulatory compliance.

**Investment Plans**: Flexible plan structure supporting various categories, risk levels, and dynamic return rates with historical market data tracking.

**Subscription System**: User investment subscriptions with status tracking, amount management, and automated transaction processing.

**Transaction Processing**: Complete transaction lifecycle management with status tracking, audit trails, and financial reconciliation support.

**Audit & Compliance**: Comprehensive logging system tracks all user actions, administrative changes, and system events for regulatory compliance and troubleshooting.

# External Dependencies

## Database Services

**Neon Database**: PostgreSQL-compatible serverless database providing scalable, managed database infrastructure with connection pooling and automatic scaling.

## Authentication Services

**Replit Authentication**: OIDC-based authentication service providing secure user login, profile management, and session handling integrated with Replit's platform.

## Development & Deployment

**Replit Platform**: Complete development environment with integrated hosting, database provisioning, and deployment pipeline.

**Vite Development Server**: Fast development experience with hot module replacement and optimized build process.

## UI & Design System

**Radix UI**: Accessible, unstyled component primitives providing the foundation for custom UI components with built-in accessibility features.

**shadcn/ui**: Pre-built component library built on Radix UI primitives, providing consistent design patterns and customizable components.

**Tailwind CSS**: Utility-first CSS framework with custom configuration for design tokens, responsive design, and consistent styling across the application.

## Financial & Data Visualization

**Recharts**: React-based charting library for financial data visualization including portfolio performance, asset allocation, and market trends.

**Date-fns**: Lightweight date manipulation library for financial calculations, transaction processing, and time-series data handling.

## Development Tools

**TypeScript**: End-to-end type safety across frontend, backend, and shared schemas ensuring robust code quality and developer experience.

**Zod**: Runtime type validation for API requests, form validation, and data serialization providing type safety at runtime.

**Drizzle ORM**: Type-safe database toolkit with automatic migration generation and comprehensive TypeScript integration.