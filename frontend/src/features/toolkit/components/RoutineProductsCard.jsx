import React, { useState } from "react";
import "../styles/hairGoalsDiary.css";

const ROUTINE_STEPS = ["Wash", "Condition", "Mask", "Oil", "Serum", "Leave-in", "Style"];
const FREQUENCIES = ["Daily", "2x week", "Weekly", "Occasionally"];
const PRODUCT_CATEGORIES = [
  "Shampoo",
  "Conditioner",
  "Oil",
  "Mask",
  "Treatment",
  "Leave-in",
  "Styling"
];

export default function RoutineProductsCard({
  routineSteps,
  products,
  onUpdateRoutine,
  onUpdateProducts
}) {
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [routineForm, setRoutineForm] = useState({
    step: ROUTINE_STEPS[0],
    productName: "",
    frequency: FREQUENCIES[0],
    note: ""
  });
  const [productForm, setProductForm] = useState({
    name: "",
    category: PRODUCT_CATEGORIES[0],
    tags: "",
    note: ""
  });

  const handleAddRoutine = (e) => {
    e.preventDefault();
    if (!routineForm.step) return;
    const payload = {
      id: Date.now(),
      ...routineForm
    };
    onUpdateRoutine([...routineSteps, payload]);
    setRoutineForm({ step: ROUTINE_STEPS[0], productName: "", frequency: FREQUENCIES[0], note: "" });
    setShowRoutineForm(false);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;
    const payload = {
      id: Date.now(),
      ...productForm,
      tags: productForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    };
    onUpdateProducts([...products, payload]);
    setProductForm({ name: "", category: PRODUCT_CATEGORIES[0], tags: "", note: "" });
    setShowProductForm(false);
  };

  const removeRoutine = (id) => {
    onUpdateRoutine(routineSteps.filter((step) => step.id !== id));
  };

  const removeProduct = (id) => {
    onUpdateProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="hg-card">
      <div className="hg-card-header">
        <div>
          <h3 className="hg-card-title">🧴 Routine & Products</h3>
          <p className="hg-card-subtitle">Document the exact steps and items you rely on.</p>
        </div>
      </div>

      <div className="hg-card-section">
        <div className="hg-card-section-header">
          <h4>Routine Table</h4>
          <button className="hg-btn ghost" onClick={() => setShowRoutineForm((prev) => !prev)}>
            {showRoutineForm ? "Close" : "Add Step"}
          </button>
        </div>

        {routineSteps.length === 0 ? (
          <p className="hg-empty-copy">No routine steps yet. Add the actions you plan each week.</p>
        ) : (
          <div className="hg-routine-table">
            <div className="hg-routine-row heading">
              <span>Step</span>
              <span>Product</span>
              <span>Frequency</span>
              <span>Notes</span>
              <span></span>
            </div>
            {routineSteps.map((step) => (
              <div className="hg-routine-row" key={step.id}>
                <span>{step.step}</span>
                <span>{step.productName || "—"}</span>
                <span>{step.frequency}</span>
                <span>{step.note || ""}</span>
                <button className="hg-btn icon" onClick={() => removeRoutine(step.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {showRoutineForm && (
          <form className="hg-inline-form" onSubmit={handleAddRoutine}>
            <div>
              <label>Step</label>
              <select value={routineForm.step} onChange={(e) => setRoutineForm({ ...routineForm, step: e.target.value })}>
                {ROUTINE_STEPS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Product</label>
              <input
                type="text"
                value={routineForm.productName}
                onChange={(e) => setRoutineForm({ ...routineForm, productName: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label>Frequency</label>
              <select
                value={routineForm.frequency}
                onChange={(e) => setRoutineForm({ ...routineForm, frequency: e.target.value })}
              >
                {FREQUENCIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Notes</label>
              <input
                type="text"
                value={routineForm.note}
                onChange={(e) => setRoutineForm({ ...routineForm, note: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="hg-inline-actions">
              <button type="submit" className="hg-btn primary">
                Save Step
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="hg-card-section">
        <div className="hg-card-section-header">
          <h4>Product Library</h4>
          <button className="hg-btn ghost" onClick={() => setShowProductForm((prev) => !prev)}>
            {showProductForm ? "Close" : "Add Product"}
          </button>
        </div>

        {products.length === 0 ? (
          <p className="hg-empty-copy">Add the shampoos, oils, and masks you rely on.</p>
        ) : (
          <div className="hg-product-list">
            {products.map((product) => (
              <div key={product.id} className="hg-product-card">
                <div>
                  <p className="hg-product-name">{product.name}</p>
                  <p className="hg-product-meta">
                    {product.category}
                    {product.tags?.length ? ` • ${product.tags.join(", ")}` : ""}
                  </p>
                  {product.note && <p className="hg-product-note">{product.note}</p>}
                </div>
                <button className="hg-btn icon" onClick={() => removeProduct(product.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {showProductForm && (
          <form className="hg-inline-form" onSubmit={handleAddProduct}>
            <div>
              <label>Name</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Category</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              >
                {PRODUCT_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Tags</label>
              <input
                type="text"
                value={productForm.tags}
                onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                placeholder="hydrating, anti-frizz"
              />
            </div>
            <div>
              <label>Note</label>
              <input
                type="text"
                value={productForm.note}
                onChange={(e) => setProductForm({ ...productForm, note: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="hg-inline-actions">
              <button type="submit" className="hg-btn primary">
                Save Product
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
