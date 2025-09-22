import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Layout>
        </Layout>
      </div>
    </Router>
  );
}

export default App;