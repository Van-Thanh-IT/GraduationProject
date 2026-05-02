import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToHash from "./ScrollToHash";
import FloatingChatBot from "@/modules/client/chat/FloatingChatBot";
import CustomerChatWidget from "@/modules/client/chat/CustomerChatWidget";

const ClientLayout = () => {
  return (
    <div>
      <Header />
      <ScrollToHash />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <FloatingChatBot/>
      <CustomerChatWidget/>
    </div>
  );
};

export default ClientLayout;
