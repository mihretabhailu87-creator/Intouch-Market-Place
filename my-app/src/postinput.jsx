import { useState } from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

function Post() {

  function handleChange(e) {
    const  {name,value} = e.target;
    if (name === "price" && value !== "" && Number(value) < 0) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

async function handleSubmit(e) {
  e.preventDefault();

  if (!image) {
    alert("Please select a product image.");
    return;
  }

  const formData = new FormData();
  formData.append("name", form.nameProduct);
  formData.append("description", form.description);
  formData.append("price", form.price);
  formData.append("type", form.type);
  formData.append("contact", form.contact);
  formData.append("image", image);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/products",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Backend error:", result);
      throw new Error(`Request failed: ${response.status}`);
    }

    console.log("Product saved:", result);
    alert("Product posted successfully!");

    setForm({
      nameProduct: "",
      description: "",
      price: "",
      type: "sell",
      contact: "",
    });

    setImage(null);
    e.target.reset();

  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Failed to submit the form. Check the console.");
  }
}
  const [form, setForm] = useState({
    nameProduct: "",
    description: "",
    price: "",
    type: "sell",
    contact: "",
  });

const [image,setImage] = useState(null);
  return (
    <>
    <style>{`
      .phone-input-wrap {
        display: flex;
        align-items: center;
        margin: 5px 0;
        border: 1px solid rgb(255, 69, 0);
        border-radius: 5px;
        background: white;
        padding: 0 10px;
        min-height: 42px;
      }
      .phone-flag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        margin-right: 6px;
        line-height: 1;
      }
      .phone-input-compact .PhoneInputCountry {
        margin-right: 4px;
      }
      .phone-input-compact .PhoneInputCountryIcon {
        width: 18px !important;
        height: 18px !important;
      }
      .phone-input-compact .PhoneInputCountryIcon--border {
        box-shadow: none;
        background-color:  transparent;
      }
      .phone-input-compact .PhoneInputInput {
        border: none;
        outline: none;
        background: hsla(0, 3%, 14%, 0.81);
        font: inherit;
      }
      .phone-input-compact {
        display: flex;
        align-items: center;
        flex: 1;
      }
    `}</style>
    <form className="forminput" onSubmit={handleSubmit}>
      <input
      className="inputform"
        placeholder="Product name"
        value={form.nameProduct}
        name="nameProduct"
        onChange={handleChange}
      />
      <fieldset className="price-fieldset">
        <legend>Enter Price</legend>
        <input
          className="inputform"
          placeholder="Product price"
          type="number"
          min="0"
          step={0.5}
          value={form.price}
          name="price"
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "-") e.preventDefault();
          }}
        />
      </fieldset>
      <textarea
        className="inputform"
        placeholder="Product description"
        value={form.description}
        name="description"
        onChange={handleChange}
      />
      <label htmlFor='type'>YOU want to <span style={{ color: 'lightcoral' }}>Sell</span> or <span style={{ color: 'green' }}>Rent</span></label>
     <select
    className="inputform"
    name="type"
    value={form.type}
    onChange={handleChange}
>
    <option value="sell">Sell</option>
    <option value="rent">Rent</option>
   </select>
      <label htmlFor='contact'>Your Contact</label>
      <div className="phone-input-wrap">
        <PhoneInput
          id="phone"
          international
          defaultCountry="ET"
          countries={['ET']}
          className="phone-input-compact"
          value={form.contact || undefined}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, contact: value || "" }))
          }
          placeholder="Ethiopian phone number"
        />
      </div>
      <label htmlFor='image'>Product Image</label>
<input
    className="inputform file_path"
    type="file"
    accept="image/*"
    name="image"
    onChange={(e) => setImage(e.target.files[0])}
/>
      <button
        type="submit"
        className={`inputform ${form.type === "sell" ? "sell-button" : "rent-button"}`}
      >
        {form.type === "sell" ? "Post Product for Sale" : "Post Product for Rent"}
      </button>
    </form>
  </>
  );
}
export default Post