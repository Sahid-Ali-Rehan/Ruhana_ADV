import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const { productId } = useParams();  // Extract productId from the URL params
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    images: [''],
    sizeChart: '',
    availableColors: [],
    availableSizes: [],
    stock: 0,
    price: 0,
    discount: 0,
    productCode: '',
    category: '',
    subCategory: '',
   
    isBestSeller: false,
  });
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            toast.error('Authentication token missing');
            return;
          }
          const response = await axios.get(`https://ruhana-adv.onrender.com/api/products/details/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Fetched Product ID:", productId);
          console.log("Response Data:", response.data);

          setFormData(response.data);  // Adjust if structure is different
        } catch (error) {
          console.error('Error fetching product:', error.response ? error.response.data : error.message);
          toast.error('Failed to fetch product details');
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      discount: Number(formData.discount),
    };
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://ruhana-adv.onrender.com/api/products/update/${productId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message);
      navigate('/'); // Redirect to all products after successful edit
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      toast.error('Something went wrong.');
    }
  };

  return (
    <div className="p-8 bg-[#f4ebb4] min-h-screen">
      <h2 className="text-3xl font-bold text-[#8d5c51] mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl">
        <div className="grid grid-cols-2 gap-6">
          <input
            type="text"
            name="productName"
            placeholder="Product Name"
            value={formData.productName}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
            required
          />
          <input
            type="text"
            name="productCode"
            placeholder="Product Code"
            value={formData.productCode}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full col-span-2 text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
            rows="3"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
            required
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount (%)"
            value={formData.discount}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
            required
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
            required
          />
          <input
            type="text"
            name="subCategory"
            placeholder="Sub Category"
            value={formData.subCategory}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
            required
          />
          <div className="col-span-2 flex items-center">
            <input
              type="checkbox"
              name="isBestSeller"
              checked={formData.isBestSeller}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isBestSeller" className="text-[#7b7c4d]">
              Best Seller
            </label>
          </div>
        </div>

        {/* Color and Size Input */}
  <div className="mt-4 grid grid-cols-2 gap-6">
    <div>
      <label className="font-semibold block mb-2 text-[#8d5c51]">Available Colors</label>
      <input
        type="text"
        placeholder="Enter colors (comma separated)"
        value={formData.availableColors.join(', ')}
        onChange={handleChange}
        className="p-2 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
      />
    </div>
    <div>
      <label className="font-semibold block mb-2 text-[#8d5c51]">Available Sizes</label>
      <input
        type="text"
        placeholder="Enter sizes (comma separated)"
        value={formData.availableSizes.join(', ')}
        onChange={handleChange}
        className="p-2 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
      />
    </div>
  </div>

        {/* Size Chart Input */}
<div className="mt-4">
  <h3 className="text-[#8d5c51] font-semibold">Size Chart</h3>
  <input
    type="text"
    name="sizeChart"
    value={formData.sizeChart}
    onChange={handleChange}
    className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
    placeholder="Size Chart URL"
  />
</div>


        {/* Dynamic Image Fields */}
        <div className="mt-4">
          <h3 className="text-[#8d5c51] font-semibold">Images</h3>
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-4 items-center mb-4">
              <input
                type="text"
                name={`image-${index}`}
                value={image}
                onChange={(e) => {
                  const updatedImages = [...formData.images];
                  updatedImages[index] = e.target.value;
                  setFormData({ ...formData, images: updatedImages });
                }}
                className="p-3 border rounded-lg w-full text-[#7b7c4d] bg-[#faeed5] placeholder:text-[#7b7c4d] focus:outline-none focus:ring-2 focus:ring-[#a0926c]"
                placeholder={`Image URL ${index + 1}`}
              />
              <button
                type="button"
                className="bg-[#a0926c] text-white px-3 py-2 rounded-lg"
                onClick={() => {
                  const updatedImages = formData.images.filter((_, i) => i !== index);
                  setFormData({ ...formData, images: updatedImages });
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-[#8d5c51] text-white px-4 py-2 rounded-lg mt-4"
            onClick={() => {
              if (formData.images.length < 5) {
                setFormData({ ...formData, images: [...formData.images, ''] });
              } else {
                toast.error('You can add a maximum of 5 images.');
              }
            }}
          >
            Add Image
          </button>
        </div>

        <button
          type="submit"
          className="bg-[#8d5c51] text-white px-4 py-2 rounded-lg mt-6 w-full"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
