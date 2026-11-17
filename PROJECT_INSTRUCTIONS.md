# PROJECT INSTRUCTIONS — Architecture Firm Portfolio & Management Platform

## 1. Project Overview

Build a complete, modern, responsive web application for an architecture firm.

The application must have two separate environments:

1. **Public Website (Front Office):** A premium architectural portfolio accessible to everyone. It presents the firm, its services, architectural projects, and contact information.
2. **Private Administration Platform (Back Office):** A protected dashboard that allows authorized administrators to manage projects, categories, images, and contact messages.

The administrator login must not be visible or linked anywhere on the public website. The administration platform must be accessible through a separate, non-advertised URL.

The final result must look like a professionally designed architecture studio website, not a generic business template.

The design should emphasize architectural photography, elegant typography, generous whitespace, minimalist layouts, smooth transitions, and intuitive navigation.

---

## 2. Technology Stack

Use the following technologies. Do not replace them with alternatives without explicit approval.

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- Lucide React

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Hibernate
- Jakarta Validation
- Maven

### Database
- PostgreSQL
- Docker and Docker Compose

### Image Storage
- Cloudinary

### Development Tools
- IntelliJ IDEA for backend development.
- Visual Studio Code for frontend development.
- Postman for API testing.
- Git and GitHub for version control.

---

## 3. General Development Rules

Follow these rules throughout development:

1. Use clean, maintainable, and modular code.
2. Follow separation of concerns.
3. Keep business logic inside service classes, not controllers.
4. Use DTOs for API requests and responses. Do not expose JPA entities directly through REST endpoints.
5. Use dependency injection through constructors.
6. Use meaningful class, method, variable, and component names.
7. Avoid duplicated code.
8. Implement proper validation and error handling.
9. Never hardcode database credentials, API keys, or Cloudinary secrets.
10. Use environment variables for sensitive configuration.
11. Make all public pages responsive.
12. Follow accessibility best practices.
13. Use reusable React components.
14. Use TypeScript types and interfaces instead of unnecessary `any`.
15. Do not create fake functionality or buttons that do nothing.
16. Do not use static mock data as a substitute for real backend integration in the finished application.
17. Add loading, success, empty, and error states where appropriate.
18. Keep frontend and backend responsibilities clearly separated.
19. Write code that can be maintained and extended.
20. Test important functionality before considering a feature complete.

### Important AI development instruction

Work incrementally.

Before implementing a new phase:
- Inspect the existing project structure.
- Understand the existing code.
- Reuse existing components and services where appropriate.
- Avoid overwriting working code unnecessarily.
- Explain important architectural decisions.
- Implement one logical feature at a time.
- Verify that the application builds and runs after each major change.

Do not generate the entire application in one response.

---

# PART I — FRONTEND

## 4. Frontend Architecture

Use React with TypeScript and Vite.

Organize the frontend as follows:

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── public/
│   │   └── admin/
│   ├── layouts/
│   │   ├── PublicLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── ProjectDetails.tsx
│   │   │   ├── About.tsx
│   │   │   └── Contact.tsx
│   │   └── admin/
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── ProjectManagement.tsx
│   │       ├── ProjectForm.tsx
│   │       ├── CategoryManagement.tsx
│   │       └── Messages.tsx
│   ├── services/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── vite.config.ts
```

Adapt the structure when necessary, but preserve the separation between public pages, admin pages, reusable components, and API services.

## 5. Frontend Design Direction

The website must have a premium architectural identity.

### Visual identity

Use:
- Minimalist and editorial design.
- Large architectural photographs.
- Elegant typography.
- Generous whitespace.
- Subtle transitions.
- Asymmetric layouts where appropriate.
- Carefully designed image grids.
- Consistent spacing and alignment.
- Responsive navigation.
- Refined hover interactions.

Suggested color palette:
- Warm off-white: `#F5F3EF`
- White: `#FFFFFF`
- Charcoal: `#242424`
- Dark gray: `#454545`
- Muted gray: `#858585`
- Warm beige: `#D8D0C3`

Use color sparingly. The photography should be the main visual focus.

Typography should combine an elegant editorial heading font with a clean sans-serif body font. Choose appropriate fonts and use them consistently.

Avoid:
- Generic dashboard-style public pages.
- Excessive gradients.
- Excessive rounded cards.
- Unnecessary shadows.
- Overly colorful interfaces.
- Excessive animations.
- Repetitive generic templates.

### Styling

Use Tailwind CSS for styling.

Create reusable design patterns and consistent spacing, typography, colors, and responsive breakpoints.

Use Framer Motion for subtle page transitions and interactions.

Use Lucide React for icons.

---

## 6. Public Website Features

### 6.1 Home Page

Create an elegant home page containing:

- Navigation bar with architecture firm logo.
- Full-screen or large hero section.
- High-quality architectural background image.
- Strong headline communicating the firm's identity.
- Short introductory paragraph.
- Featured projects section.
- About the firm preview.
- Services or expertise section.
- Contact call-to-action.
- Footer with contact information and social links.

The hero section should immediately communicate the firm's architectural identity.

### 6.2 Projects Portfolio

Create a dedicated projects page.

Features:
- Responsive project grid.
- Project cover images.
- Project titles.
- Project locations.
- Project categories.
- Project years.
- Category filtering.
- Optional search.
- Smooth hover interactions.

Only projects with status `PUBLISHED` must be visible publicly.

### 6.3 Project Details

Each project must have its own dedicated detail page.

Display:
- Project title.
- Main cover image.
- Location.
- Completion year.
- Category.
- Project description.
- Architectural concept.
- Image gallery.
- Additional project information.

Use a visually rich editorial layout.

Support navigation between projects where appropriate.

### 6.4 About Page

Include:
- Firm presentation.
- History and background.
- Architectural philosophy.
- Design approach.
- Services and expertise.
- Team information if provided by the firm.

Do not invent factual information about the architecture firm. Use editable content or clearly marked placeholders until real information is provided.

### 6.5 Contact Page

Include:
- Contact form.
- Name.
- Email.
- Subject.
- Message.
- Office address.
- Phone number.
- Email address.
- Social media links.
- Map integration when location information is available.

Validate all form inputs.

Display success and error messages after submission.

Store submitted messages in PostgreSQL through the backend.

---

# PART II — ADMINISTRATION PLATFORM

## 7. Admin Platform Architecture

The admin platform must be visually separate from the public website.

Use:
- A dedicated login page.
- An admin dashboard layout.
- A sidebar navigation.
- A header with administrator information.
- Responsive content areas.
- Consistent typography and spacing.

Suggested private routes:

```text
/atelier-control/login
/atelier-control/dashboard
/atelier-control/projects
/atelier-control/projects/new
/atelier-control/projects/edit/:id
/atelier-control/categories
/atelier-control/messages
```

Do not include an admin login link in the public navigation, footer, or public pages.

Frontend route protection is only a user-interface convenience. The backend must enforce all actual permissions.

## 8. Administrator Authentication

Implement administrator authentication using Spring Security.

Login form:
- Email address.
- Password.

Required features:
- Login.
- Logout.
- Authentication status verification.
- Protected admin routes.
- Session expiration.
- Appropriate authentication error messages.

Security requirements:
- Use BCrypt password hashing.
- Do not implement public administrator registration.
- Create the initial administrator securely through a controlled initialization process or deployment procedure.
- Use secure HTTP-only cookies for session authentication.
- Configure appropriate CSRF protection.
- Use secure cookie settings in production.
- Enforce ADMIN authorization on all administrative API endpoints.
- Never store passwords or session credentials in localStorage.
- Do not rely on hiding frontend routes as a security mechanism.

Use a server-side authenticated session rather than inventing a custom authentication protocol.

## 9. Admin Dashboard

Create an overview dashboard with:

- Total projects.
- Published projects.
- Draft projects.
- Total categories.
- Total contact messages.
- Recent projects.
- Recent contact messages.

Statistics must come from real backend API responses.

Use clear visual hierarchy and avoid unnecessary charts.

## 10. Project Management

Implement full CRUD functionality.

### Create project

The administrator must be able to create a project with:

- Title.
- Description.
- Location.
- Completion year.
- Category.
- Architectural concept.
- Cover image.
- Additional gallery images.
- Publication status.

### Edit project

Allow administrators to:
- Modify project information.
- Change categories.
- Replace cover images.
- Add or remove gallery images.
- Reorder images.
- Change publication status.

### Delete project

Allow administrators to delete projects after confirmation.

Handle associated images correctly and avoid leaving orphaned image records.

### Publish and unpublish

Use the following project statuses:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Only `PUBLISHED` projects are publicly accessible.

Draft and archived projects must remain accessible to authorized administrators.

## 11. Image Management

Use Cloudinary for image storage.

Requirements:
- Upload project cover images.
- Upload multiple gallery images.
- Validate image formats.
- Limit file size.
- Preview images before submission.
- Remove images.
- Reorder gallery images.
- Select a cover image.
- Store Cloudinary URLs and public IDs in PostgreSQL.

Use secure server-side upload configuration.

Never expose Cloudinary API secrets in frontend code.

Ensure that deleting an image from a project also handles its Cloudinary resource appropriately.

---

# PART III — BACKEND

## 12. Backend Architecture

Use Java and Spring Boot with Maven.

Organize the backend into the following packages:

```text
com.architecture.api/
├── ArchitectureApiApplication.java
│
├── config/
│   ├── CorsConfig.java
│   └── CloudinaryConfig.java
│
├── controller/
│   ├── ProjectController.java
│   ├── CategoryController.java
│   ├── AuthController.java
│   ├── AdminProjectController.java
│   └── ContactController.java
│
├── dto/
│   ├── request/
│   └── response/
│
├── entity/
│   ├── Project.java
│   ├── Category.java
│   ├── ProjectImage.java
│   ├── Admin.java
│   └── ContactMessage.java
│
├── enums/
│   ├── ProjectStatus.java
│   ├── UserRole.java
│   └── MessageStatus.java
│
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── BadRequestException.java
│
├── repository/
│   ├── ProjectRepository.java
│   ├── CategoryRepository.java
│   ├── ProjectImageRepository.java
│   ├── AdminRepository.java
│   └── ContactMessageRepository.java
│
├── security/
│   ├── SecurityConfig.java
│   ├── CustomUserDetailsService.java
│   └── PasswordConfig.java
│
└── service/
    ├── ProjectService.java
    ├── CategoryService.java
    ├── AuthService.java
    ├── AdminService.java
    ├── ImageService.java
    └── ContactService.java
```

Keep classes focused on their responsibilities.

Controllers must handle HTTP requests and responses.

Services must contain business logic.

Repositories must handle persistence.

DTOs must define the API contract.

Security classes must handle authentication and authorization.

## 13. Backend Dependencies

Include the appropriate Spring Boot dependencies:

- Spring Web.
- Spring Data JPA.
- Spring Security.
- PostgreSQL Driver.
- Spring Boot Validation.
- Spring Boot DevTools (optional).
- Cloudinary Java SDK.

Use compatible dependency versions managed through the Spring Boot parent or BOM.

## 14. REST API Design

Organize endpoints logically.

### Public project endpoints

```http
GET /api/projects
GET /api/projects/{id}
GET /api/projects/slug/{slug}
GET /api/categories
```

These endpoints must return only published projects.

### Admin project endpoints

```http
GET    /api/admin/projects
GET    /api/admin/projects/{id}
POST   /api/admin/projects
PUT    /api/admin/projects/{id}
DELETE /api/admin/projects/{id}
PATCH  /api/admin/projects/{id}/status
```

All endpoints above require ADMIN authorization.

### Authentication endpoints

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Admin category endpoints

```http
GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

### Image endpoints

```http
POST   /api/admin/projects/{id}/images
DELETE /api/admin/projects/{id}/images/{imageId}
PATCH  /api/admin/projects/{id}/images/reorder
```

### Contact endpoints

```http
POST   /api/contact
GET    /api/admin/messages
GET    /api/admin/messages/{id}
PATCH  /api/admin/messages/{id}/status
DELETE /api/admin/messages/{id}
```

Return appropriate HTTP status codes.

Use consistent response structures and meaningful error messages.

---

# PART IV — DATABASE

## 15. Database Design

Use PostgreSQL.

Create the following main entities.

### Admin

Fields:
- id
- email
- password
- role
- createdAt

The password must contain a BCrypt hash, never plaintext.

### Project

Fields:
- id
- title
- slug
- description
- architecturalConcept
- location
- year
- status
- category
- createdAt
- updatedAt

The slug must be unique.

### Category

Fields:
- id
- name
- description
- slug

The category name and slug should be unique.

### ProjectImage

Fields:
- id
- imageUrl
- cloudinaryPublicId
- isCover
- displayOrder
- project

One project can contain multiple images.

### ContactMessage

Fields:
- id
- name
- email
- subject
- message
- status
- createdAt

### Database relationships

- One category can have multiple projects.
- Each project belongs to one category, unless the business rules later allow uncategorized projects.
- One project can have multiple images.
- Each project image belongs to one project.
- Contact messages are independent records.
- Admin accounts are independent records with assigned roles.

Use JPA relationships correctly.

Avoid unnecessary bidirectional relationships and prevent infinite JSON serialization by using DTOs.

## 16. Database Configuration

Use Docker Compose for PostgreSQL.

Create a Docker Compose configuration with:
- PostgreSQL image.
- Database name.
- Database user.
- Password supplied through environment variables.
- Persistent Docker volume.
- Health check.

Example application configuration:

```properties
spring.application.name=architecture-api

spring.datasource.url=jdbc:postgresql://localhost:5432/architecture_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
```

Use `ddl-auto=update` only during early local development.

For production:
- Use Flyway database migrations.
- Set Hibernate schema management to `validate`.
- Disable SQL logging.
- Use environment variables or a secrets manager.
- Never commit real credentials.

---

# PART V — SECURITY AND QUALITY

## 17. Security Rules

Security must be implemented before exposing the application publicly.

Required rules:

1. Public visitors can access only public endpoints.
2. Administrators must authenticate before accessing administrative endpoints.
3. Only users with the ADMIN role can modify projects and categories.
4. Public visitors cannot create, edit, publish, or delete projects.
5. Draft and archived projects must never be returned by public project queries.
6. No public administrator registration.
7. All incoming data must be validated.
8. Passwords must be hashed using BCrypt.
9. Configure secure sessions and CSRF protection.
10. Configure CORS for the actual frontend origin.
11. Keep secrets outside the repository.
12. Apply suitable rate limiting or login-attempt protection before production deployment.

## 18. Validation and Error Handling

Use Jakarta Validation annotations where appropriate.

Examples:
- `@NotBlank`
- `@NotNull`
- `@Email`
- `@Size`
- `@Min`
- `@Max`

Create a global exception handler using `@RestControllerAdvice`.

Handle:
- Resource not found.
- Invalid request data.
- Authentication failures.
- Access denied.
- Duplicate resources.
- Image upload failures.
- Unexpected server errors.

Do not return stack traces or internal server details to users.

---

# PART VI — DEVELOPMENT PHASES

## 19. Implementation Roadmap

Develop the project in the following order.

### Phase 1 — Project setup

- Create the main project directory.
- Configure React + TypeScript + Vite.
- Install and configure Tailwind CSS.
- Install frontend dependencies.
- Generate Spring Boot project.
- Add required Maven dependencies.
- Configure PostgreSQL with Docker.
- Verify that all applications run.

### Phase 2 — Database and entities

- Design the relational schema.
- Create JPA entities.
- Create enums.
- Create repositories.
- Configure entity relationships.
- Verify PostgreSQL connectivity.

### Phase 3 — Backend foundation

- Implement DTOs.
- Implement service classes.
- Implement repositories and database queries.
- Implement public project APIs.
- Implement category APIs.
- Implement contact APIs.
- Add validation.
- Add global exception handling.
- Test APIs using Postman.

### Phase 4 — Authentication and security

- Create the Admin entity.
- Create initial administrator securely.
- Configure Spring Security.
- Implement login and logout.
- Configure secure HTTP-only session cookies.
- Configure CSRF protection.
- Protect administrative endpoints.
- Test unauthorized and authorized requests.

### Phase 5 — Public website

- Build global design system.
- Create public navigation.
- Create hero section.
- Build home page.
- Build project portfolio.
- Build project details.
- Build about page.
- Build contact page.
- Connect all public pages to real backend APIs.

### Phase 6 — Administration platform

- Build login page.
- Implement session verification.
- Create protected admin routes.
- Build dashboard.
- Implement project CRUD.
- Implement image upload and management.
- Implement category management.
- Implement contact message management.

### Phase 7 — Integration and quality assurance

- Test all frontend/backend workflows.
- Test database persistence.
- Test authentication and authorization.
- Test image uploads.
- Test form validation.
- Test responsive layouts.
- Fix errors.
- Optimize performance.
- Verify accessibility.

### Phase 8 — Deployment

- Prepare production configurations.
- Configure production database.
- Configure Cloudinary.
- Build frontend.
- Package backend.
- Deploy applications.
- Configure domain and HTTPS.
- Verify cookies, CORS, CSRF, and security settings in production.

---

# PART VII — ACCEPTANCE CRITERIA

## 20. Definition of Done

The project is considered complete when all the following conditions are satisfied.

### Public website
- [ ] Modern and professional visual identity.
- [ ] Responsive on desktop, tablet, and mobile.
- [ ] Home page works correctly.
- [ ] Project portfolio displays published projects.
- [ ] Project filtering works.
- [ ] Project details pages work.
- [ ] About page is available.
- [ ] Contact form submits messages successfully.
- [ ] All public information comes from the backend where applicable.

### Admin platform
- [ ] Login works.
- [ ] Logout works.
- [ ] Unauthorized users cannot access admin APIs.
- [ ] Dashboard displays real statistics.
- [ ] Administrator can create projects.
- [ ] Administrator can edit projects.
- [ ] Administrator can delete projects.
- [ ] Administrator can publish and unpublish projects.
- [ ] Administrator can upload and manage images.
- [ ] Administrator can manage categories.
- [ ] Administrator can view and manage contact messages.

### Backend and database
- [ ] Spring Boot application runs successfully.
- [ ] PostgreSQL connection works.
- [ ] Entities and relationships are correctly implemented.
- [ ] REST APIs return appropriate responses.
- [ ] DTOs are used.
- [ ] Validation works.
- [ ] Global exception handling works.
- [ ] Spring Security protects administrative operations.
- [ ] Passwords are securely hashed.
- [ ] Public endpoints do not expose draft or archived projects.

### Production readiness
- [ ] Secrets are not committed.
- [ ] HTTPS is configured.
- [ ] Secure session and cookie settings are configured.
- [ ] Database migrations are available.
- [ ] Image upload restrictions are implemented.
- [ ] Production frontend and backend origins are configured correctly.

---

# FINAL INSTRUCTIONS TO THE AI CODING ASSISTANT

Act as a senior full-stack developer and technical architect.

Your task is to help build this application progressively, using the exact technology stack and architecture described above.

Prioritize:
1. Correct architecture.
2. Security.
3. Maintainability.
4. Excellent visual design.
5. Functional completeness.
6. Performance and responsiveness.

Do not sacrifice backend security for frontend convenience.

Do not generate unnecessary features before the core application works.

Do not replace React with Next.js.

Do not replace Spring Boot with another backend framework.

Do not expose JPA entities directly through APIs.

Do not store image binaries directly in PostgreSQL.

Do not expose Cloudinary secrets or administrator credentials in frontend code.

When implementing each phase:
- Explain what will be created.
- Identify the files that need to be created or modified.
- Provide complete, working code for the requested feature.
- Explain how to run and test it.
- Wait for confirmation or test results before moving to the next major phase when working interactively.

**Start by inspecting the existing project files and determining which setup steps have already been completed. Do not overwrite existing work. Then propose the first implementation step.**