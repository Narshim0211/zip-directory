import React from "react";
import "../../styles/reportCard.css";

/**
 * HolyGrailProducts Component
 *
 * Displays top products correlated with good hair days.
 */
export default function HolyGrailProducts({ products = [] }) {
  if (!products.length) {
    return (
      <div className="rc-products-empty">
        <div className="rc-products-empty-icon">✨</div>
        <p>Log your highlight products weekly to find your holy grails!</p>
      </div>
    );
  }

  return (
    <div className="rc-products-container">
      <div className="rc-products-header">
        <h4>Holy Grail Products</h4>
        <span className="rc-products-subtitle">Your best performers</span>
      </div>

      <div className="rc-products-grid">
        {products.map((product, index) => {
          const isTop = index === 0;
          const feelingStars = "⭐".repeat(Math.round(product.avgFeeling));

          return (
            <div
              key={product.name}
              className={`rc-product-card ${isTop ? "top-product" : ""}`}
            >
              {isTop && <div className="rc-product-crown">👑</div>}

              <div className="rc-product-info">
                <span className="rc-product-name">{product.name}</span>
                <div className="rc-product-rating">
                  <span className="rc-product-stars">{feelingStars}</span>
                  <span className="rc-product-avg">{product.avgFeeling}/5</span>
                </div>
                <span className="rc-product-uses">
                  Used {product.timesUsed} {product.timesUsed === 1 ? "time" : "times"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
