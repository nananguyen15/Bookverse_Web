module.exports = {
  theme: {
    extend: {
      colors: {
        beige: {
          100: "rgb(248, 244, 225)", // nhạt nhất
          300: "rgb(175, 143, 111)", // trung bình
          500: "rgb(116, 81, 45)", // đậm
          700: "rgb(84, 51, 16)", // đậm nhất
          
        },
      },
    },
    fontFamily: {
      brand: ["LovelyHome", "cursive"], // dùng cho logo hoặc brand text
      heading: ["BelgianoSerif2", "serif"], // dùng cho tiêu đề
      body: ["OpenSans", "sans-serif"], // ví dụ font nội dung bạn sẽ thêm sau
    },
  },
};
