import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ClientLayout from '@/layouts/client/ClientLayout';
import AdminLayout from '@/layouts/admin/AdminLayout';

import AuthLayout from '@/modules/client/auth/AuthLayout';
import LoginForm from '@/modules/client/auth/components/LoginForm';
import Register from '@/modules/client/auth/components/Register';
import PasswordReset from '@/modules/client/auth/components/PasswordReset';

import HomePage from '@/modules/client/home/HomePage';
import AboutPage from '@/modules/client/home/AboutPage';
import WarrantyPage from '@/modules/client/home/WarrantyPage';
import ProductPage from '@/modules/client/products/ProductPage';
import ProductDetailPage from '@/modules/client/products/ProductDetailPage';
import ReviewListPage from '@/modules/client/products/ReviewListPage';
import CartPage from '@/modules/client/cart/CartPage';
import CheckoutPage from '@/modules/client/checkout/CheckoutPage';
import UserProfile from '@/modules/client/profile/UserProfile';
import AddressPage from '@/modules/client/address/AddressPage';
import OrderHistoryPage from '@/modules/client/order/OrderHistoryPage';
import OrderDetailPage from '@/modules/client/order/OrderDetailPage';
import ArticlePage from '@/modules/client/home/ArtilcePage';
import ArticleDetailPage from '@/modules/client/home/ArticleDetailPage';
import PaymentResult from '@/modules/client/checkout/PaymentResult';

import Dashboard from '@/modules/admin/dashboard/Dashboard';
import UserManagement from '@/modules/admin/users/UserManagement';
import BrandManagement from '../modules/admin/brand/BrandManagement';
import CategoryManagement from '../modules/admin/category/CategoryManagement';
import AttributeManagement from '../modules/admin/attribute/AttributeManagement';
import ProductManagement from '@/modules/admin/products/ProductManagement';
import ReviewManagement from '@/modules/admin/review/ReviewManagement';
import OrderManagement from '@/modules/admin/orders/OrderManagement';
import VoucherManagement from '../modules/admin/vouchers/VoucherManagement';
import FlashSaleManagement from '@/modules/admin/flashSales/FashSaleManagement';
import InventoryManagement from '@/modules/admin/inventory/InventoryManagement';
import AdminSettings from '@/modules/admin/setting/Setting';
import BannerManagement from '@/modules/admin/banners/BannerManagement';
import ArticleManagement from '@/modules/admin/article/ArticleManagement';
import ChatManagement from '@/modules/admin/chat/ChatManagement';
import ProtectedRoute from './ProtectedRoute';


const AppRoute = () => {
    return (
       <Router>
        <Routes>

            <Route element={<AuthLayout/>}>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<PasswordReset/>}/>
            </Route>
            
            <Route path="/" element={<ClientLayout/>}>
                <Route index element={<HomePage/>}/>
                <Route path='abouts' element={<AboutPage/>}/>
                <Route path='warranty' element={<WarrantyPage/>}/>
                <Route path="products" element={<ProductPage/>}/>
                <Route path="cart" element={<CartPage/>}/>
                <Route path='checkout' element={<CheckoutPage/>}/>
                <Route path='product/:slug' element={<ProductDetailPage/>}/>
                <Route path="/product/:id/reviews" element={<ReviewListPage />} />
                <Route path="/articles" element={<ArticlePage />} />
                <Route path="/articles/:slug" element={<ArticleDetailPage />} />
                <Route path="payment/success" element={<PaymentResult />} />
                <Route path="payment/failed" element={<PaymentResult />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/user/profile" element={<UserProfile/>}/> 
                    <Route path="/user/orders" element={<OrderHistoryPage/>}/> 
                    <Route path="/user/orders/:orderId" element={<OrderDetailPage />} />
                    <Route path='/user/address' element={<AddressPage/>}/>
                </Route>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}/>}>
                <Route path="/admin" element={<AdminLayout/>}>
                    <Route index element={<Dashboard/>}/>
                    <Route path="products" element={<ProductManagement/>}/>
                     <Route path="reviews" element={<ReviewManagement/>}/>
                    <Route path="orders" element={<OrderManagement/>}/>
                    <Route path="inventory" element={<InventoryManagement/>}/>
                    <Route path='articles' element={<ArticleManagement/>}/>
                    <Route path='chat' element={<ChatManagement/>}/>

                    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]}/>}>
                        <Route path='users' element={<UserManagement/>}/>
                        <Route path='brand' element={<BrandManagement/>}/>  
                        <Route path='category' element={<CategoryManagement/>}/>
                        <Route path="attribute" element={<AttributeManagement/>}/>
                        <Route path="vouchers" element={<VoucherManagement/>}/>
                        <Route path="flash-sale" element={<FlashSaleManagement/>}/>
                        <Route path='banners' element={<BannerManagement/>}/>
                        <Route path="settings" element={<AdminSettings/>}/>
                    </Route>

                </Route>
            </Route>

        </Routes>
       </Router>
    );
}

export default AppRoute;