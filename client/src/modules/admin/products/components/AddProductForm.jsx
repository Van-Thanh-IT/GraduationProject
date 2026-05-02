import React, { useState, useRef } from "react";
import { message, Select, Spin } from "antd";
import {
  TagOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// 1. IMPORT CÁC HOOKS REACT QUERY
import { useSaveProduct } from "@/hooks/useProducts";
import { useGetBrands } from "@/hooks/useBrands";        
import { useGetCategories } from "@/hooks/useCategories";   

const OPTION_SUGGESTIONS = [

  { value: "Màu sắc", label: "Màu sắc" },

  { value: "Dung lượng", label: "Dung lượng lưu trữ (ROM)" },
  { value: "Phiên bản", label: "Xuất xứ / Phiên bản (Quốc tế, VN/A, LL/A)" },
  { value: "Kết nối mạng", label: "Kết nối (Chỉ Wifi / Wifi + 5G/Cellular)" }, // Bắt buộc phải có cho iPad

  { value: "RAM", label: "Dung lượng RAM" }, 
  { value: "CPU", label: "Vi xử lý (CPU)" },
  { value: "Card đồ họa", label: "Card đồ họa (VGA)" }, // Dành cho Laptop Gaming / PC build

  { value: "Kích thước mặt", label: "Kích thước mặt (VD: 40mm, 44mm, 49mm)" }, // Apple Watch
  { value: "Loại dây", label: "Chất liệu dây (Silicon, Thép, Da)" },

  { value: "Kiểu sạc", label: "Hộp sạc (Sạc dây / Sạc không dây MagSafe)" }, // Dành cho AirPods
  { value: "Chiều dài", label: "Chiều dài cáp (1m, 2m, 3m)" },
  { value: "Cổng kết nối", label: "Cổng kết nối (Type-C, Lightning, Micro USB)" },
  { value: "Loại Switch", label: "Loại Switch (Blue, Red, Brown...)" }, // Dành cho Bàn phím cơ
];


const formatCategoryOptions = (categoriesArray, level = 0) => {
  let options = [];
  
  categoriesArray.forEach((cat) => {
    // Tạo khoảng lùi đầu dòng cho danh mục con (VD: "— " hoặc "— — ")
    const prefix = level > 0 ? '— '.repeat(level) : '';
    
    options.push({
      value: cat.id,
      label: `${prefix}${cat.name}`, 
      // Lưu thêm một trường searchText không có dấu gạch để tìm kiếm cho dễ
      searchText: cat.name 
    });

    // Nếu có danh mục con (children), gọi đệ quy để lặp tiếp
    if (cat.children && cat.children.length > 0) {
      options = options.concat(formatCategoryOptions(cat.children, level + 1));
    }
  });
  
  return options;
};

export default function AddProductForm({ onSuccess, onCancel }) {
  // 2. GỌI HOOKS
  const { mutate: createProduct, isPending } = useSaveProduct();
  const { data: brands = [], isLoading: isBrandsLoading } = useGetBrands();
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategories();

  // Khai báo các Ref để điều khiển thẻ Select
  const select1Ref = useRef(null);
  const select2Ref = useRef(null);
  const select3Ref = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    brandId: null,
    categoryId: null,
    warrantyPeriod: "",
    description: "",
    option1Name: "",
    option2Name: "",
    option3Name: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.brandId || !formData.categoryId) {
      return message.error("Vui lòng chọn Thương hiệu và Danh mục!");
    }

    // 3. SỬ DỤNG MUTATE THAY CHO ONSUBMITAPI
    createProduct({ data: formData }, {
      onSuccess: () => {
        message.success("Thêm sản phẩm thành công!");
        onSuccess();
      },
      onError: (error) => {
        const errData = error.response?.data;
        message.error(errData?.messages || errData?.message || "Thêm sản phẩm thất bại!");
      }
    });
  };

  const handleOptionChange = (value, key, ref) => {
    setFormData({
      ...formData,
      [key]: value[0] || "",
    });

    if (value && value.length > 0 && ref && ref.current) {
      ref.current.blur();
    }
  };

  return (
    <div className="relative mt-2">
      {/* 4. OVERLAY LOADING KHI ĐANG LƯU */}
      {isPending && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
          <Spin tip="Đang khởi tạo sản phẩm..." size="large" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* ================= LEFT ================= */}
          <div className="flex flex-col gap-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
              <h3 className="text-sm font-black text-indigo-600 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><TagOutlined className="text-lg" /></div>
                Thông tin cơ bản
              </h3>

              <div className="space-y-4">
                <Input
                  label="Tên sản phẩm gốc"
                  placeholder="VD: iPhone 15 Pro Max"
                  required
                  disabled={isPending}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 rounded-xl focus:ring-2 focus:ring-indigo-100"
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* SELECT THƯƠNG HIỆU (DYNAMIC) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Thương hiệu</label>
                    <Select
                      value={formData.brandId}
                      onChange={(value) => setFormData({ ...formData, brandId: value })}
                      disabled={isPending}
                      loading={isBrandsLoading}
                      className="w-full h-11 custom-select-ui"
                      placeholder="Chọn thương hiệu"
                      options={brands.map(b => ({ value: b.id, label: b.name }))}
                      showSearch
                      optionFilterProp="label"
                    />
                  </div>

                  {/* SELECT DANH MỤC (DYNAMIC) */}
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Danh mục</label>
                    <Select
                      value={formData.categoryId}
                      onChange={(value) => setFormData({ ...formData, categoryId: value })}
                      disabled={isPending}
                      loading={isCategoriesLoading}
                      className="w-full h-11 custom-select-ui"
                      placeholder="Chọn danh mục"
                      
                      // 2. GỌI HÀM VỪA TẠO VÀO ĐÂY
                      options={formatCategoryOptions(categories)} 
                      
                      showSearch
                      // 3. Sửa lại bộ lọc để tìm kiếm theo tên gốc không dính dấu gạch
                      filterOption={(input, option) =>
                        (option?.searchText ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </div>
                </div>

                <Input
                  label="Thời gian bảo hành"
                  placeholder="VD: 12 tháng chính hãng"
                  required
                  disabled={isPending}
                  value={formData.warrantyPeriod}
                  onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
                  className="h-11 rounded-xl focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex flex-col gap-5">
            {/* PRODUCT OPTIONS */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-indigo-600 flex items-center gap-2 uppercase tracking-wider m-0">
                  <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><SettingOutlined className="text-lg" /></div>
                  Phân loại sản phẩm
                </h3>
                <span className="text-[11px] text-slate-500 font-medium italic bg-slate-200/50 px-2 py-1 rounded-md">
                  Có thể chọn hoặc tự nhập
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Phân loại 1</label>
                  <Select
                    ref={select1Ref}
                    mode="tags"
                    maxCount={1}
                    allowClear
                    disabled={isPending}
                    placeholder="VD: Màu sắc"
                    value={formData.option1Name ? [formData.option1Name] : []}
                    onChange={(value) => handleOptionChange(value, "option1Name", select1Ref)}
                    options={OPTION_SUGGESTIONS}
                    className="w-full h-11 custom-select-ui"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Phân loại 2</label>
                  <Select
                    ref={select2Ref}
                    mode="tags"
                    maxCount={1}
                    allowClear
                    disabled={isPending}
                    placeholder="VD: Dung lượng"
                    value={formData.option2Name ? [formData.option2Name] : []}
                    onChange={(value) => handleOptionChange(value, "option2Name", select2Ref)}
                    options={OPTION_SUGGESTIONS}
                    className="w-full h-11 custom-select-ui"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Phân loại 3</label>
                  <Select
                    ref={select3Ref}
                    mode="tags"
                    maxCount={1}
                    allowClear
                    disabled={isPending}
                    placeholder="VD: Phiên bản"
                    value={formData.option3Name ? [formData.option3Name] : []}
                    onChange={(value) => handleOptionChange(value, "option3Name", select3Ref)}
                    options={OPTION_SUGGESTIONS}
                    className="w-full h-11 custom-select-ui"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col">
              <h3 className="text-sm font-black text-indigo-600 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><FileTextOutlined className="text-lg" /></div>
                Mô tả sản phẩm
              </h3>

              <textarea
                className="w-full flex-1 min-h-[100px] p-4 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all"
                placeholder="Nhập mô tả chi tiết sản phẩm..."
                disabled={isPending}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-2 mt-2 border-t border-slate-100">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-600 px-6 py-2.5 font-bold transition-all disabled:opacity-50"
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            loading={isPending}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl shadow-lg shadow-indigo-200 font-bold transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            Lưu Sản Phẩm
          </Button>
        </div>
      </form>
    </div>
  );
}