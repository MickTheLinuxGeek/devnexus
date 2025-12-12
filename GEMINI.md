# DevNexus (Warp Companion)

## Project Overview
DevNexus is a React-based dashboard application designed to act as a companion for developer workflows. It integrates with GitHub to manage issues and features an AI-powered "Research Notes" system. The application allows users to visualize project statistics, track issues, and leverage Gemini AI for analysis.

**Key Features:**
*   **Mission Control Dashboard:** Visualizes open/closed issues, efficiency metrics, and label distributions using `recharts`.
*   **GitHub Integration:** Fetches and creates issues directly from a specified repository. Includes a robust mock data fallback for demonstration or offline use.
*   **Research Notes:** A system to take notes, likely enhanced with AI analysis (Gemini).
*   **Customizable Settings:** Users can configure their GitHub Personal Access Token (PAT), Repository Owner, and Repository Name.

## Tech Stack
*   **Frontend:** React 19, TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (inferred from class names like `bg-warp-panel`, `text-warp-text`)
*   **Charts:** Recharts
*   **Icons:** Lucide React
*   **AI SDK:** Google GenAI SDK (`@google/genai`)

## Building and Running

### Prerequisites
*   Node.js (v20+ recommended)
*   A GitHub Personal Access Token (for live data)
*   A Google Gemini API Key (for AI features)

### Scripts
The following scripts are available in `package.json`:

*   **Start Development Server:**
    ```bash
    npm run dev
    ```
    Runs the app in development mode with hot module replacement.

*   **Build for Production:**
    ```bash
    npm run build
    ```
    Compiles the application into the `dist/` directory.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```
    Locally previews the production build.

## Configuration
The application relies on environment variables and runtime configuration:
1.  **Environment Variables:** Create a `.env.local` file and add your Gemini API Key:
    ```
    GEMINI_API_KEY=your_key_here
    ```
2.  **Runtime Config:** GitHub settings (Owner, Repo, Token) are configured within the application's "Settings" view.

## Architecture & Conventions

### Directory Structure
*   `components/`: UI components (Dashboard, IssueCard, etc.).
*   `services/`: logic for external APIs.
    *   `githubService.ts`: Handles GitHub API requests. Contains `MOCK_ISSUES` for fallback.
    *   `geminiService.ts`: Integration with Google's Gemini AI.
*   `types.ts`: Centralized TypeScript interfaces (`Issue`, `ResearchNote`, `GithubConfig`).

### Development Patterns
*   **Service Layer:** API logic is encapsulated in `services/`. Components should call these services rather than making raw `fetch` calls.
*   **Mocking:** The `githubService` automatically falls back to mock data if credentials are missing or valid data cannot be fetched, facilitating easy UI development.
*   **Styling:** The project uses a custom color palette (e.g., `warp-panel`, `warp-text`) likely defined in the Tailwind configuration.
