export type Series = {
  id: number;
  title: string;
  description: string;
  price: number;
  author_id: number;
  publisher_id: number;
  category_id: number;
  stock_quantity: number;
  published_date: string;
  image: string;
  active: number;
};

export const seriesData: Series[] = [
  {
    id: 1,
    title: "The Wren in the Holly Library",
    description:
      "A gothic fantasy story about a magical library, where secrets of a mythical bird and an ancient curse are revealed.",
    price: 14.9,
    author_id: 101,
    publisher_id: 201,
    category_id: 301,
    stock_quantity: 10,
    published_date: "2024-03-12",
    image: "/img/the-wren-in-the-holly-library.jpg",
    active: 1,
  },
  {
    id: 2,
    title: "Shatter Me Series",
    description:
      "A dystopian thriller series following Juliette Ferrars, a girl with a lethal touch, as she navigates a world controlled by the ruthless Reestablishment.",
    price: 59.99,
    author_id: 102,
    publisher_id: 202,
    category_id: 302,
    stock_quantity: 15,
    published_date: "2011-11-15",
    image: "/img/series/51ll3a7u-plus-9l-sy450-bo1-204-203-200.webp",
    active: 1,
  },
  {
    id: 3,
    title: "The Cycling Anthology",
    description:
      "A collection of essays and stories from the world of professional cycling, featuring contributions from top journalists and riders.",
    price: 24.95,
    author_id: 103,
    publisher_id: 203,
    category_id: 305,
    stock_quantity: 25,
    published_date: "2012-11-20",
    image: "/img/series/225306-ml-2245913.jpg",
    active: 1,
  },
  {
    id: 4,
    title: "Harry Potter Series",
    description:
      "A fantasy series following the life of a young wizard, Harry Potter, and his friends as they attend Hogwarts School of Witchcraft and Wizardry and battle the dark wizard Lord Voldemort.",
    price: 79.99,
    author_id: 104,
    publisher_id: 204,
    category_id: 304,
    stock_quantity: 50,
    published_date: "1997-06-26",
    image: "/img/series/7027e1b350ef2f524cbc4cb213133707.jpg",
    active: 1,
  },
];
