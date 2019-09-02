import React, {Component} from 'react';
import './App.css'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import Login from './components/login'
import Signup from './components/signup'
import Home from './components/home'
import UserProfile from './components/userProfile'
import ChatRoom from './components/chatRoom'
import Search from './components/Search'

import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8000';

function App() {
  return (
    <Router>
        <Route path="/login" exact component={Login} />
        <Route path="/signup" exact component={Signup} />
        <Route path="/" exact component={Home} />
        <Route path="/profile/:profileName" component={UserProfile} />
        <Route path="/chat/:uuid?" component={ChatRoom} />
    </Router>
  );
}

export default App;
