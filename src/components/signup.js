import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'
import logo from '../assets/images/logo.png';
import {Form} from 'semantic-ui-react'

export default class Login extends Component {
    constructor(props) {
      super(props);
      this.state = {
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        gender: '',
        profile_name: '',
        month: "1",
        date: "1",
        year: "1998",
        step: 1,
        error: null,
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

    handleStep = (step) => {
        switch(step) {
            case 1:
                return (
                    <div className="field required">
                    <label>Email Address</label>
                    <div className="ui input input-wrapper">
                        <div className='input-icon'><i aria-hidden="true" className="user icon"></i></div>
                        <input onKeyPress={this.keyPressed} style={{border: 'None'}} placeholder="Email Address" value={this.state.email} onChange={e => this.setState({email: e.target.value})} />
                    </div>
                    </div>
                );
            case 2:
                return (
                    <div className="field required">
                    <label>Password</label>
                    <div className="ui input input-wrapper">
                        <div className='input-icon'><i aria-hidden="true" className="lock icon"></i></div>
                        <input onKeyPress={this.keyPressed} type='password' style={{border: 'None'}} placeholder="Password" value={this.state.password} onChange={e => this.setState({password: e.target.value})} />
                    </div>
                    </div>
                )
            case 3:
                return (
                    <div className="field required">
                    <label>Repeat Your Password</label>
                    <div className="ui input input-wrapper">
                        <div className='input-icon'><i aria-hidden="true" className="lock icon"></i></div>
                        <input onKeyPress={this.keyPressed} type='password' style={{border: 'None'}} placeholder="Password" value={this.state.password2} onChange={e => this.setState({password2: e.target.value})} />
                    </div>
                    </div>
                )
            case 4:
                return (
                    <div className="field required">
                    <label>First Name</label>
                    <div className="ui input input-wrapper">
                        <div className='input-icon'><i aria-hidden="true" className="user circle icon"></i></div>
                        <input onKeyPress={this.keyPressed} style={{border: 'None'}} placeholder="First Name" value={this.state.first_name} onChange={e => this.setState({first_name: e.target.value})} />
                    </div>
                    </div>
                )
            case 5:
                return (
                    <div className="field required">
                    <label>Last Name</label>
                    <div className="ui input input-wrapper">
                        <div className='input-icon'><i aria-hidden="true" className="user circle icon"></i></div>
                        <input onKeyPress={this.keyPressed} style={{border: 'None'}} placeholder="Last Name" value={this.state.last_name} onChange={e => this.setState({last_name: e.target.value})} />
                    </div>
                    </div>
                )
            case 6:
                return (
                    <div className="field">
                        <label>Select your gender</label>
                        <select onKeyPress={this.keyPressed} value={this.state.gender} onChange={e => this.setState({gender: e.target.value})}>
                        <option disabled value=""></option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        </select>
                    </div>
                )
            case 7:
                return (
                    <div>
                    <h4 className="ui dividing header">Date of birth</h4>
                    <div className="three fields">
                        <div className="field required">
                            <input onKeyPress={this.keyPressed} value={this.state.date} onChange={e => this.setState({date: e.target.value.toLocaleString()})} type="number" name="date" min='1' max="30" placeholder="Date"/>
                        </div>
                        <div className="field required">
                            <select onKeyPress={this.keyPressed} value={this.state.month} onChange={e => this.setState({month: e.target.value.toLocaleString()})} className="ui fluid search dropdown" name="month">
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </div>
                        <div className="field required">
                            <input onKeyPress={this.keyPressed} value={this.state.year} onChange={e => this.setState({year: e.target.value.toString()})} type="number" name="month" min='1980' max="2011" placeholder="Year"/>
                        </div>
                    </div>
                    </div>
                )
            case 8:
                return (
                    <div className="field required">
                    <label>Last Step: Choose your profile name</label>
                    <div className="ui input input-wrapper">
                        <div className='input-icon'><i aria-hidden="true" className="address card icon"></i></div>
                        <input onKeyPress={this.keyPressed} style={{border: 'None'}} placeholder="Profile Name" value={this.state.profile_name} onChange={e => this.setState({profile_name: e.target.value})} />
                    </div>
                    </div>
                )
        }
    }

    nextStep = () => {
        let fields = ['', 'email', 'password', 'password2', 'first_name', 'last_name', 'gender', 'profile_name'];
        if(this.state[fields[this.state.step]] === '' && this.state.step < 7)
            this.setState({error: `This field is required!`});
        else {
        this.setState({error: null});
        if(this.state.step == 1 && !this.state.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))
            this.setState({error: `This isn't a valid email address!`});
        else if (this.state.step == 3 && this.state.password != this.state.password2)
            this.setState({error: `Password doesn't match`});
        else
            this.setState({step: this.state.step + 1, error: null})
        }
    }

    prevStep = () => {
        this.setState({step: this.state.step - 1, error: null})
    }
  
    handleSubmit = () => {
    //   e.preventDefault();
      if (this.state.step === 8) {
        axios.post('/api/check_profile_name_availability', {profile_name: this.state.profile_name})
        .then(res => {
            if(res.status === 200) {
                this.setState({error: null});
                axios.post('/api/user_sign_up', 
                this.state)
                .then(res => {
                    if (res.status == 200)
                        this.props.history.push('/login');
                })
            }
        }).catch(err => {
            this.setState({error: 'Profile name already exists!'})
        })
      }
    }

    keyPressed = (e) => {
        if (e.key === "Enter") {
            if(this.state.step !== 8)
                this.nextStep();
            else
                this.handleSubmit();
        }
      }
  
    render() {
        const nextButton = this.state.step == 8 ?
        (<div className="ui two column grid">
            <div className="column">
                <button type="button" onClick={this.handleSubmit} className="ui blue button login-form-buttons">Register</button>
            </div>
            <div className="column">
            <button type='button' style={{marginTop: '10px'}} onClick={this.prevStep} className="ui button login-form-buttons">Back</button>
            </div>
        </div>) :
        this.state.step == 1 ?
        (<button type='button' style={{marginTop: '10px'}} onClick={this.nextStep} className="ui blue button login-form-buttons">Continue</button>) :
        (<div className="ui two column grid">
            <div className="column">
            <button type='button' style={{marginTop: '10px'}} onClick={this.nextStep} className="ui blue button login-form-buttons">Continue</button>
            </div>
            <div className="column">
            <button type='button' style={{marginTop: '10px'}} onClick={this.prevStep} className="ui button login-form-buttons">Back</button>
            </div>
        </div>);

        const errorMessage = this.state.error != null ? ( 
        <div className="ui error message">
            <div className="content">
            <p style={{fontSize: '1rem'}}>{this.state.error}</p>
            </div>
        </div>) : '';

        return (
            <div className="register-screen">
                <div className="ui text container register-wrapper">
                    <div className="ui card login-card">
                        <div className="content login-form-header">
                            <img className='login-form-logo' src={logo} alt="Logo" />
                        </div>
                        <div className="content">
                        <form onSubmit={(e) => e.preventDefault() } className="ui form">
                            {this.handleStep(this.state.step)}
                            {nextButton}
                        </form>
                        {errorMessage}
                        <div style={{textAlign:'center'}}>
                            <div className="ui horizontal divider">Or</div>
                            <button onClick={() => this.props.history.push('/login')} className="ui button login-form-buttons">
                                <i aria-hidden="true" className="sign-in icon"></i>Log in
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
  }