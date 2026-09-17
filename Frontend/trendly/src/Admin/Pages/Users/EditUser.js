import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../Assets/style/AddUser.css";
import api from "../../../Api/axios";

function EditUser() {
  const { id } = useParams();
  const nav = useNavigate();

  const [user, setUser] = useState({
    userName: "",
    email: "",
    password: "",
    mobileNo: "",
    role: "user",
    profileImage: "",
    address: "",
    city: "",
    pincode: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [converting, setConverting] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [serverErr, setServerErr] = useState("");
  const fileInputRef = useRef(null);

  /* 🔹 Fetch user data by UID */
  useEffect(() => {
    api.get(`/users/${id}`)
      .then((res) => {
        const userData = res.data.data;
        setUser({
          userName: userData.userName || "",
          email: userData.email || "",
          password: "", // Don't pre-populate password for security
          mobileNo: userData.mobileNo || "",
          role: userData.role || "user",
          profileImage: userData.profileImage ? `http://localhost:5005/uploads/users/${userData.profileImage}` : "",
          address: userData.address || "",
          city: userData.city || "",
          pincode: userData.pincode || "",
          isActive: userData.isActive ?? true,
        });
        if (userData.profileImage) {
          setFileName(userData.profileImage);
        }
      })
      .catch((err) => {
        console.error("Fetch user error:", err);
        setServerErr("User not found");
      });
  }, [id]);

  /* 🔹 Input Helpers */
  const set = (key) => (e) => {
    setUser({ ...user, [key]: e.target.value });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  /* 🔹 Validation */
  const validate = () => {
    const newErrors = {};
    if (!user.userName || !user.userName.trim()) {
      newErrors.userName = "Username is required";
    }
    if (!user.email || !user.email.trim()) {
      newErrors.email = "Email Address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(user.email)) {
      newErrors.email = "Invalid email format";
    }
    if (user.password && user.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!user.mobileNo || !user.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile Number is required";
    } else if (!/^[6-9]\d{9}$/.test(user.mobileNo)) {
      newErrors.mobileNo = "Invalid mobile number (must be 10 digits starting with 6-9)";
    }
    if (user.pincode && !/^\d{6}$/.test(user.pincode)) {
      newErrors.pincode = "Pincode must be a 6 digit number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* 🔹 Image Handling */
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
    setUser((prev) => ({ ...prev, profileImage: URL.createObjectURL(file) }));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileInput({ target: { files: [file] } });
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setUser((u) => ({ ...u, profileImage: "" }));
    setSelectedFile(null);
    setFileName("");
    setUploadErr("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* 🔹 Update User */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setServerErr("");

    if (!validate()) return;

    const formData = new FormData();
    formData.append("userName", user.userName);
    formData.append("email", user.email);
    if (user.password) {
      formData.append("password", user.password);
    }
    formData.append("mobileNo", user.mobileNo);
    formData.append("role", user.role);
    formData.append("address", user.address || "");
    formData.append("city", user.city || "");
    formData.append("pincode", user.pincode || "");
    formData.append("isActive", user.isActive);

    if (selectedFile) {
      formData.append("profileImage", selectedFile);
    } else if (!user.profileImage) {
      // If user explicitly removed the image
      formData.append("profileImage", "");
    }

    try {
      setConverting(true);
      await api.put(`/users/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      nav("/AdminPanel/Users", {
        state: { msg: "User Updated Successfully!", type: "edit" },
      });
    } catch (err) {
      console.error("Update user error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Update failed";
      setServerErr(errorMsg);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="modal-bg">
      <form className="modal-container" onSubmit={handleUpdate} noValidate>

        {/* ── HEADER ── */}
        <div className="modal-header-bar">
          <div className="modal-header-left">
            <div className="modal-header-icon">
              <i className="fa-solid fa-user-pen"></i>
            </div>
            <div>
              <h3 className="modal-title">Edit User</h3>
              <p className="modal-subtitle">Modify user account and profile details</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={() => nav(-1)} title="Go Back">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="modal-body-wrap">
          <div className="modal-3-col-body">

            {/* Column 1: Account Info */}
            <div className="modal-col-1">
              <p className="form-section-label">Account Information</p>
              <div className="form-grid single">
                <div className="field-group">
                  <label className="field-label">Username <span className="required-star">*</span></label>
                  <input type="text" className={`field-input ${errors.userName ? "has-error" : ""}`} placeholder="Username"
                    value={user.userName} onChange={set("userName")} />
                  {errors.userName && (
                    <span className="error-msg">
                      <i className="fa-solid fa-circle-exclamation"></i> {errors.userName}
                    </span>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address <span className="required-star">*</span></label>
                  <input type="email" className={`field-input ${errors.email ? "has-error" : ""}`} placeholder="Email"
                    value={user.email} onChange={set("email")} />
                  {errors.email && (
                    <span className="error-msg">
                      <i className="fa-solid fa-circle-exclamation"></i> {errors.email}
                    </span>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label">New Password (Optional)</label>
                  <input type="password" className={`field-input ${errors.password ? "has-error" : ""}`} placeholder="Leave blank to keep same"
                    value={user.password} onChange={set("password")} />
                  {errors.password && (
                    <span className="error-msg">
                      <i className="fa-solid fa-circle-exclamation"></i> {errors.password}
                    </span>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label">Mobile Number <span className="required-star">*</span></label>
                  <input type="text" className={`field-input ${errors.mobileNo ? "has-error" : ""}`} placeholder="Mobile"
                    value={user.mobileNo} onChange={set("mobileNo")} />
                  {errors.mobileNo && (
                    <span className="error-msg">
                      <i className="fa-solid fa-circle-exclamation"></i> {errors.mobileNo}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Personal Details & Status */}
            <div className="modal-col-2">
              <p className="form-section-label">Personal Details &amp; Status</p>
              <div className="form-grid single">
                <div className="field-group">
                  <label className="field-label">Role</label>
                  <select className="field-input" value={user.role} onChange={set("role")}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">Account Status</label>
                  <select
                    className="field-input"
                    value={user.isActive.toString()}
                    onChange={(e) => setUser({ ...user, isActive: e.target.value === "true" })}
                  >
                    <option value="true">Active (Unbanned)</option>
                    <option value="false">Inactive (Banned)</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">Address</label>
                  <input type="text" className="field-input" placeholder="Address"
                    value={user.address} onChange={set("address")} />
                </div>

                <div className="field-group">
                  <label className="field-label">City</label>
                  <input type="text" className="field-input" placeholder="City"
                    value={user.city} onChange={set("city")} />
                </div>

                <div className="field-group">
                  <label className="field-label">Pincode</label>
                  <input type="text" className={`field-input ${errors.pincode ? "has-error" : ""}`} placeholder="Pincode"
                    value={user.pincode} onChange={set("pincode")} />
                  {errors.pincode && (
                    <span className="error-msg">
                      <i className="fa-solid fa-circle-exclamation"></i> {errors.pincode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Column 3: Profile Image */}
            <div className="modal-col-3">
              <p className="form-section-label">Profile Image</p>

              <div className="field-group">
                <div className={`img-dropzone ${dragOver ? "drag-active" : ""} ${user.profileImage ? "has-preview" : ""}`}
                  onClick={() => !converting && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}>
                  {converting && (
                    <div className="img-drop-empty">
                      <div className="img-drop-icon"><i className="fa-solid fa-spinner fa-spin"></i></div>
                      <p className="img-drop-text">Reading...</p>
                    </div>
                  )}
                  {!converting && user.profileImage && (
                    <div className="img-drop-preview">
                      <img src={user.profileImage} alt="preview" className="img-drop-thumb" />
                      <div className="img-drop-info">
                        <span className="img-drop-name">
                          <i className="fa-solid fa-circle-check" style={{ color: '#10b981', marginRight: 6 }}></i>
                          {fileName || "Ready"}
                        </span>
                      </div>
                      <button type="button" className="img-remove-btn" onClick={handleRemove}><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  )}
                  {!converting && !user.profileImage && (
                    <div className="img-drop-empty">
                      <div className="img-drop-icon"><i className="fa-solid fa-cloud-arrow-up"></i></div>
                      <p className="img-drop-text">Upload Photo</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={onFileInput} />
              </div>

              {serverErr && <div className="upload-error"><i className="fa-solid fa-triangle-exclamation"></i>{serverErr}</div>}
              {uploadErr && <div className="upload-error"><i className="fa-solid fa-triangle-exclamation"></i>{uploadErr}</div>}
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
            <button type="button" className="btn-clear" onClick={() => nav(-1)}>
              <i className="fa-solid fa-xmark"></i> Cancel
            </button>
            <button type="submit" className="btn-save" disabled={converting}>
              {converting ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</> : "Update User"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

export default EditUser;
