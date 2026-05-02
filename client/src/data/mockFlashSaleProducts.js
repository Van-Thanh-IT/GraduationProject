export const mockFlashSaleProducts = [
  {
    variantId: "V101",
    name: "Apple iPhone 15 Pro Max 256GB Titan Tự nhiên",
    image: "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg",
    price: 28990000,
    originalPrice: 34990000,
    sold: 85,      // Đã bán
    total: 100,    // Tổng kho Flash Sale
    // Kết thúc sau 2 tiếng nữa kể từ bây giờ
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), 
  },
  {
    variantId: "V102",
    name: "Chuột Không Dây Logitech G304 Lightspeed",
    image: "https://cdn.tgdd.vn/Products/Images/86/289650/chuot-khong-day-logitech-mx-master-3s-thumb-600x600.jpg",
    price: 590000,
    originalPrice: 1200000,
    sold: 195,
    total: 200, 
    // Kết thúc sau 15 phút nữa (Tạo cảm giác cực kỳ gấp gáp)
    endTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  },
  {
    variantId: "V103",
    name: "Tai nghe AirPods Pro 2 MagSafe (USB-C)",
    image: "https://cdn.tgdd.vn/Products/Images/54/289701/tai-nghe-bluetooth-airpods-pro-2-magsafe-charge-apple-mqd83-thumb-600x600.jpg",
    price: 5490000,
    originalPrice: 6990000,
    sold: 12,
    total: 50,
    // Kết thúc sau 5 tiếng nữa
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    variantId: "V104",
    name: "Củ sạc nhanh Anker 20W Type-C",
    image: "https://cdn.tgdd.vn/Products/Images/9499/287955/adapter-sac-type-c-20w-anker-powerport-iii-a2149-thumb-600x600.jpg",
    price: 1990000,
    originalPrice: 400000,
    sold: 400,
    total: 400, // ĐÃ BÁN HẾT
    endTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
  }
];