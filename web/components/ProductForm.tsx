import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

const ProductForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, description, price, category, image: image ? await uploadImage(image) : null }]);
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  };

  const uploadImage = async (image: File) => {
    const { data, error } = await supabase.storage
      .from('products')
      .upload(image.name, image, {
        upsert: true,
      });
    if (error) {
      console.error(error);
    } else {
      return data.Key;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Description:
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label>
        Price:
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      </label>
      <label>
        Category:
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <label>
        Image:
        <input type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
      </label>
      <button type="submit">Create Product</button>
    </form>
  );
};

export default ProductForm;