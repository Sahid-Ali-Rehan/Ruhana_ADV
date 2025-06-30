// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import LoginForm from "./Components/Auth/LoginForm";
// import SignupForm from "./Components/Auth/SignupForm";
// import AdminPage from "./Pages/AdminPages/AdminPage";
// import PrivateRoute from "./utils/PrivateRoute";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import HomePage from "./Pages/Home/HomePage";
// import AddProduct from "./Components/AdminComponents/AddProduct";
// import AllProducts from "./Components/AdminComponents/AllProducts";
// import EditProduct from "./Components/AdminComponents/EditProduct";
// import AllProductsClient from "./Pages/AllProducts/AllProductsClient";
// import SingleProductList from "./Components/SingleProductList/SingleProductList";
// import Cart from "./Components/Cart/Cart";
// import Logout from "./Components/Auth/Logout";
// import AllUsers from "./Components/AdminComponents/AllUsers";
// import Checkout from "./Components/Checkout/Checkout";
// import Success from "./Components/Message/Success";
// import AllOrders from "./Components/AdminComponents/AllOrders";
// import MyProfile from "./Components/MyProfile/MyProfile";
// import Wishlist from "./Components/Wishlist/Wishlist";
// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';
// import NotFoundPage from "./Components/NotFound/404";

// const stripePromise = loadStripe('pk_test_51RSv6HQu2XY94ocpyNXlGLygbvTCIBSFrODrGTvAtAxnQQM0bFDNpC36pJ4EH9cb1GJEKSHigVz6xVWZFeHMZJSV001CPevlli');
// function App() {
//   return (
//     <>
//       <ToastContainer />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<LoginForm />} />
//           <Route path="/signup" element={<SignupForm />} />
//           <Route path="/products" element={<AllProductsClient />} />
//           <Route path="/products/single/:id" element={<SingleProductList />}/>
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/logout" element={<Logout />} />
          
// <Route 
//   path="/checkout" 
//   element={
    
//       <Elements stripe={stripePromise}>
//         <Checkout />
//       </Elements>
   
//   }
// />
//           <Route path="/success" element={<Success />} />
//           <Route path="/my-profile" element={<MyProfile />} />
//           <Route path="/wish-list" element={<Wishlist/>} />






//           <Route
//             path="/admin"
//             element={
//               <PrivateRoute role="admin">
//                 <AdminPage />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/admin/add-products"
//             element={
//               <PrivateRoute role="admin">
//                 <AddProduct />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/admin/products"
//             element={
//               <PrivateRoute role="admin">
//                 <AllProducts />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/admin/users"
//             element={
//               <PrivateRoute role="admin">
//                 <AllUsers />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/admin/orders"
//             element={
//               <PrivateRoute role="admin">
//                 <AllOrders />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/edit-product/:productId"
//             element={
//               <PrivateRoute role="admin">
//                 <EditProduct/>
//               </PrivateRoute>
//             }
//           />
//         <Route path="*" element={<NotFoundPage />} />

//         </Routes>

//       </BrowserRouter>
//     </>
//   );
// }

// export default App;











import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/Home/HomePage";
import NotFoundPage from "./Components/NotFound/404";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✂️ Commented out until needed
// import LoginForm from "./Components/Auth/LoginForm";
// import SignupForm from "./Components/Auth/SignupForm";
// import AdminPage from "./Pages/AdminPages/AdminPage";
// import PrivateRoute from "./utils/PrivateRoute";
// import AddProduct from "./Components/AdminComponents/AddProduct";
// import AllProducts from "./Components/AdminComponents/AllProducts";
// import EditProduct from "./Components/AdminComponents/EditProduct";
// import AllProductsClient from "./Pages/AllProducts/AllProductsClient";
// import SingleProductList from "./Components/SingleProductList/SingleProductList";
// import Cart from "./Components/Cart/Cart";
// import Logout from "./Components/Auth/Logout";
// import AllUsers from "./Components/AdminComponents/AllUsers";
// import Checkout from "./Components/Checkout/Checkout";
// import Success from "./Components/Message/Success";
// import MyProfile from "./Components/MyProfile/MyProfile";
// import Wishlist from "./Components/Wishlist/Wishlist";
// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe('pk_test_...');

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* 🟡 Other routes are temporarily disabled, enable them later when needed */}
          {/* <Route path="/login" element={<LoginForm />} /> */}
          {/* <Route path="/signup" element={<SignupForm />} /> */}
          {/* <Route path="/products" element={<AllProductsClient />} /> */}
          {/* <Route path="/products/single/:id" element={<SingleProductList />} /> */}
          {/* <Route path="/cart" element={<Cart />} /> */}
          {/* <Route path="/logout" element={<Logout />} /> */}
          {/* <Route 
            path="/checkout" 
            element={
              <Elements stripe={stripePromise}>
                <Checkout />
              </Elements>
            } 
          /> */}
          {/* <Route path="/success" element={<Success />} /> */}
          {/* <Route path="/my-profile" element={<MyProfile />} /> */}
          {/* <Route path="/wish-list" element={<Wishlist />} /> */}
          {/* <Route path="/admin" element={<PrivateRoute role="admin"><AdminPage /></PrivateRoute>} /> */}
          {/* <Route path="/admin/add-products" element={<PrivateRoute role="admin"><AddProduct /></PrivateRoute>} /> */}
          {/* <Route path="/admin/products" element={<PrivateRoute role="admin"><AllProducts /></PrivateRoute>} /> */}
          {/* <Route path="/admin/users" element={<PrivateRoute role="admin"><AllUsers /></PrivateRoute>} /> */}
          {/* <Route path="/admin/orders" element={<PrivateRoute role="admin"><AllOrders /></PrivateRoute>} /> */}
          {/* <Route path="/edit-product/:productId" element={<PrivateRoute role="admin"><EditProduct /></PrivateRoute>} /> */}
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

