# Banned Books Jeopardy

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-blue?logo=vercel)](https://banned-books-jeopardy.vercel.app/) [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Banned Books Jeopardy is a simple web application inspired by the [_Banned Books Trivia Night Manual_](https://bannedbooksweek.org/resources/banned-books-week-program-kits/) by the [American Library Association](https://bannedbooksweek.org) and the _Annual Banned Books Jeopardy_ event at the [University of Toledo Banned Books Vigil](https://www.utoledo.edu/commissions/banned-books/). This application is designed to engage audiences during a **Banned Books Vigil** event, showcasing important facts about banned and challenged books while adding a fun, game-show element to the occasion.

## Purpose

The primary goal of this application is to:

- Create an interactive trivia experience projected on stage during Banned Books Vigil event at the University of Toledo.
- Encourage audience participation by answering trivia questions about banned books.
- Highlight the significance of banned books and the stories surrounding them.

As a secondary goal, we also mean to create a reusable _shell_ application that can be used to host similar events
elsewhere.

> **Note:** This application is intended for use during live events and is not designed for widespread or general usage.

## Features

- Interactive "Jeopardy"-style trivia board.
- Predefined categories and questions based on the Banned Books Trivia Night Manual.
- Optimized for projection on large screens.

## Screenshots

See the live application in action at [banned-books-jeopardy.vercel.app](https://banned-books-jeopardy.vercel.app/).

## Technology Stack

- **Frontend**: [Svelte](https://svelte.dev/) (Svelte 5) for a lightweight and reactive UI.
- **Full-stack**: [SvelteKit](https://svelte.dev/docs/kit/introduction) for full-stack development.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4) for responsive, projection-optimized layouts.
- **Database**: [Turso](https://turso.tech/) (libSQL/SQLite) for persistent storage of boards, categories, and questions.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access.
- **Authentication**: [Auth0](https://auth0.com/) for role-based access control (see [Deployment Readiness](#deployment-readiness) below).
- **Hosting**: [Vercel](https://vercel.com/) for seamless deployment and scalability.
- **Tooling**: [mise](https://mise.jdx.dev/) for tool version and environment management; [pnpm](https://pnpm.io/) as the package manager.

## Getting Started

### Prerequisites

- Node.js (>= 22.x)
- PNPM (preferred package manager)
  Install PNPM: `npm install -g pnpm`

### Local Development

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Imamiland/banned_books_jeopardy.git
   cd banned_books_jeopardy
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Run the Development Server**

   ```bash
   pnpm dev
   ```

   Open your browser at [http://localhost:5173](http://localhost:5173) to view the application.

### Deployment

The application is automatically deployed to Vercel. For manual deployment:

1. Install the [Vercel CLI](https://vercel.com/docs/cli):

   ```bash
   npm install -g vercel
   ```

2. Deploy the application:

   ```bash
   vercel deploy
   ```

### Deployment Readiness

> **Important:** The application currently ships with a **mock** authentication implementation and is suitable for local development and demos only. It must **not** be deployed to a public URL until the checklist below is completed.

The full, step-by-step user-side setup (creating the Auth0 tenant and application, defining the `administrator` / `creator` / `player` roles, injecting roles into tokens, replacing the mock auth with the real SDK, configuring environment variables, and verifying before going public) is documented in [`CLAUDE.md`](CLAUDE.md#deployment-readiness-checklist-auth0--user-actions-required).

In summary, before deploying publicly you must:

1. Create an Auth0 tenant and a **Regular Web Application**, and record the domain, client ID, and client secret.
2. Create the three roles (`administrator`, `creator`, `player`) and assign them to users.
3. Inject roles into the issued token via an Auth0 Action or Rule.
4. Replace the mock auth with the real `@auth0/auth0-spa-js` SDK and a **signed** session cookie.
5. Add CSRF protection to all form actions and POST endpoints.
6. Configure all environment variables (see `.env.example`) locally and in the Vercel dashboard.
7. Verify that `pnpm check` and `pnpm test` pass and that role-based access control works as expected.

## Customization

To adapt the trivia questions and categories:

- Update the sample board in `src/lib/data/mockBoard.ts` with your own categories and questions.
- Or create and manage boards through the admin UI at `/admin/boards/new` (requires an authenticated `creator` or `administrator` role).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- **American Library Association** for inspiring this project with their Banned Books Trivia Night Manual.
- **Vercel** for providing a simple and effective hosting solution.

---

_Spread the word about banned books and their stories!_
