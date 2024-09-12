import React from 'react';
import logo from './logo.svg';
import './App.css';
import BlogForm from './component/BlogForm';
import BlogList from './component/BlogList';

const App = () => {
  return (
    <div>
      <h1>Blog App</h1>
      <BlogForm />
      <BlogList />
    </div>
  );
};

export default App;
