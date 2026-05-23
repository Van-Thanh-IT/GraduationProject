
import { ToastContainer } from "react-toastify"
import AppRoute from "./routes/AppRoute"
import { useNavigate } from "react-router-dom";
import { setNavigator } from "@/utils/navigate";
function App() {
    const nav = useNavigate();
    setNavigator(nav);
  return (<>
    <ToastContainer
    position="top-center"
    autoClose={3000} // mặc định 3s
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    // theme="dark"
    theme="colored"
  />
    <AppRoute/>
  </>)
}

export default App
