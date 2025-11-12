// ---------- Database Book Type (from backend) ----------
export type DBBook = {
  id: string | number; // bigint can be serialized as string
  title: string;
  description: string;
  price: number;
  author_id: string | number | null;
  publisher_id: string | number | null;
  category_id: string | number | null;
  stock_quantity: number; // default 0
  published_date: string; // 'YYYY-MM-DD'
  image: string | null;
  active: 0 | 1 | boolean; // MySQL BIT can arrive as 0/1 or boolean
};

// ---------- Frontend Book Type ----------
export type Book = {
  id: string; // normalize to string for safety
  title: string;
  description: string;
  price: number;
  authorId?: string | null;
  publisherId?: string | null;
  categoryId?: string | null;
  stockQuantity: number;
  publishedDate: string; // ISO date string
  image?: string | null;
  active: boolean;
};

// ---------- Mapper (DB → Frontend) ----------
export function mapDBBook(db: DBBook): Book {
  const toStr = (v: unknown) => (v == null ? "" : String(v));
  const toBool = (v: unknown) => (typeof v === "boolean" ? v : Number(v) === 1);
  return {
    id: toStr(db.id),
    title: db.title,
    description: db.description ?? "",
    price: Number(db.price ?? 0),
    authorId: db.author_id == null ? null : toStr(db.author_id),
    publisherId: db.publisher_id == null ? null : toStr(db.publisher_id),
    categoryId: db.category_id == null ? null : toStr(db.category_id),
    stockQuantity: Number(db.stock_quantity ?? 0),
    publishedDate: db.published_date ?? "",
    image: db.image ?? null,
    active: toBool(db.active),
  };
}

// ---------- Book Group (for slider) ----------
export type BookGroup = Book[];

// ---------- Mock Data (English translations) ----------
export const mockBooksDB: DBBook[] = [
  {
    id: 1,
    title: "The Wren in the Holly Library",
    description:
      "A gothic fantasy story about a magical library where secrets of the divine bird and ancient curses are revealed.",
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
    title: "The Bear and the Nightingale",
    description:
      "A mythological tale inspired by Russian folklore, telling the story of Vasya - a girl who can see natural spirits and must fight against dark forces.",
    price: 13.5,
    author_id: 102,
    publisher_id: 202,
    category_id: 301,
    stock_quantity: 8,
    published_date: "2017-01-10",
    image: "/img/the-bear-and-the-nightingale.jpg",
    active: 1,
  },
  {
    id: 3,
    title: "The Herbwitch Princess",
    description:
      "Part 2 of the Witches of Olderea series - an herbalist witch discovers her royal lineage and the battle between light and darkness.",
    price: 15.2,
    author_id: 103,
    publisher_id: 203,
    category_id: 301,
    stock_quantity: 7,
    published_date: "2024-04-01",
    image: "/img/the-herbwitch-princess.jpg",
    active: 1,
  },
  {
    id: 4,
    title: "Little Women",
    description:
      "A classic novel about the four March sisters growing up during the Civil War, learning about love, kindness, and aspirations.",
    price: 11.5,
    author_id: 104,
    publisher_id: 204,
    category_id: 302,
    stock_quantity: 15,
    published_date: "1868-09-30",
    image: "/img/little-women.jpg",
    active: 1,
  },
  {
    id: 5,
    title: "A Kingdom of Frost and Fear",
    description:
      "A warrior woman must choose between love and duty in a kingdom shrouded in frost and fear.",
    price: 14.2,
    author_id: 105,
    publisher_id: 205,
    category_id: 301,
    stock_quantity: 9,
    published_date: "2023-09-15",
    image: "/img/a-kingdom-of-frost-and-fear.jpg",
    active: 1,
  },
  {
    id: 6,
    title: "A Lite Too Bright",
    description:
      "Arthur Louis Pullman III searches for the truth about his grandfather death, a famous writer, on a cross-country train journey - a journey of youth and memory.",
    price: 13.9,
    author_id: 106,
    publisher_id: 206,
    category_id: 302,
    stock_quantity: 9,
    published_date: "2018-05-08",
    image: "/img/a-little-too-bright.jpg",
    active: 1,
  },
  {
    id: 7,
    title: "The Hobbit",
    description:
      "A classic adventure story about Bilbo Baggins - a hobbit drawn into a quest to reclaim treasure guarded by the dragon Smaug.",
    price: 12.5,
    author_id: 107,
    publisher_id: 207,
    category_id: 301,
    stock_quantity: 12,
    published_date: "1937-09-21",
    image: "/img/the-hobbit.jpg",
    active: 1,
  },
  {
    id: 8,
    title: "Descendant of the Crane",
    description:
      "Princess Hesina must face court intrigue while investigating her father's death in a world inspired by ancient China.",
    price: 14.5,
    author_id: 108,
    publisher_id: 208,
    category_id: 301,
    stock_quantity: 8,
    published_date: "2019-04-09",
    image: "/img/descendant-of-the-crane.jpg",
    active: 1,
  },
  {
    id: 9,
    title: "The Snow Queen",
    description:
      "Gerda overcomes ice and cold to save her friend Kai from the curse of the Snow Queen -- a symbol of love and courage.",
    price: 11.9,
    author_id: 109,
    publisher_id: 209,
    category_id: 302,
    stock_quantity: 15,
    published_date: "1844-12-21",
    image: "/img/the-snow-queen.jpg",
    active: 1,
  },
  {
    id: 10,
    title: "Blue is a Darkness Weakened by Light",
    description:
      "A surreal and emotional story about pain, redemption, and light in the darkness of youth.",
    price: 13.2,
    author_id: 110,
    publisher_id: 210,
    category_id: 302,
    stock_quantity: 7,
    published_date: "2021-08-03",
    image: "/img/blue-is-a-darkness-weakened-by-light.jpg",
    active: 1,
  },
  {
    id: 11,
    title: "Sea Smoke",
    description:
      "A fantasy story set in a misty land where spirits and humans coexist on the border between memory and freedom.",
    price: 15.0,
    author_id: 111,
    publisher_id: 211,
    category_id: 301,
    stock_quantity: 6,
    published_date: "2023-03-14",
    image: "/img/sea-smoke.jpg",
    active: 1,
  },
  {
    id: 12,
    title: "Friend Zone",
    description:
      "A light-hearted romantic youth story about the boundary between friendship and love.",
    price: 10.9,
    author_id: 112,
    publisher_id: 212,
    category_id: 303,
    stock_quantity: 18,
    published_date: "2020-06-20",
    image: "/img/friendzone.jpg",
    active: 1,
  },
  {
    id: 13,
    title: "The Prisoner in the Oak",
    description:
      "The final installment of the Avalon series - recounting the fall of Camelot and the tragic fate of Merlin and Morgaine.",
    price: 13.9,
    author_id: 113,
    publisher_id: 213,
    category_id: 301,
    stock_quantity: 9,
    published_date: "1987-07-01",
    image: "/img/the-prisoner-in-the-oak.jpg",
    active: 1,
  },
  {
    id: 14,
    title: "The Secret Garden",
    description:
      "Mary Lennox discovers a forgotten garden that helps her and her friends find joy and healing.",
    price: 11.2,
    author_id: 114,
    publisher_id: 214,
    category_id: 302,
    stock_quantity: 10,
    published_date: "1911-08-01",
    image: "/img/the-secret-garden.jpg",
    active: 1,
  },
  {
    id: 15,
    title: "The Song of Achilles",
    description:
      "A tragic and romantic retelling of the myth of Achilles and Patroclus, celebrating love and honor amidst the Trojan War.",
    price: 14.8,
    author_id: 115,
    publisher_id: 215,
    category_id: 301,
    stock_quantity: 10,
    published_date: "2011-09-20",
    image: "/img/the-song-of-achlles.jpg",
    active: 1,
  },
];

// ---------- Mapped books for frontend ----------
export const mockBooks: Book[] = mockBooksDB.map(mapDBBook);

// ---------- Group books for Hero slider (3 books per slide, 5 slides) ----------
export const heroBookGroups: BookGroup[] = [
  [mockBooks[0], mockBooks[1], mockBooks[2]], // Slide 1
  [mockBooks[3], mockBooks[4], mockBooks[5]], // Slide 2
  [mockBooks[6], mockBooks[7], mockBooks[8]], // Slide 3
  [mockBooks[9], mockBooks[10], mockBooks[11]], // Slide 4
  [mockBooks[12], mockBooks[13], mockBooks[14]], // Slide 5
];

export const books = heroBookGroups.flat();
