export type Category = {
  id: number;
  name: string;
  slug: string;
  subcategories?: SubCategory[];
};

export type SubCategory = {
  id: number;
  name: string;
  slug: string;
};

export const categories: Category[] = [
  {
    id: 1,
    name: "Fiction",
    slug: "fiction",
    subcategories: [
      { id: 101, name: "Literature & General Fiction", slug: "literature-general-fiction" },
      { id: 102, name: "Mystery & Thriller", slug: "mystery-thriller" },
      { id: 103, name: "Romance", slug: "romance" },
      { id: 104, name: "Science Fiction & Fantasy", slug: "sci-fi-fantasy" },
      { id: 105, name: "Historical Fiction", slug: "historical-fiction" },
      { id: 106, name: "Graphic Novels & Comics", slug: "graphic-novels-comics" },
      { id: 107, name: "Horror", slug: "horror" },
      { id: 108, name: "Young Adult (YA) Fiction", slug: "ya-fiction" },
    ],
  },
  {
    id: 2,
    name: "Non-Fiction",
    slug: "non-fiction",
    subcategories: [
      { id: 201, name: "Biography & Memoir", slug: "biography-memoir" },
      { id: 202, name: "Self-Help & Personal Growth", slug: "self-help" },
      { id: 203, name: "Business & Economics", slug: "business-economics" },
      { id: 204, name: "History", slug: "history" },
      { id: 205, name: "Politics & Current Affairs", slug: "politics" },
      { id: 206, name: "Science & Technology", slug: "science-technology" },
      { id: 207, name: "Health, Wellness & Fitness", slug: "health-wellness" },
      { id: 208, name: "Travel & Adventure", slug: "travel-adventure" },
      { id: 209, name: "Art, Photography & Design", slug: "art-design" },
      { id: 210, name: "Religion & Spirituality", slug: "religion" },
      { id: 211, name: "Education & Reference", slug: "education" },
    ],
  },
  {
    id: 3,
    name: "Kids & Teens",
    slug: "kids-teens",
    subcategories: [
      { id: 301, name: "Ages 0-2 / Babies & Toddlers", slug: "ages-0-2" },
      { id: 302, name: "Ages 3-5", slug: "ages-3-5" },
      { id: 303, name: "Ages 6-8", slug: "ages-6-8" },
      { id: 304, name: "Ages 9-12", slug: "ages-9-12" },
      { id: 305, name: "Young Adult (13+)", slug: "young-adult" },
      { id: 306, name: "Children's Nonfiction", slug: "childrens-nonfiction" },
      { id: 307, name: "Graphic Novels for Kids", slug: "graphic-novels-kids" },
    ],
  },
  {
    id: 4,
    name: "Academic & Professional",
    slug: "academic-professional",
    subcategories: [
      { id: 401, name: "Textbooks & Study Aids", slug: "textbooks" },
      { id: 402, name: "Professional & Career Development", slug: "career" },
      { id: 403, name: "Language Learning", slug: "language-learning" },
      { id: 404, name: "Law, Medicine, Engineering", slug: "specialized" },
    ],
  },
  {
    id: 5,
    name: "Specialty & Collectibles",
    slug: "specialty",
    subcategories: [
      { id: 501, name: "Rare & Collectible Books", slug: "rare-collectible" },
      { id: 502, name: "Art Books / Coffee Table Books", slug: "art-books" },
      { id: 503, name: "Local / Regional Interest", slug: "local-regional" },
      { id: 504, name: "Indie / Small Press", slug: "indie" },
    ],
  },
];
