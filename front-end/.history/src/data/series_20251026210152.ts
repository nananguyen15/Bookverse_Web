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
    image:
      "https://i.pinimg.com/originals/cf/df/e2/cfdfe2d45d2cbeda5f6766880e9adace.jpg",
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
    image: "https://images-na.ssl-images-amazon.com/images/I/81Ui-jN6kYL.jpg",
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
    image:
      "https://rouleur.cc/cdn/shop/products/TCA-1-4-Bundle_1024x1024.jpg?v=1613658510",
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
    image:
      "https://images.ctfassets.net/bxd3o8b291gf/4U9mXjN5bS8Y6iAcuW2i6E/b4e6f667c009b0b45dcfb81da30e8c37/Harry-Potter-books.jpg",
    active: 1,
  },
];
