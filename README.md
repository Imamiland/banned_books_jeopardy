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

_(Add screenshots of the application in action to visually showcase the interface and functionality.)_ <!-- markdownlint-disable MD036 -->

## Technology Stack

- **Frontend**: [Svelte](https://svelte.dev/) for a lightweight and reactive UI.
- **Full-stack**: [SvelteKit](https://svelte.dev/docs/kit/introduction) for a full-stack development
- **Hosting**: [Vercel](https://vercel.com/) for seamless deployment and scalability.

## Getting Started

### Prerequisites

- Node.js (>= 22.x)
- PNPM (preferred package manager)
  Install PNPM: `npm install -g pnpm`

### Local Development

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/banned-books-jeopardy.git
   cd banned-books-jeopardy
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

## Customization

To adapt the trivia questions and categories:

- Update the `src/data/questions.json` file with your own categories and questions.

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
