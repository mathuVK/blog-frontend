import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BlogList.css';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('https://localhost:7188/api/Blog/getblogs')
      .then(response => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <div className="blog-list">
      {posts.map(post => (
        <div key={post.id} className="blog-post">
          <h2>{post.title}</h2>
          <img src={post.featured_image} alt={post.title} />
          <p>By {post.author} on {new Date(post.publication_date).toDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default BlogList;
