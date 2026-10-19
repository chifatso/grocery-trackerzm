import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useEffect } from "react";
import { apiRequest } from "./api/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import "./App.css";
import MainLayout from "./MainLayout";
import SpendingHistoryPage from "./pages/SpendingHistoryPage";
import BudgetSpendingPage from "./pages/BudgetSpendingPage";
import GroceryListsPage from "./pages/GroceryListsPage";

function App() {

  useEffect(() => {

    // Test communication with our Django API.
    async function testAPI() {

      try {
        const data = await apiRequest(
          "/grocery-lists/"
        );

        console.log("Grocery lists:", data);
      } catch (error) {

        console.error(
          "API error:",
          error
        );
      }
    }

    testAPI();

  }, []);


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

        
      </Routes>

    </BrowserRouter>
  );
}

export default App;