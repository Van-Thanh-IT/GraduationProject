import React, { useState, useEffect, useRef } from 'react';
import { message, Select, Spin } from 'antd';
import { TagOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ProductService } from '@/services/product.service';

// 1. IMPORT HOOKS LẤY DỮ LIỆU
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

// 2. HÀM BẺ PHẲNG CÂY DANH MỤC ĐỂ HIỂN THỊ ĐẸP TRONG SELECT
const formatCategoryOptions = (categoriesArray, level = 0) => {
  let options = [];
  categoriesArray.forEach((cat) => {
    const prefix = level > 0 ? '— '.repeat(level) : '';
    options.push({
      value: cat.id,
      label: `${prefix}${cat.name}`,
      searchText: cat.name 
    });
    if (cat.children && cat.children.length > 0) {
      options = options.concat(formatCategoryOptions(cat.children, level + 1));
    }
  });
  return options;
};

export default function BasicInfoForm({ initialData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  
  // 3. GỌI HOOKS ĐỂ LẤY DANH SÁCH THƯƠNG HIỆU & DANH MỤC
  const { data: brands = [], isLoading: isBrandsLoading } = useGetBrands();
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategories();

  // Refs cho các thẻ Select Phân loại
  const select1Ref = useRef(null);
  const select2Ref = useRef(null);
  const select3Ref = useRef(null);

  const [formData, setFormData] = useState({
    name: '', brandId: null, categoryId: null, warrantyPeriod: '', description: '',
    option1Name: '', option2Name: '', option3Name: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '', 
        brandId: initialData.brandId || null,
        categoryId: initialData.categoryId || null, 
        warrantyPeriod: initialData.warrantyPeriod || '',
        description: initialData.description || '', 
        option1Name: initialData.option1Name || '',
        option2Name: initialData.option2Name || '', 
        option3Name: initialData.option3Name || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ProductService.updateProduct(initialData.id, formData);
      message.success("Cập nhật thông tin cơ bản thành công!");
      if(onSuccess) onSuccess();
    } catch (error) {
      message.error(error.response?.data?.messages || error.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (value, key, ref) => {
    setFormData({ ...formData, [key]: value[0] || "" });
    if (value && value.length > 0 && ref && ref.current) {
      ref.current.blur();
    }
  };

  return (
    <div className="relative">
      {/* OVERLAY LOADING */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
          <Spin tip="Đang lưu thông tin..." size="large" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* ================= CỘT TRÁI: THÔNG TIN CƠ BẢN ================= */}
          <div className="flex flex-col gap-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
              <h3 className="text-sm font-black text-indigo-600 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><TagOutlined className="text-lg" /></div>
                Thông tin cơ bản
              </h3>

              <div className="space-y-4">
                <Input 
                  label="Tên sản phẩm gốc" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="h-11 rounded-xl focus:ring-2 focus:ring-indigo-100"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  {/* SELECT THƯƠNG HIỆU */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Thương hiệu</label>
                    <Select 
                      value={formData.brandId} 
                      onChange={v => setFormData({...formData, brandId: v})} 
                      loading={isBrandsLoading}
                      className="w-full h-11 custom-select-ui" 
                      placeholder="Chọn thương hiệu"
                      options={brands.map(b => ({ value: b.id, label: b.name }))}
                      showSearch
                      optionFilterProp="label"
                    />
                  </div>
                  
                  {/* SELECT DANH MỤC (CÓ ĐỆ QUY CHA CON) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Danh mục</label>
                    <Select 
                      value={formData.categoryId} 
                      onChange={v => setFormData({...formData, categoryId: v})} 
                      loading={isCategoriesLoading}
                      className="w-full h-11 custom-select-ui" 
                      placeholder="Chọn danh mục"
                      options={formatCategoryOptions(categories)}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.searchText ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </div>
                </div>

                <Input 
                  label="Thời gian bảo hành" 
                  required 
                  value={formData.warrantyPeriod} 
                  onChange={e => setFormData({...formData, warrantyPeriod: e.target.value})} 
                  className="h-11 rounded-xl focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI: PHÂN LOẠI & MÔ TẢ ================= */}
          <div className="flex flex-col gap-5">
            
            {/* THIẾT LẬP PHÂN LOẠI */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-indigo-600 flex items-center gap-2 uppercase tracking-wider m-0">
                  <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><SettingOutlined className="text-lg" /></div>
                  Phân loại sản phẩm
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-slate-700">Phân loại 1</label>
                  <Select
                    ref={select1Ref} mode="tags" maxCount={1} allowClear
                    placeholder="VD: Màu"
                    value={formData.option1Name ? [formData.option1Name] : []}
                    onChange={(val) => handleOptionChange(val, "option1Name", select1Ref)}
                    options={OPTION_SUGGESTIONS}
                    className="w-full h-10 custom-select-ui"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-slate-700">Phân loại 2</label>
                  <Select
                    ref={select2Ref} mode="tags" maxCount={1} allowClear
                    placeholder="VD: Size"
                    value={formData.option2Name ? [formData.option2Name] : []}
                    onChange={(val) => handleOptionChange(val, "option2Name", select2Ref)}
                    options={OPTION_SUGGESTIONS}
                    className="w-full h-10 custom-select-ui"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-slate-700">Phân loại 3</label>
                  <Select
                    ref={select3Ref} mode="tags" maxCount={1} allowClear
                    placeholder="VD: Ram"
                    value={formData.option3Name ? [formData.option3Name] : []}
                    onChange={(val) => handleOptionChange(val, "option3Name", select3Ref)}
                    options={OPTION_SUGGESTIONS}
                    className="w-full h-10 custom-select-ui"
                  />
                </div>
              </div>
            </div>

            {/* MÔ TẢ SẢN PHẨM */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col">
              <h3 className="text-sm font-black text-indigo-600 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><FileTextOutlined className="text-lg" /></div>
                Mô tả sản phẩm
              </h3>
              <textarea 
                className="w-full flex-1 min-h-[120px] p-4 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all"
                placeholder="Nhập mô tả chi tiết sản phẩm..."
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* ================= NÚT LƯU ================= */}
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            loading={loading} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl shadow-lg shadow-indigo-200 font-bold transition-all active:scale-95"
          >
            Lưu Thông Tin Cơ Bản
          </Button>
        </div>
      </form>
    </div>
  );
}