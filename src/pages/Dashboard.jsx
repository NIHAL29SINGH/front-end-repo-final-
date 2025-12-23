import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { AppContext, initialInvoiceData } from "../context/AppContext.jsx";
import { getAllInvoices } from "../service/invoiceService.js";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

// ✅ Helper function for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // safe fallback
  const date = new Date(dateString);

  // Format: DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  const { baseURL, setInvoiceData, setSelectedTemplate, setInvoiceTitle } =
    useContext(AppContext);

  const { getToken } = useAuth();

  // ✅ Fetch invoices on mount
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = await getToken();
        const response = await getAllInvoices(baseURL, token);
        setInvoices(response.data || []);
      } catch (error) {
        console.error("Failed to load invoices", error);
        toast.error("Something went wrong. Unable to load invoices");
      }
    };
    fetchInvoices();
  }, [baseURL, getToken]);

  // ✅ Open invoice preview
  const handleViewClick = (invoice) => {
    setInvoiceData(invoice);
    setSelectedTemplate(invoice.template || "template1");
    setInvoiceTitle(invoice.title || "View Invoice");
    navigate("/preview");
  };

  // ✅ Create new invoice
  const handleCreateNew = () => {
    setInvoiceTitle("Create Invoice");
    setSelectedTemplate("template1");
    setInvoiceData(initialInvoiceData);
    navigate("/generate");
  };

  return (
    <div className="container py-5">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
        {/* Create New Invoice Card */}
        <div className="col">
          <div
            className="card h-100 d-flex justify-content-center align-items-center border border-2 border-light shadow-sm"
            style={{ cursor: "pointer", minHeight: "270px" }}
            onClick={handleCreateNew}
          >
            <Plus size={48} />
            <p className="mt-3 fw-medium">Create New Invoice</p>
          </div>
        </div>

        {/* Render Existing Invoices */}
        {invoices.length > 0 ? (
          invoices.map((invoice, idx) => (
            <div key={idx} className="col">
              <div
                className="card h-100 shadow-sm"
                style={{ cursor: "pointer", minHeight: "270px" }}
                onClick={() => handleViewClick(invoice)}
              >
                {invoice.thumbnailUrl && (
                  <img
                    src={invoice.thumbnailUrl}
                    className="card-img-top"
                    alt="Invoice Thumbnail"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h6 className="card-title mb-1">{invoice.title || "Untitled"}</h6>
                  <small className="text-muted">
                    Last Updated: {formatDate(invoice.lastUpdatedAt)}
                  </small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted mt-4">
            No invoices found. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
