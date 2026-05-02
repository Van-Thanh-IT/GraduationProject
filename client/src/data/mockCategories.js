// file: categoryData.js
export const mockCategories = [
  {
    id: 1,
    name: "Điện thoại & Tablet",
    slug: "dien-thoai-tablet",
    image: "https://cdn-icons-png.flaticon.com/512/15/15874.png", // Icon/Ảnh đại diện
    children: [
      {
        id: 11,
        name: "Apple (iPhone/iPad)",
        slug: "apple-iphone-ipad",
        children: [] // Cấp con cuối cùng
      },
      {
        id: 12,
        name: "Samsung Galaxy",
        slug: "samsung-galaxy",
        children: []
      },
      {
        id: 13,
        name: "Xiaomi / Redmi",
        slug: "xiaomi-redmi",
        children: []
      }
    ]
  },
  {
    id: 2,
    name: "Laptop & PC",
    slug: "laptop-pc",
    image: "https://cdn-icons-png.flaticon.com/512/428/428093.png",
    children: [
      {
        id: 21,
        name: "MacBook",
        slug: "macbook",
        children: []
      },
      {
        id: 22,
        name: "Laptop Gaming",
        slug: "laptop-gaming",
        children: [
          {
            id: 221,
            name: "Asus ROG",
            slug: "asus-rog"
          },
          {
            id: 222,
            name: "Acer Nitro",
            slug: "acer-nitro"
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Âm thanh",
    slug: "am-thanh",
    image: "https://cdn-icons-png.flaticon.com/512/869/869076.png",
    children: [
      {
        id: 31,
        name: "Tai nghe Bluetooth",
        slug: "tai-nghe-bluetooth"
      },
      {
        id: 32,
        name: "Loa di động",
        slug: "loa-di-dong"
      }
    ]
  }
];