import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'
import logo from '../assets/images/logo.png';

export default class Login extends Component {
    constructor(props) {
      super(props);
      this.state = {
        email: '',
        password: '',
        error: false,
      }
    }

    UNSAFE_componentWillMount() {
      const email = localStorage.getItem('email');
      const token = localStorage.getItem('token');
      axios.post('/api/check_logged_in', {email: email}, {headers: 
      {'Content-Type': 'application/x-www-form-urlencoded',
       'Authorization': "Bearer " + token}})
        .then(res => {
            if (res.status == 200)
                this.props.history.push('/');
            else               
                localStorage.clear();
        }).catch(err => {
            localStorage.clear();
        })
    }
  
    handleSubmit = (e) => {
      e.preventDefault();
      console.log(this.state.email);
      axios.post('/api/token/', {email: this.state.email, password: this.state.password}).then(res => {
        if (res.status == 200) {
          localStorage.setItem('token', res.data.access);
          localStorage.setItem('email', res.data.email);
          localStorage.setItem('profile_name', res.data.profile_name);
          this.props.history.push('/')
        }
        else
          this.setState({error: true})
      }).catch(err => this.setState({error: true}))
    }
  
    render() {
      const errorMessage = this.state.error ? ( 
      <div className="ui error message">
        <div className="content">
          <h4 className="header">Log In failed</h4>
          <p style={{fontSize: '1rem'}}>No active account found with the given credentials</p>
        </div>
      </div>) : '';
      return (
        <div className="login-screen">
            <div className="ui text container login-wrapper">
                <div className="ui card login-card">
                    <div className="content login-form-header">
                        <img className='login-form-logo' src={logo} alt="Logo" />
                    </div>
                    <div className="content">
                    <form onSubmit={this.handleSubmit} className="ui form">
                        <div className="field required">
                        <label>Email Address</label>
                        <div className="ui input input-wrapper">
                            <div className='input-icon'><i aria-hidden="true" className="user icon"></i></div>
                            <input style={{border: 'None'}} placeholder="Email Address" value={this.state.email} onChange={e => this.setState({email: e.target.value})} />
                        </div>
                        </div>
                        <div className="field required">
                        <label>Password</label>
                        <div className="ui input input-wrapper">
                            <div className='input-icon'><i aria-hidden="true" className="lock icon"></i></div>
                            <input type='password' style={{border: 'None'}} placeholder="Password" value={this.state.password} onChange={e => this.setState({password: e.target.value})} />
                        </div>
                        </div>
                        <button type="submit" className="ui blue button login-form-buttons">Login</button>
                    </form>
                    {errorMessage}
                    <div style={{textAlign:'center'}}>
                        <div className="ui horizontal divider">Or</div>
                        <button onClick={() => this.props.history.push('/signup')} className="ui button login-form-buttons">
                            <i aria-hidden="true" className="signup icon"></i>Sign up
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
      );
    }
  }