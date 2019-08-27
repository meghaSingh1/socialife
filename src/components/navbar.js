import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'
import logo from '../assets/images/logo.png'
import { Popup } from 'semantic-ui-react'
import ReactDOM from 'react-dom'


export default class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            requestUserIsAnonymous: null,
            notifications: null,
            newNotifications: 0,
            chatRooms: []
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props && this.props.userData !== null) {
            const res = this.props.userData;
            if (res.status == 200) {
                let newNotifications = 0;
                let newMessages = 0;
                res.data.notifications.map(notification => {
                    if(!notification.is_read)
                        newNotifications += 1;
                })
                res.data.chat_rooms.map(room => {
                    var is_noticed = false;

                    for (let i = 0; i < room.notice_by_users.length; i++) {
                        if(room.notice_by_users[i].email == res.data.user.email) {
                            is_noticed = true; 
                            break; 
                        }
                    }
                    if (!is_noticed) newMessages+= 1;
                })
                this.setState({requestUserIsAnonymous: false, user: res.data.user, notifications: res.data.notifications.slice(0, 7), newNotifications: newNotifications, newMessages: newMessages, chatRooms: res.data.chat_rooms})
            }
            else this.setState({requestUserIsAnonymous: true});
        }
    }

    handleLogout = () => {
        localStorage.clear();
        this.props.history.push('/login');
    }

    readNotifications = () => {
        this.setState({newNotifications: 0})
        
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        axios.post('/api/read_notifications', {email: email}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': "Bearer " + token}})
        .then(res => {}).catch(err => {})
    }

    goToChat = () => {
        if(this.state.chatRooms.length > 0) {
            let chatRoom = this.state.chatRooms[0];
            this.props.history.push('/chat/' + chatRoom.uuid);
        }
        else
            this.props.history.push('/chat/');
    }
  
    render() {
        const notifications = this.state.notifications != null ? 
        this.state.notifications.map(notification => (
            <Link to={notification.url} role="listitem" className="item list-item">
            <img src={'https://socialifenetwork.herokuapp.com' + notification.from_user.avatar} className="ui avatar image"/>
            <div className="content">
              <a className="header">{notification.from_user.first_name + ' ' + notification.from_user.last_name}</a>
              <div className="description">
                {notification.content}
              </div>
            </div>
          </Link>
        )) : '';

        return (
            this.state.requestUserIsAnonymous == null || this.state.requestUserIsAnonymous == true ?
            (<div style={{backgroundColor: 'white', padding: '5px 5px'}} className="ui secondary menu">
            <a href='/' style={{padding: '0px 5px'}} className="header item header-logo"><img style={{width: '140px'}} src={logo} alt="Logo" /></a>
            <div className="right menu">
            <button style={{padding: '.1em'}} className="ui button item"><Link to='/login'><i aria-hidden="true" className="sign-in icon large"></i>Sign In</Link></button>
            </div>
            </div>) :

            (<div style={{backgroundColor: 'white', padding: '5px 5px'}} className="ui secondary menu">
                <a href='/' style={{padding: '0px 5px'}} className="header item header-logo"><img style={{width: '140px'}} src={logo} alt="Logo" /></a>
                <div className="right menu">
                <div className="item">
                    <div className="ui icon input">
                    <input style={{width: '100%'}} type="text" placeholder="Search..." />
                    <i aria-hidden="true" className="search icon"></i>
                    </div>
                </div>
                <button style={{padding: '.1em'}} onClick={this.goToChat} className="ui button item">
                    <i aria-hidden="true" className="mail outline icon large"></i>
                    {this.state.newMessages == 0 ? '' : <div className="floating ui red label">{this.state.newMessages}</div>}
                </button>
                <Popup on='click' style={{padding: '0px'}} position = 'bottom center'
                trigger={<button onClick={this.readNotifications} style={{padding: '.1em'}} className="ui button item"><i aria-hidden="true" className="bell outline icon large"></i>{this.state.newNotifications == 0 ? '' : <div className="floating ui red label">{this.state.newNotifications}</div>}</button>}>
                    <div>
                        <div role="list" className="ui list notification-list">
                            <div style={{fontSize: '1.1em', fontWeight: '600'}} className='item notification-placeholder'>What's new?</div>
                            {notifications}
                            <div className='item notification-placeholder'><a>See more</a></div>
                        </div>
                    </div>
                </Popup>
                <Popup on='click' style={{padding: '0px'}} position = 'bottom right'
                trigger={<button className="ui button item"><img className="ui navbar-avatar image" src={"https://socialifenetwork.herokuapp.com" + this.state.user.avatar} /></button>}>
                    <div>
                        <div className="navbar-user-menu ui vertical menu">
                            <div className='item navbar-user-menu-placeholder'>Welcome, {localStorage.getItem('profile_name')}!</div>
                            <Link to={'/profile/' + localStorage.getItem('profile_name')} className='item'>
                                <i aria-hidden="true" className="address book outline icon"></i>Profile</Link>
                            <Link className='item' onClick={this.handleLogout}>
                            <i aria-hidden="true" className="sign-out icon"></i>Logout</Link>
                        </div>
                    </div>
                </Popup>
                </div>
                </div>)
        );
    }
}