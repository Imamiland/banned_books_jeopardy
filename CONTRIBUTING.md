<!-- omit in toc -->

# Contributing to Banned Books Jeopardy

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:

> - Star the project
> - Tweet about it
> - Refer this project in your project's README
> - Mention the project at local meetups and tell your friends/colleagues

<!-- omit in toc -->

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Improving The Documentation](#improving-the-documentation)
- [Styleguides](#styleguides)
  - [Commit Messages](#commit-messages)
  - [Code Formatting and Linting](#code-formatting-and-linting)
- [Development and Pull Requests](#development-and-pull-requests)

## Code of Conduct

This project and everyone participating in it is governed by the [Banned Books Jeopardy Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [help@imamiland.com](mailto:help@imamiland.com).

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](https://github.com/Imamiland/banned_books_jeopardy).

Before you ask a question, it is best to search for existing [Issues](https://github.com/Imamiland/banned_books_jeopardy/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you still need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/Imamiland/banned_books_jeopardy/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (Node.js, PNPM, etc.), depending on what seems relevant.

We will take care of the issue as soon as possible.

## I Want To Contribute

### Legal Notice <!-- omit in toc -->

When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content, and that the content you contribute may be provided under the project license.

### Reporting Bugs

<!-- omit in toc -->

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the [documentation](https://github.com/Imamiland/banned_books_jeopardy). If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](/issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if users outside the GitHub community have discussed the issue.
- Collect information about the bug:
- Stack trace (Traceback)
- OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
- Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
- Possibly your input and the output
- Can you reliably reproduce the issue? And can you also reproduce it with older versions?

<!-- omit in toc -->

#### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead, sensitive bugs must be sent by email to [security@imamiland.com](mailto:security@imamiland.com).

<!-- You may add a PGP key to allow the messages to be sent encrypted as well. -->

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](/issues/new). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the _reproduction steps_ that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution).

<!-- You might want to create an issue template for bugs and errors that can be used as a guide and that defines the structure of the information to be included. If you do so, reference it here in the description. -->

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Hello, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

<!-- omit in toc -->

#### Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Read the [documentation](https://github.com/imamiland/banned_books_jeopardy) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

<!-- omit in toc -->

#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](/issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- You may want to **include screenshots or screen recordings** which help you demonstrate the steps or point out the part which the suggestion is related to. You can use [LICEcap](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and the built-in [screen recorder in GNOME](https://help.gnome.org/users/gnome-help/stable/screen-shot-record.html.en) or [SimpleScreenRecorder](https://github.com/MaartenBaert/ssr) on Linux. <!-- this should only be included if the project has a GUI -->
- **Explain why this enhancement would be useful** to most Hello users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

<!-- You might want to create an issue template for enhancement suggestions that can be used as a guide and that defines the structure of the information to be included. If you do so, reference it here in the description. -->

### Your First Code Contribution

Please ensure you have the following set up before contributing code:

- **Pre-commit Hooks**: This project uses `pre-commit` to automate linting and formatting. Run `pre-commit install` after cloning the repository.
- **Linting**: MegaLinter is configured to enforce style rules. Make sure your changes pass the configured linting rules by running:

```bash
pnpx mega-linter-runner
```

- **Development Environment**: Ensure the site builds and previews correctly on your local setup before submitting changes:

```bash
pnpm install
pnpm dev
```

### Improving The Documentation

Improvements to documentation are always welcome. Ensure that all changes are accurate and clear, and adhere to the project's style guide.

## Styleguides

### Commit Messages

This project adheres to the Angular preset for semantic versioning and changelog generation. Commit messages must follow this format:

<type>(<scope>): <description>

[optional body]

[optional footer(s)]

Always show details

#### Commit Message Guidelines

- **Type**: Describes the category of the change. Examples include `feat` (new feature), `fix` (bug fix), `docs` (documentation updates), `style` (formatting changes), `refactor` (code restructuring), and more. For the complete list of types refer to the [Angular Commit Formatting Reference](https://gist.github.com/brianclements/841ea7bffdb01346392c#type).

- **Scope**: Specifies the area of the codebase affected (e.g., `ui`, `api`, or `build`). This is optional but encouraged for clarity.

- **Description**: A concise description of the change in the present tense, without punctuation at the end.

- **Body**: Provides a detailed explanation of the change. Use if necessary.

- **Footer**: Includes additional context, such as `BREAKING CHANGE` or references to GitHub issues.

Commit messages are validated automatically using a pre-commit hook. The hook ensures adherence to the Angular preset format. If your commit message does not meet these standards, the commit will be rejected. To avoid issues:

1. Write commit messages in the correct format.

2. If you're unsure, refer to the Angular preset format described above.

3. Use `git commit --amend` to fix an incorrect message and re-run the pre-commit hook.

For more details about the Angular commit message convention, see [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

### Code Formatting and Linting

Code must adhere to the project's linting and formatting guidelines, enforced by pre-commit hooks and MegaLinter. Configurations for both are provided in the repository.

## Development and Pull Requests

- Create a **linear commit history** before submitting a pull request. You can achieve this using `git rebase`.
- Ensure your branch is up-to-date with the target branch before creating a pull request.
- Run all tests and ensure your branch builds successfully.
- Verify that your changes display correctly in preview mode.
- Create a pull request on GitHub, following the template provided.
- Link relevant issues in the pull request description to provide context.

We appreciate your contributions to **Banned Books Jeopardy** and look forward to your input! 🎉
