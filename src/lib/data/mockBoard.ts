/**
 * Mock data for testing the game board layout
 */

import type { Board } from '$lib/types/game';

export const mockBoard: Board = {
  id: 1,
  title: 'Banned Books Trivia',
  description: 'Test your knowledge of frequently challenged and banned books',
  createdBy: 'mock-user-id',
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  categories: [
    {
      id: 1,
      boardId: 1,
      name: 'Classic Novels',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 1,
          categoryId: 1,
          value: 100,
          question: 'This 1960 novel by Harper Lee features Scout Finch',
          answer: 'What is To Kill a Mockingbird?',
          timeLimit: 30,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          categoryId: 1,
          value: 200,
          question: 'J.D. Salinger wrote this 1951 novel about Holden Caulfield',
          answer: 'What is The Catcher in the Rye?',
          timeLimit: 30,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          categoryId: 1,
          value: 300,
          question: "George Orwell's dystopian novel set in Oceania",
          answer: 'What is 1984?',
          timeLimit: 30,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          categoryId: 1,
          value: 400,
          question: "Ray Bradbury's novel about book-burning firemen",
          answer: 'What is Fahrenheit 451?',
          timeLimit: 30,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          categoryId: 1,
          value: 500,
          question: "John Steinbeck's novel about the Joad family during the Depression",
          answer: 'What is The Grapes of Wrath?',
          timeLimit: 30,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 2,
      boardId: 1,
      name: 'Young Adult',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 6,
          categoryId: 2,
          value: 100,
          question: 'This series by J.K. Rowling features a boy wizard',
          answer: 'What is Harry Potter?',
          timeLimit: 30,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 7,
          categoryId: 2,
          value: 200,
          question: "Suzanne Collins' dystopian trilogy featuring Katniss Everdeen",
          answer: 'What is The Hunger Games?',
          timeLimit: 30,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 8,
          categoryId: 2,
          value: 300,
          question: "Judy Blume's coming-of-age novel about Margaret",
          answer: "What is Are You There God? It's Me, Margaret?",
          timeLimit: 30,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 9,
          categoryId: 2,
          value: 400,
          question: "Jay Asher's novel about Hannah Baker's cassette tapes",
          answer: 'What is Thirteen Reasons Why?',
          timeLimit: 30,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 10,
          categoryId: 2,
          value: 500,
          question: "Laurie Halse Anderson's novel about teen trauma and silence",
          answer: 'What is Speak?',
          timeLimit: 30,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 3,
      boardId: 1,
      name: 'Authors',
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 11,
          categoryId: 3,
          value: 100,
          question: 'Author of "The Handmaid\'s Tale"',
          answer: 'Who is Margaret Atwood?',
          timeLimit: 30,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 12,
          categoryId: 3,
          value: 200,
          question: 'Author of "Slaughterhouse-Five"',
          answer: 'Who is Kurt Vonnegut?',
          timeLimit: 30,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 13,
          categoryId: 3,
          value: 300,
          question: 'Author of "Beloved" and Nobel Prize winner',
          answer: 'Who is Toni Morrison?',
          timeLimit: 30,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 14,
          categoryId: 3,
          value: 400,
          question: 'Author of "A Clockwork Orange"',
          answer: 'Who is Anthony Burgess?',
          timeLimit: 30,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 15,
          categoryId: 3,
          value: 500,
          question: 'Author of "Brave New World"',
          answer: 'Who is Aldous Huxley?',
          timeLimit: 30,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 4,
      boardId: 1,
      name: 'Controversy',
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 16,
          categoryId: 4,
          value: 100,
          question: 'Common reason books are challenged in schools',
          answer: 'What is explicit content or profanity?',
          timeLimit: 30,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 17,
          categoryId: 4,
          value: 200,
          question: 'Week in September celebrating freedom to read',
          answer: 'What is Banned Books Week?',
          timeLimit: 30,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 18,
          categoryId: 4,
          value: 300,
          question: 'Organization that tracks book challenges',
          answer: 'What is the American Library Association?',
          timeLimit: 30,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 19,
          categoryId: 4,
          value: 400,
          question: 'State that banned the most books in 2022-2023',
          answer: 'What is Florida?',
          timeLimit: 30,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 20,
          categoryId: 4,
          value: 500,
          question: 'Constitutional amendment protecting freedom of speech',
          answer: 'What is the First Amendment?',
          timeLimit: 30,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 5,
      boardId: 1,
      name: 'Themes',
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 21,
          categoryId: 5,
          value: 100,
          question: 'Books featuring LGBTQ+ characters are often challenged for this reason',
          answer: 'What is sexual content or "promoting a lifestyle"?',
          timeLimit: 30,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 22,
          categoryId: 5,
          value: 200,
          question: 'Theme in "The Perks of Being a Wallflower"',
          answer: 'What is mental health or coming of age?',
          timeLimit: 30,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 23,
          categoryId: 5,
          value: 300,
          question: 'Central theme in "Lord of the Flies"',
          answer: 'What is human nature or civilization vs savagery?',
          timeLimit: 30,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 24,
          categoryId: 5,
          value: 400,
          question: 'Theme that got "The Bluest Eye" frequently challenged',
          answer: 'What is racial identity or sexual violence?',
          timeLimit: 30,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 25,
          categoryId: 5,
          value: 500,
          question: 'Philosophical theme in "Brave New World"',
          answer: 'What is dystopian society or loss of individuality?',
          timeLimit: 30,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  ]
};
