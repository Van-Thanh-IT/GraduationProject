
import { ToastContainer } from "react-toastify"
import AppRoute from "./routes/AppRoute"

function App() {
  return (<>
    <ToastContainer
    position="top-center"
    autoClose={3000} 
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    theme="colored"
  />
    <AppRoute/>
  </>)
}

export default App
