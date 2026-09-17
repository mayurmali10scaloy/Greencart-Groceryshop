import GetProductHome from "./GetProductHome";

function Home() {
  return (
    <div>

      {/* ── Hero Carousel ── */}
      <div
        id="carouselExample"
        className="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="3500"
        style={{ marginTop: "0" }}
      >
        <div className="carousel-indicators">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              data-bs-target="#carouselExample"
              data-bs-slide-to={i}
              className={i === 0 ? "active" : ""}
            />
          ))}
        </div>

        <div className="carousel-inner" style={{ height: "460px" }}>
          {[
            { src: "/Assets/images/Banner1.jpg", label: "Fresh Arrivals", sub: "Hand-picked organic produce" },
            { src: "/Assets/images/Banner2.jpg", label: "Farm to Table", sub: "Delivered within 24 hours" },
            { src: "/Assets/images/Banner3.jpg", label: "Best Sellers", sub: "Loved by 50,000+ customers" },
          ].map(({ src, label, sub }, i) => (
            <div key={i} className={`carousel-item${i === 0 ? " active" : ""}`} style={{ height: "460px" }}>
              <div style={{ position: "relative", height: "100%" }}>
                <img
                  src={src}
                  alt={label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
                  display: "flex", alignItems: "center", padding: "0 60px"
                }}>
                  <div>
                    <span style={{
                      display: "inline-block",
                      background: "#22c55e",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      marginBottom: "12px"
                    }}>🌿 New Season</span>
                    <h2 style={{ color: "#fff", fontSize: "36px", fontWeight: "800", margin: "0 0 8px" }}>{label}</h2>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", margin: "0 0 20px" }}>{sub}</p>
                    <button style={{
                      background: "linear-gradient(135deg, #22c55e, #15803d)",
                      border: "none", color: "#fff",
                      padding: "11px 26px",
                      borderRadius: "8px", fontWeight: "700", fontSize: "14px",
                      cursor: "pointer", boxShadow: "0 6px 20px rgba(21,128,61,0.4)"
                    }}>Shop Now →</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" />
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon" />
        </button>
      </div>

      {/* ── Trust Strip ── */}
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        borderTop: "1px solid #bbf7d0",
        borderBottom: "1px solid #bbf7d0",
        padding: "14px 0",
        marginTop: "20px"
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 24px",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
        }}>
          {[
            { icon: "🚚", label: "Free Delivery", sub: "Orders above ₹499" },
            { icon: "🌱", label: "100% Organic", sub: "Certified fresh" },
            { icon: "↩️", label: "Easy Returns", sub: "7-day policy" },
            { icon: "🔒", label: "Secure Payment", sub: "100% safe checkout" },
          ].map(({ icon, label, sub }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>{icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: "700", fontSize: "13px", color: "#15803d" }}>{label}</p>
                <p style={{ margin: 0, fontSize: "11.5px", color: "#6b7280" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GetProductHome />

    </div>
  )
}

export default Home
