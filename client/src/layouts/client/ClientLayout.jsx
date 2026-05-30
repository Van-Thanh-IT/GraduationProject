import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToHash from "./ScrollToHash";
import FloatingChatBot from "@/modules/client/chat/FloatingChatBot";
import CustomerChatWidget from "@/modules/client/chat/CustomerChatWidget";

const ClientLayout = () => {
  // Trọng tài: null (không ai mở), 'ai' (AI đang mở), 'human' (Nhân viên đang mở)
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div>
      <Header />
      <ScrollToHash />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      
      {/* KHỐI AI CHAT: Bị ẩn đi nếu Chat Nhân viên đang mở */}
      <div className={activeChat === 'human' ? 'hidden' : 'block'}>
        <FloatingChatBot 
          isOpen={activeChat === 'ai'} 
          onOpen={() => setActiveChat('ai')} 
          onClose={() => setActiveChat(null)} 
        />
      </div>

      {/* KHỐI HUMAN CHAT: Bị ẩn đi nếu Chat AI đang mở */}
      <div className={activeChat === 'ai' ? 'hidden' : 'block'}>
        <CustomerChatWidget 
          isOpen={activeChat === 'human'} 
          onOpen={() => setActiveChat('human')} 
          onClose={() => setActiveChat(null)} 
        />
      </div>
    </div>
  );
};

export default ClientLayout;