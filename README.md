# AI Doc Chat

A responsive web application for chatting with PDF documents using Retrieval-Augmented Generation (RAG). Built with `React 19`, `TypeScript`, `Vite`, `TanStack Query`, `Zustand`, and `Tailwind CSS`.

## Features

- PDF upload and document processing status.
- Streaming AI chat with a stop button.
- Source citations with retrieved chunk text.
- Persistent conversations and conversation history.
- JWT-based authentication and protected routes.
- Server-state caching with TanStack Query.
- Client-state management with Zustand.
- Responsive layouts and loading, empty, and error states.

## Tech Stack

| Component | Technology |
|---|---|
| UI | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Server state | TanStack Query |
| Client state | Zustand |
| Styling | Tailwind CSS |
| HTTP | Fetch API |
| Streaming | fetch-event-source |
| Backend | [AI Doc Assist](https://github.com/soehtetpaing/ai-doc-assist) |

## System Requirement

- Node.js compatible with project dependencies
- npm
- A running `AI Doc Assist` backend

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the frontend directory:

```dotenv
VITE_API_URL=http://localhost:4000
```

`VITE_API_URL` is an example. Use the variable name and API base URL configured in your application.

Never put JWT signing secrets, database credentials, or LLM API keys in frontend environment variables. Vite-exposed variables are visible to browser users.

### 3. Start the development server

```bash
npm run dev
```

Vite typically serves the application at `http://localhost:5173`.

## Core Workflows

### Authentication

1. Submit registration or login credentials.
2. Send the request to the backend.
3. Establish the authenticated application state.
4. Attach credentials to protected API requests according to the authentication strategy.
5. Handle expired sessions and logout safely.

### Document Upload

1. Select a PDF file.
2. Validate basic file requirements on the client.
3. Upload the file using `multipart/form-data`.
4. Display the backend processing status.
5. Refresh document data when processing completes.
6. Allow the user to ask questions about the processed document.

The backend must independently validate file type and size.

### Chat and Citations

1. Load or create a conversation.
2. Submit the user's question.
3. Read SSE events from the backend.
4. Render assistant text as it arrives.
5. Display available source citations and retrieved text.
6. Update the conversation after completion.

## Streaming Chat

Use `fetch-event-source` or the project's configured SSE client for streaming requests that require custom headers.

The streaming lifecycle should support:

- Incremental text updates.
- Completion events.
- Structured error events.
- Authentication failures.
- Network interruptions.
- User cancellation.

Use an `AbortController` or the cancellation mechanism supported by the streaming library. Backend cancellation must also propagate to the model request where supported.

## State Management

### TanStack Query

Use TanStack Query for backend-owned data, including documents, document status, conversation lists, and message history.

Example configuration:

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1
    },
  },
});
```

Avoid blindly retrying non-idempotent mutations, such as uploads and message creation.

### Zustand

Use Zustand for shared client-side UI state, such as the selected conversation, sidebar visibility, and workspace preferences. Use local React state for component-specific values.

## API Integration

Example endpoints; update them to match your backend.

| Operation | Endpoint |
|---|---|
| Register | `POST /api/v1/auth/register` |
| Login | `POST /api/v1/auth/login` |
| List documents | `GET /api/v1/documents` |
| Upload PDF | `POST /api/v1/documents` |
| Create stream conversation | `POST /api/v1/chat` |
| Get conversation history | `GET /api/v1/chat/:id/history` |

Centralize API communication in reusable services. Handle authentication headers, structured errors, JSON responses, file uploads, and streaming separately where necessary.

## Authentication and Security

- Use HTTPS in production.
- Handle access-token expiration.
- Clear sensitive client state on logout.
- Protect routes for user experience, but enforce authorization on the backend.
- Choose token storage carefully, considering XSS and CSRF risks.
- Never expose backend secrets through Vite environment variables.

## Error Handling

| State | Expected behavior |
|---|---|
| Loading | Show a loading indicator |
| Empty | Explain how to upload or start a conversation |
| Uploading | Display upload progress when available |
| Processing | Show document status |
| API failure | Display a useful error message |
| Unauthorized | Handle session expiration |
| Rate limited | Explain that the request limit was reached |
| Cancelled | Preserve partial output when supported |
| Network failure | Offer a safe retry when appropriate |

## Production Build

Build the application:

```bash
npm run build
```

Preview the build locally:

```bash
npm run preview
```

Vite normally generates production assets in `dist/`.

Before deployment:

- Configure the production API URL.
- Enable HTTPS.
- Configure backend CORS.
- Set SPA route fallback if client-side routing is used.
- Verify SSE connections through the production proxy.
- Ensure private secrets are not exposed.
- Test authentication, uploads, citations, and cancellation.

## Development

Depending on your `package.json`, available commands may include:

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test
```

## Project Structure

```text
ai-doc-chat/
├── public/
├── src/
│   ├── core/
│   ├── features/
│   ├── shared/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tsconfig.json
└── vite.config.ts
```

Adapt this structure to your existing application.

## License

Specify the project's license here, if applicable.
