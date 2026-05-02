// File: src/pages/ContactPage.jsx
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageSquare
} from 'lucide-react';

export default function ContactPage() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
    // Xử lý gọi API gửi liên hệ ở đây...
    message.success('Cảm ơn bạn! Tin nhắn đã được gửi thành công.');
    form.resetFields();
  };

  const contactMethods = [
    {
      icon: MapPin,
      title: 'Địa chỉ cửa hàng',
      description: 'Số 123 Đường Công Nghệ, Quận Cầu Giấy, TP. Hà Nội',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Phone,
      title: 'Hotline hỗ trợ',
      description: '1900 6868 (Bán hàng) \n 1900 6869 (Kỹ thuật)',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: Mail,
      title: 'Email liên hệ',
      description: 'support@techstore.vn \n partner@techstore.vn',
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      icon: Clock,
      title: 'Giờ mở cửa',
      description: 'Thứ 2 - Chủ nhật \n 08:00 AM - 22:00 PM',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-[#0B1120] pt-20 pb-32">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-6 border border-blue-400/30">
            <MessageSquare size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            TechStore luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn. Hãy để lại lời nhắn, đội ngũ tư vấn sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {contactMethods.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-5 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 font-medium whitespace-pre-line leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CỘT PHẢI: FORM LIÊN HỆ */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Gửi tin nhắn cho TechStore</h2>
            <p className="text-gray-500 mb-8">Vui lòng điền đầy đủ thông tin bên dưới, chúng tôi sẽ liên hệ lại với bạn.</p>

            <Form 
              form={form} 
              layout="vertical" 
              onFinish={onFinish}
              className="mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item 
                  name="fullName" 
                  label={<span className="font-bold text-gray-700">Họ và tên</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên của bạn' }]}
                >
                  <Input size="large" placeholder="Nguyễn Văn A" className="rounded-xl h-12" />
                </Form.Item>

                <Form.Item 
                  name="phone" 
                  label={<span className="font-bold text-gray-700">Số điện thoại</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                  ]}
                >
                  <Input size="large" placeholder="0912 345 678" className="rounded-xl h-12" />
                </Form.Item>
              </div>

              <Form.Item 
                name="email" 
                label={<span className="font-bold text-gray-700">Địa chỉ Email</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không đúng định dạng' }
                ]}
              >
                <Input size="large" placeholder="example@gmail.com" className="rounded-xl h-12" />
              </Form.Item>

              <Form.Item 
                name="subject" 
                label={<span className="font-bold text-gray-700">Chủ đề hỗ trợ</span>}
                rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
              >
                <Input size="large" placeholder="Tư vấn mua hàng, Báo lỗi sản phẩm..." className="rounded-xl h-12" />
              </Form.Item>

              <Form.Item 
                name="message" 
                label={<span className="font-bold text-gray-700">Nội dung chi tiết</span>}
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <Input.TextArea 
                  rows={5} 
                  placeholder="Mô tả chi tiết vấn đề bạn cần TechStore hỗ trợ..." 
                  className="rounded-xl p-4 resize-none"
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  className="w-full md:w-auto h-14 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-base shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Gửi tin nhắn
                </Button>
              </Form.Item>
            </Form>
          </div>

        </div>
      </section>

      {/* ================= MAP SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[400px]">
          {/* Thay đổi thuộc tính src bên dưới bằng mã nhúng Google Maps thật của cửa hàng bạn */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d930.9657409268152!2d105.77451720704842!3d21.03816848208359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454c9d9e80ad1%3A0xa8834169e964c217!2zVHLGsOG7nW5nIEPDoW4gQuG7mSBRdeG6o24gTMO9IFbEg24gSG_DoSBUaMOqIFRoYW8gRHUgTOG7i2No!5e0!3m2!1svi!2s!4v1775656854538!5m2!1svi!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0, borderRadius: '1.25rem' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
          ></iframe>
        </div>
      </section>

    </div>
  );
}