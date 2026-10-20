import { BrowserRouter, Routes, Route } from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import "./App.css";
import MainLayout from "./MainLayout";
import SpendingHistoryPage from "./pages/SpendingHistoryPage";
import BudgetSpendingPage from "./pages/BudgetSpendingPage";
import GroceryListsPage from "./pages/GroceryListsPage";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

function App() {

  


  return (
    <BrowserRouter>


      <Routes>

        {/* Registration page */}
        <Route
            path="/register"
            element={<Register />}
        />

        {/* Login page */}
        <Route
           path="/login"
           element={<Login />}
        />

        {/* Dashboard page */}
        <Route
           path="/dashboard"
           element={
               <ProtectedRoute>
                   <MainLayout>
                       <Dashboard />

                   </MainLayout>
                   
               </ProtectedRoute>
           }
        />
        {/* Spending History Page */}
        <Route
            path="/spending-history"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SpendingHistoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
        />

        {/* Budget & Spending Page */}
        <Route
            path="/budget-spending"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BudgetSpendingPage />
                </MainLayout>
              </ProtectedRoute>
            }
        />

        {/* Grocery Lists Page */}
        <Route 
            path="/grocery-lists"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GroceryListsPage />
                </MainLayout>
              </ProtectedRoute>
            }
        />

        <Route
            path="/reset-password/:uid/:token"
            element={<ResetPassword />}
         />

         <Route
    path="/forgot-password"
    element={<ForgotPassword />}
/>

        
      </Routes>

    </BrowserRouter>
  );
}

export default App;