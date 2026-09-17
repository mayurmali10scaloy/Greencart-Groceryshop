import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent!");
  };

  return (
    <div className="container-fluid p-5 bg-light">
      <div className="row shadow rounded overflow-hidden">
        {/* Left Form */}
        <div className="col-md-6 bg-white p-5">
          <h2 className="text-center text-success mb-2 fw-bold">
            How Can We Help You Today?
          </h2>
          <p className="text-center fs-4 mb-4">Leave us a message</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control shadow-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control shadow-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="form-control shadow-sm"
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-success px-4 py-2 w-100">
              SUBMIT
            </button>
          </form>
        </div>

        {/* Right Map */}
        <div className="col-md-6 p-0">
          <iframe
            title="Google Map - India"
            width="100%"
            height="100%"
            className="map-frame"
            src="https://maps.google.com/maps?q=India&t=&z=5&ie=UTF8&iwloc=&output=embed"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}