import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Assets/style/AddProduct.css";
import { Link } from "react-router-dom";
import api from "../../../Api/axios";

function AddProduct({ closeModal, refreshProducts, showMsg }) {
  const nav = useNavigate();


  const categories = [
    "Fruits",
    "Vegetables",
    "Dairy",
    "Bakery",
    "Grains",
    "Pulses",
    "Oil & Ghee",
    "Spices",
    "Snacks",
    "Beverages",
    "Personal Care",
    "Household",
    "Grocery"
  ];

  const [errors, setErrors] = useState({});

  const setCatagory = (field) => (e) => {
    setProduct({ ...product, [field]: e.target.value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const emptyForm = {
    productName: "",
    description: "",
    category: "",
    brand: "",
    quantity: "",
    price: "",
    discountPercent: "",
    stock: "",
    ratings: "",  // ✅ optional rating (0–5)
    image: "", // ✅ stores image URL (from local upload or external link)

  };

  const [product, setProduct] = useState(emptyForm);
  const [dragOver, setDragOver] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [filename, setFileName] = useState("");
  const [converting, setConverting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const set = (key) => (e) => {
    setProduct({ ...product, [key]: e.target.value });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!product.productName || !product.productName.trim()) {
      newErrors.productName = "Product Name is required";
    }
    if (!product.category || !product.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (product.price === "" || product.price === null || product.price === undefined) {
      newErrors.price = "Price is required";
    } else if (Number(product.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }
    if (!product.quantity || !product.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    }
    if (product.stock === "" || product.stock === null || product.stock === undefined) {
      newErrors.stock = "Stock is required";
    } else if (Number(product.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Clear ── */
  const handleClear = () => {
    setProduct(emptyForm);
    setSelectedFile(null);
    setFileName("");
    setUploadErr("");
    setErrors({});
  };  /* ── Save — image is uploaded via Multer, submitted as FormData ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();
    formData.append("productName", product.productName);
    formData.append("description", product.description || "");
    formData.append("category", product.category);
    formData.append("brand", product.brand || "");
    formData.append("quantity", product.quantity);
    formData.append("price", product.price);
    formData.append("discountPercent", product.discountPercent || 0);
    formData.append("stock", product.stock);

    if (product.ratings !== "" && product.ratings !== null && product.ratings !== undefined) {
      formData.append("ratings", product.ratings);
    }

    if (selectedFile) {
      formData.append("productImg", selectedFile);
    }

    try {
      setConverting(true);
      await api.post("/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (refreshProducts) {
        refreshProducts();
        showMsg("Product added successfully!", "add");
        closeModal();
      } else {
        // If used as a page (via Route), navigate back with state
        nav("/AdminPanel/Products", {
          state: { msg: "Product added successfully!", type: "add" },
        });
      }
    } catch (err) {
      console.error("Add Product Error:", err.message);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to add product";
      alert(errorMsg);
    } finally {
      setConverting(false);
    }
  };

  // For number fields: keep empty string when cleared so field stays blank,
  // otherwise convert to number (ratings can be left empty → omitted on submit)
  const setNum = (key) => (e) => {
    const raw = e.target.value;
    setProduct({ ...product, [key]: raw === "" ? "" : Number(raw) });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const onFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setUploadErr("Only JPG, PNG, WEBP, GIF allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadErr("File must be under 2MB.");
      return;
    }

    setUploadErr("");
    setSelectedFile(file);
    setFileName(file.name);
    setProduct((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setProduct((p) => ({ ...p, image: "" }));
    setSelectedFile(null);
    setFileName("");
    setUploadErr("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Price calc ── */
  const finalPrice = product.price
    ? Math.round(product.price - (product.price * (product.discountPercent || 0)) / 100) : 0;
  const savedAmount = product.price && product.discountPercent
    ? Math.round((product.price * product.discountPercent) / 100) : 0;


  return (
    <div className="modal-bg">
      <form className="modal-container" onSubmit={handleSubmit} noValidate>

        {/* ── HEADER ── */}
        <div className="modal-header-bar">
          <div className="modal-header-left">
            <div className="modal-header-icon">
              <i className="fa-solid fa-box"></i>
            </div>
            <div>
              <h3 className="modal-title">Add New Product</h3>
              <p className="modal-subtitle">Fill in the details below to list a product</p>
            </div>
          </div>
          <Link
            className="modal-close-btn"
            onClick={closeModal ? closeModal : () => nav(-1)}
            to={closeModal ? "/AdminPanel/Products" : "#"}
            title="Close"
            style={{ textDecoration: "none" }}
          >
            <i className="fa-solid fa-xmark"></i>
          </Link>
        </div>

        {/* ── BODY ── */}
        <div className="modal-body-wrap">
          <div className="modal-3-col-body">

            {/* Column 1: Basic Info */}
            <div className="modal-col-1">
              <p className="form-section-label">Basic Information</p>
              <div className="form-grid single">
                <div className="field-group">
                  <label className="field-label">Product Name <span className="required-star">*</span></label>
                  <input type="text" className={`field-input ${errors.productName ? "has-error" : ""}`} placeholder="Enter product name"
                    value={product.productName} onChange={set("productName")} />
                  {errors.productName && <span className="error-msg"><i className="fa-solid fa-circle-exclamation"></i> {errors.productName}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">
                    Category <span className="required-star">*</span>
                  </label>

                  <select
                    className={`field-input ${errors.category ? "has-error" : ""}`}
                    value={product.category}
                    onChange={setCatagory("category")}
                  >
                    <option value="">-- Select Category --</option>

                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="error-msg"><i className="fa-solid fa-circle-exclamation"></i> {errors.category}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">Brand</label>
                  <input type="text" className="field-input" placeholder="Enter brand (optional)"
                    value={product.brand} onChange={set("brand")} />
                </div>

                <div className="field-group">
                  <label className="field-label">Description</label>
                  <textarea className="field-input field-textarea" rows={3}
                    placeholder="Enter product description (optional)"
                    value={product.description} onChange={set("description")} />
                </div>
              </div>
            </div>

            {/* Column 2: Pricing & Inventory */}
            <div className="modal-col-2">
              <p className="form-section-label">Pricing &amp; Inventory</p>
              <div className="form-grid">
                <div className="field-group">
                  <label className="field-label">Price (₹) <span className="required-star">*</span></label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">₹</span>
                    <input type="number" className={`field-input has-prefix ${errors.price ? "has-error" : ""}`} placeholder="0.00" min="0"
                      value={product.price} onChange={setNum("price")} />
                  </div>
                  {errors.price && <span className="error-msg"><i className="fa-solid fa-circle-exclamation"></i> {errors.price}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">Discount (%)</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">%</span>
                    <input type="number" className="field-input has-prefix" placeholder="0" min="0" max="100"
                      value={product.discountPercent} onChange={setNum("discountPercent")} />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Quantity <span className="required-star">*</span></label>
                  <input type="text" className={`field-input ${errors.quantity ? "has-error" : ""}`} placeholder="e.g. 500ml, 1kg"
                    value={product.quantity}
                    onChange={(e) => {
                      setProduct({ ...product, quantity: String(e.target.value) });
                      if (errors.quantity) {
                        setErrors((prev) => ({ ...prev, quantity: "" }));
                      }
                    }} />
                  {errors.quantity && <span className="error-msg"><i className="fa-solid fa-circle-exclamation"></i> {errors.quantity}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">Stock Available <span className="required-star">*</span></label>
                  <input type="number" className={`field-input ${errors.stock ? "has-error" : ""}`} placeholder="0" min="0"
                    value={product.stock} onChange={setNum("stock")} />
                  {errors.stock && <span className="error-msg"><i className="fa-solid fa-circle-exclamation"></i> {errors.stock}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">Rating (0–5)</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix"><i className="fa-solid fa-star"></i></span>
                    <input type="number" className="field-input has-prefix" placeholder="0" min="0" max="5" step="0.1"
                      value={product.ratings} onChange={setNum("ratings")} />
                  </div>
                </div>
              </div>

              {product.price > 0 && (
                <div className="calc-preview">
                  <div className="calc-row">
                    <span className="calc-label">Final Price</span>
                    <span className="calc-value">₹{finalPrice}</span>
                  </div>
                  {savedAmount > 0 && (
                    <div className="calc-row">
                      <span className="calc-label">You Save</span>
                      <span className="calc-save">₹{savedAmount}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Column 3: Image */}
            <div className="modal-col-3">
              <p className="form-section-label">Product Image</p>

              <div className="field-group">
                <div
                  className={`img-dropzone ${dragOver ? "drag-active" : ""} ${product.image ? "has-preview" : ""}`}
                  onClick={() => !converting && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      onFileInput({ target: { files: [file] } });
                    }
                  }}
                >
                  {converting && (
                    <div className="img-drop-empty">
                      <div className="img-drop-icon uploading">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      </div>
                      <p className="img-drop-text">Reading...</p>
                    </div>
                  )}
                  {!converting && product.image && (
                    <div className="img-drop-preview">
                      <img src={product.image} alt="preview" className="img-drop-thumb" />
                      <div className="img-drop-info">
                        <span className="img-drop-name">
                          <i className="fa-solid fa-circle-check" style={{ color: '#10b981', marginRight: 6 }}></i>
                          {filename || "Ready"}
                        </span>
                      </div>
                      <button type="button" className="img-remove-btn" onClick={handleRemove}>
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  )}
                  {!converting && !product.image && (
                    <div className="img-drop-empty">
                      <div className="img-drop-icon">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                      </div>
                      <p className="img-drop-text">Drop image here or <span className="img-drop-link">browse</span></p>
                      <p className="img-drop-hint">Supports: JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>

                {uploadErr && (
                  <div className="upload-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {uploadErr}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onFileInput}
                />
              </div>
            </div>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="modal-footer-bar">
          <span className="modal-footer-hint">
            <i className="fa-solid fa-circle-info"></i>
            Fields marked <span className="required-star">*</span> are required
          </span>
          <div className="modal-footer-actions">
            <button type="button" className="btn-clear" onClick={handleClear}>
              <i className="fa-solid fa-rotate-left"></i> Clear
            </button>
            <button type="submit" className="btn-save" disabled={converting}>
              {converting
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</>
                : "Save Product"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

export default AddProduct;