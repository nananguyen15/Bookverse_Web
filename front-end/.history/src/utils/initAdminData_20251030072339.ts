import { mockBooksDB, mapDBBook } from "../data/books";
import { categories } from "../data/categories";
import { seriesData } from "../data/series";

// Map books data to admin format
export function initializeAdminData() {
  // Initialize categories with flat structure (main + sub)
  const existingCategories = localStorage.getItem("adminCategories");

  if (!existingCategories) {
    const flatCategories: any[] = [];

    categories.forEach((mainCat) => {
      // Add main category
      flatCategories.push({
        id: String(mainCat.id),
        name: mainCat.name,
        slug: mainCat.slug,
        description: `Main category for ${mainCat.name}`,
        parentId: null, // null = main category
        booksCount: 0,
      });

      // Add subcategories
      if (mainCat.subcategories) {
        mainCat.subcategories.forEach((subCat) => {
          flatCategories.push({
            id: String(subCat.id),
            name: subCat.name,
            slug: subCat.slug,
            description: `Subcategory of ${mainCat.name}`,
            parentId: String(mainCat.id), // link to parent
            booksCount: 0,
          });
        });
      }
    });

    localStorage.setItem("adminCategories", JSON.stringify(flatCategories));
    console.log("✅ Initialized categories:", flatCategories.length);
  }

  // Initialize books
  const existingBooks = localStorage.getItem("adminBooks");

  if (!existingBooks) {
    const adminBooks = mockBooksDB.map((dbBook) => {
      const frontendBook = mapDBBook(dbBook);

      return {
        id: frontendBook.id,
        title: frontendBook.title,
        author: `Author ${frontendBook.authorId || "Unknown"}`, // TODO: Add real authors
        publisher: `Publisher ${frontendBook.publisherId || "Unknown"}`, // TODO: Add real publishers
        publishedDate: frontendBook.publishedDate,
        categoryId: frontendBook.categoryId || "",
        promotionId: undefined,
        originalPrice: frontendBook.price,
        discountedPrice: undefined,
        description: frontendBook.description,
        coverImage: frontendBook.image || "",
        stockQuantity: frontendBook.stockQuantity,
        status: frontendBook.stockQuantity > 0 ? "In Stock" : "Out of Stock",
      };
    });

    localStorage.setItem("adminBooks", JSON.stringify(adminBooks));
    console.log("✅ Initialized books:", adminBooks.length);
  }

  // Initialize series
  const existingSeries = localStorage.getItem("adminSeries");

  if (!existingSeries) {
    const adminSeries = seriesData.map((series) => {
      return {
        id: String(series.id),
        title: series.title,
        author: `Author ${series.author_id}`,
        publisher: `Publisher ${series.publisher_id}`,
        publishedDate: series.published_date,
        categoryId: String(series.category_id),
        promotionId: undefined,
        originalPrice: series.price,
        discountedPrice: undefined,
        description: series.description,
        coverImage: series.image || "",
        stockQuantity: series.stock_quantity,
        status: series.stock_quantity > 0 ? "In Stock" : "Out of Stock",
      };
    });

    localStorage.setItem("adminSeries", JSON.stringify(adminSeries));
    console.log("✅ Initialized series:", adminSeries.length);
  }

  // Update books count for categories
  updateCategoryBooksCount();

  // Initialize sample orders
  initializeSampleOrders();

  // Initialize sample reviews
  initializeSampleReviews();
}

// Initialize sample orders for testing
function initializeSampleOrders() {
  const existingOrders = localStorage.getItem("orders");

  if (!existingOrders || JSON.parse(existingOrders).length === 0) {
    const sampleOrders = [
      {
        orderId: "ORD001",
        customerId: "customer1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        orderDate: "2024-10-25T10:30:00Z",
        status: "Delivered",
        items: [
          { id: "1", title: "The Great Gatsby", quantity: 1, price: 15.99 },
          {
            id: "2",
            title: "To Kill a Mockingbird",
            quantity: 2,
            price: 12.99,
          },
        ],
        summary: {
          subtotal: 41.97,
          shipping: 5.0,
          total: 46.97,
        },
        paymentMethod: "Credit Card",
        shippingInfo: {
          fullName: "John Doe",
          phone: "0912345678",
          province: "Ho Chi Minh",
          district: "District 1",
          ward: "Ward 1",
          street: "123 Main St",
        },
        estimatedDelivery: "2024-10-28",
      },
      {
        orderId: "ORD002",
        customerId: "customer2",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        orderDate: "2024-10-27T14:20:00Z",
        status: "Preparing",
        items: [{ id: "3", title: "1984", quantity: 1, price: 14.99 }],
        summary: {
          subtotal: 14.99,
          shipping: 5.0,
          total: 19.99,
        },
        paymentMethod: "Cash on Delivery",
        shippingInfo: {
          fullName: "Jane Smith",
          phone: "0987654321",
          province: "Hanoi",
          district: "Ba Dinh",
          ward: "Cong Vi",
          street: "456 Oak Ave",
        },
        estimatedDelivery: "2024-10-30",
      },
      {
        orderId: "ORD003",
        customerId: "customer3",
        customerName: "Mike Johnson",
        customerEmail: "mike@example.com",
        orderDate: "2024-10-28T09:15:00Z",
        status: "Confirmed",
        items: [
          { id: "4", title: "Harry Potter Series", quantity: 1, price: 79.99 },
        ],
        summary: {
          subtotal: 79.99,
          shipping: 0.0,
          total: 79.99,
        },
        paymentMethod: "Bank Transfer",
        shippingInfo: {
          fullName: "Mike Johnson",
          phone: "0901234567",
          province: "Da Nang",
          district: "Hai Chau",
          ward: "Thanh Binh",
          street: "789 Elm Rd",
        },
        estimatedDelivery: "2024-11-01",
      },
    ];

    localStorage.setItem("orders", JSON.stringify(sampleOrders));
    console.log("✅ Initialized sample orders:", sampleOrders.length);
  }
}

// Initialize sample reviews for testing
function initializeSampleReviews() {
  const existingReviews = localStorage.getItem("reviews");

  if (!existingReviews || JSON.parse(existingReviews).length === 0) {
    const sampleReviews = [
      {
        id: "REV001",
        customerId: "customer1",
        customerName: "John Doe",
        productId: "1",
        productName: "The Great Gatsby",
        productType: "book",
        rating: 5,
        comment:
          "Absolutely loved this classic! The writing is beautiful and the story is timeless. Highly recommend to anyone who enjoys American literature.",
        date: "2024-10-26T15:30:00Z",
      },
      {
        id: "REV002",
        customerId: "customer2",
        customerName: "Jane Smith",
        productId: "2",
        productName: "To Kill a Mockingbird",
        productType: "book",
        rating: 5,
        comment:
          "One of the best books I've ever read. The themes of justice and morality are still relevant today. A must-read!",
        date: "2024-10-27T10:45:00Z",
      },
      {
        id: "REV003",
        customerId: "customer3",
        customerName: "Mike Johnson",
        productId: "4",
        productName: "Harry Potter Series",
        productType: "series",
        rating: 5,
        comment:
          "Magical! The entire series is a masterpiece. Worth every penny. My kids and I read it together and loved every moment.",
        date: "2024-10-28T20:15:00Z",
      },
      {
        id: "REV004",
        customerId: "customer4",
        customerName: "Sarah Williams",
        productId: "3",
        productName: "1984",
        productType: "book",
        rating: 4,
        comment:
          "Powerful and disturbing. Orwell's vision is chilling and thought-provoking. Took me a while to finish but definitely worth it.",
        date: "2024-10-29T11:20:00Z",
      },
      {
        id: "REV005",
        customerId: "customer5",
        customerName: "Robert Brown",
        productId: "5",
        productName: "Pride and Prejudice",
        productType: "book",
        rating: 5,
        comment:
          "Jane Austen at her finest. The romance, the wit, the social commentary - everything is perfect. Can't believe I waited so long to read this!",
        date: "2024-10-29T16:00:00Z",
      },
      {
        id: "REV006",
        customerId: "customer6",
        customerName: "Emily Davis",
        productId: "6",
        productName: "The Catcher in the Rye",
        productType: "book",
        rating: 3,
        comment:
          "Interesting perspective on teenage angst, but I found Holden a bit too whiny at times. Good read overall though.",
        date: "2024-10-28T14:30:00Z",
      },
    ];

    localStorage.setItem("reviews", JSON.stringify(sampleReviews));
    console.log("✅ Initialized sample reviews:", sampleReviews.length);
  }

  // Initialize sample promotions
  const existingPromotions = localStorage.getItem("promotions");

  if (!existingPromotions) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const samplePromotions = [
      {
        id: "PROMO001",
        name: "Winter Reading Sale 2024",
        applyTo: "all",
        categoryId: null,
        categoryName: null,
        description: "Get 20% off on all books this winter season!",
        discountType: "percentage",
        discountValue: 20,
        startDate: oneMonthAgo.toISOString().split("T")[0],
        endDate: twoWeeksFromNow.toISOString().split("T")[0],
        active: true,
      },
      {
        id: "PROMO002",
        name: "New Customer Welcome",
        applyTo: "category",
        categoryId: "1", // Fiction category
        categoryName: "Fiction",
        description: "New to BookVerse? Enjoy 15% off on all fiction books!",
        discountType: "percentage",
        discountValue: 15,
        startDate: now.toISOString().split("T")[0],
        endDate: oneMonthFromNow.toISOString().split("T")[0],
        active: true,
      },
      {
        id: "PROMO003",
        name: "Black Friday 2024",
        applyTo: "all",
        categoryId: null,
        categoryName: null,
        description:
          "Biggest sale of the year! $50 flat discount on all purchases.",
        discountType: "fixed",
        discountValue: 50,
        startDate: oneMonthFromNow.toISOString().split("T")[0],
        endDate: twoMonthsFromNow.toISOString().split("T")[0],
        active: false,
      },
    ];

    localStorage.setItem("promotions", JSON.stringify(samplePromotions));
    console.log("✅ Initialized sample promotions:", samplePromotions.length);
  }
}

// Update books count for each category
export function updateCategoryBooksCount() {
  const categories = JSON.parse(
    localStorage.getItem("adminCategories") || "[]"
  );
  const books = JSON.parse(localStorage.getItem("adminBooks") || "[]");

  const updatedCategories = categories.map((cat: any) => {
    const count = books.filter(
      (book: any) => book.categoryId === cat.id
    ).length;
    return { ...cat, booksCount: count };
  });

  localStorage.setItem("adminCategories", JSON.stringify(updatedCategories));
}
