import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) {
        console.error(error);
      } else {
        setProducts(data);
      }
    };
    fetchProducts();

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name');
      if (error) {
        console.error(error);
      } else {
        setCategories(data.map((category: any) => category.name));
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <div>
      <h1>Product Catalog</h1>
      <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
        <option value={null}>All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <ul>
        {filteredProducts.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: {product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductCatalog;