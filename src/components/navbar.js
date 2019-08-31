import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'
import logo from '../assets/images/logo.png'
import { Popup } from 'semantic-ui-react'

var globalSocket = null;
function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

export default class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            requestUserIsAnonymous: null,
            notifications: null,
            newNotifications: 0,
            chatRooms: [],
            displayResult: 'none',
            searchResult: [],
            searchResultHover: false,
            menuPosition: 'static',
        }
        this.timer = null;
    }

    componentWillUnmount() {
        window.onscroll = null;
    }

    async componentDidUpdate(prevProps) {
        if (prevProps !== this.props && this.props.userData !== null) {
            let _this = this;
            let sidebar = document.getElementById("sidebar");
            let mainMenu = document.getElementById("main-menu");
            if (sidebar != null) {
                    let left = getOffset(sidebar).left;
                    let width = sidebar.clientWidth;
                    let menuHeight = this.divElement.clientHeight;

                window.onscroll = function() {
                    if(window.pageYOffset <= mainMenu.clientHeight + 10) {
                        _this.setState({menuPosition: 'static'})
                        sidebar.style.position = 'static';
                    }
                    else {
                        _this.setState({menuPosition: 'fixed'})
                        sidebar.style.top = menuHeight + 32 + 'px';
                        sidebar.style.width = width + 'px';
                        sidebar.style.position = 'fixed';
                    }
                };
            }

            const res = this.props.userData;
            if (res.status == 200) {
                let newNotifications = 0;
                let newMessages = 0;
                res.data.notifications.map(notification => {
                    if(!notification.is_read)
                        newNotifications += 1;
                })
                var unnoticedRoomUUID = []
                res.data.chat_rooms.map(room => {
                    var is_noticed = false;
                    

                    for (let i = 0; i < room.notice_by_users.length; i++) {
                        if(room.notice_by_users[i].email == res.data.user.email) {
                            is_noticed = true; 
                            break; 
                        }
                    }
                    if (!is_noticed) {newMessages+= 1;
                    unnoticedRoomUUID.push(room.uuid); }
                })
                await this.setState({requestUserIsAnonymous: false, user: res.data.user, unnoticedRoomUUID: unnoticedRoomUUID, notifications: res.data.notifications.slice(0, 7), newNotifications: newNotifications, newMessages: newMessages, chatRooms: res.data.chat_rooms})
                if(globalSocket === null)
                    await this.connectToGlobalSocket();
            }
            else this.setState({requestUserIsAnonymous: true});
        }
    }

    connectToGlobalSocket = async () => {
        globalSocket = new WebSocket('ws://127.0.0.1:8000/ws/global/');
        globalSocket.onopen = (e) => {
            var msg = {
                type: "global_socket",
                email: localStorage.getItem('email'),
                token: localStorage.getItem('token'),
            };
            globalSocket.send(JSON.stringify(msg));
        };
        globalSocket.onmessage = (e) => {
            console.log(e);
            let msg = JSON.parse(e.data);
            if(msg.type === 'new_message')
            {
                let uuid = msg.uuid;
                if(!this.state.unnoticedRoomUUID.includes(uuid)) {
                    this.setState({newMessages: this.state.newMessages+1, unnoticedRoomUUID: [...this.state.unnoticedRoomUUID,...[uuid]]})
                }
                if (this.props.getLastMessages !== undefined)
                    this.props.getLastMessages(msg.last_messages);
            }
            else if(msg.type == 'new_notification') {
                let newNotifications = this.state.notifications.slice();
                if (newNotifications.length == 7) {
                    newNotifications.pop();
                    newNotifications.unshift(msg.notification) ; }
                else newNotifications.unshift(msg.notification) ;
                this.setState({newNotifications: this.state.newNotifications + 1, notifications: newNotifications});
            }
        }
        globalSocket.onclose = (e) => {
            this.connectToGlobalSocket();
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

    searchAutocomplete = (e) => {
        this.setState({searchQuery: e.target.value})
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            axios.post('/api/search', {query: this.state.searchQuery, search_type:'profile_name', completion: true}).then(res => {
                console.log(res.data);
                this.setState({searchResult: res.data.result})
                if(this.state.searchQuery == '')
                    this.setState({displayResult: 'none'})
                else
                    this.setState({displayResult: res.data.result.length == 0 ? 'none' : 'block'})
            }).catch(err => this.setState({searchResult: [], displayResult: 'none'}))
        }, 1000);
    }

    searchBarFocusOut = () => {
        if(!this.state.searchResultHover)
            this.setState({displayResult: 'none'})
    }

    menuIsVisible = (isVisible) => {
        this.setState({menuPosition: isVisible ? 'static' : 'fixed'})
    }
  
    render() {
        const notifications = this.state.notifications != null ? 
        this.state.notifications.map(notification => (
            <Link to={notification.url} role="listitem" className="item list-item">
            <img src={'http://127.0.0.1:8000' + notification.from_user.avatar} className="ui avatar image"/>
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
            (<div ref={ (divElement) => this.divElement = divElement} id='main-menu' style={{backgroundColor: 'white', padding: '5px 5px'}} className="ui secondary menu main-menu">
            <a href='/' style={{padding: '0px 5px'}} className="header item header-logo"><img style={{width: '140px'}} src={logo} alt="Logo" /></a>
            <div className="right menu">
            <button style={{padding: '.1em'}} className="ui button item"><Link to='/login'><i aria-hidden="true" className="sign-in icon large"></i>Sign In</Link></button>
            </div>
            </div>) :

            (<div id="main-menu"  ref={ (divElement) => this.divElement = divElement}
            style={{backgroundColor: 'white', padding: '5px 5px', zIndex: '50', position: this.state.menuPosition, paddingBottom: this.state.menuPaddingBottom}} 
            className="ui secondary menu main-menu">
                <a href='/' style={{padding: '0px 5px'}} className="header item header-logo"><img style={{width: '140px'}} src={logo} alt="Logo" /></a>
                <div className="right menu">
                <div className="item">
                    <div className="ui icon input">
                        <div className="ui search">
                        <div className="ui icon input">
                        <input value={this.state.searchQuery} className='prompt' onBlur={this.searchBarFocusOut} onChange={this.searchAutocomplete} style={{width: '100%'}} type="text" placeholder="Search..." />
                            <i aria-hidden="true" className="search icon"></i>
                        </div>
                        <div onMouseOver={() => this.setState({searchResultHover: true})} 
                        onMouseOut={() => this.setState({searchResultHover: false})} 
                        style={{display: this.state.displayResult}} role="list" className="results">
                            {this.state.searchResult.map(item => (
                                <div onClick={() => {
                                    this.setState({displayResult: 'none', searchQuery: ''});
                                    this.props.history.push('/profile/' + item.profile_name);
                                }} className="result">
                                    <div className="image">
                                        <img className='avatar' src={'http://127.0.0.1:8000' + item.avatar}/>
                                    </div>
                                    <div className="content">
                                        <div className="title">{item.first_name + ' ' + item.last_name}</div>
                                        <div className="description">{item.profile_name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </div>
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
                trigger={<button className="ui button item"><img className="ui navbar-avatar image" src={"http://127.0.0.1:8000" + this.state.user.avatar} /></button>}>
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