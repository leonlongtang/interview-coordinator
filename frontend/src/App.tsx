import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components";
import { Dashboard, AddInterview, EditInterview } from "./pages";

/**
 * Main App component with routing setup.
 * All routes are wrapped in Layout for consistent header/footer.
 */

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddInterview />} />
          <Route path="/edit/:id" element={<EditInterview />} />
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="text-center py-12">
                <div className="text-6xl mb-4">404</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Page Not Found
                </h2>
                <p className="text-gray-600">
                  The page you're looking for doesn't exist.
                </p>
              </div>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
