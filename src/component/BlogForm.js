import React, { useState } from 'react';
import axios from 'axios';
import './BlogForm.css';

const BlogForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    featured_image: '',
    author: '',
    content: '',
    publication_date: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let formErrors = {};
    if (!formData.title) formErrors.title = 'Title is required';
    if (!formData.featured_image) formErrors.featured_image = 'Featured image URL is required';
    if (!formData.author) formErrors.author = 'Author is required';
    if (!formData.content) formErrors.content = 'Content is required';
    if (!formData.publication_date) formErrors.publication_date = 'Publication date is required';
    return formErrors;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length === 0) {
      axios.post('http://localhost:8000/api/posts', formData)
        .then(response => {
          console.log('Post submitted successfully', response.data);
        })
        .catch(error => {
          console.error('Error submitting post', error);
        });
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} />
        {errors.title && <p>{errors.title}</p>}
      </div>
      <div>
        <label>Featured Image URL:</label>
        <input type="text" name="featured_image" value={formData.featured_image} onChange={handleChange} />
        {errors.featured_image && <p>{errors.featured_image}</p>}
      </div>
      <div>
        <label>Author:</label>
        <input type="text" name="author" value={formData.author} onChange={handleChange} />
        {errors.author && <p>{errors.author}</p>}
      </div>
      <div>
        <label>Content:</label>
        <textarea name="content" value={formData.content} onChange={handleChange} />
        {errors.content && <p>{errors.content}</p>}
      </div>
      <div>
        <label>Publication Date:</label>
        <input type="date" name="publication_date" value={formData.publication_date} onChange={handleChange} />
        {errors.publication_date && <p>{errors.publication_date}</p>}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default BlogForm;
