import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'
import logo from '../assets/images/logo.png'

var globalSocket = null;

window.onresize = () => {
    let sidebar = document.getElementById("sidebar");
    let trendingHashTags = document.getElementById("trending-hashtags");

    if (sidebar != null) {
        sidebar.style.width = sidebar.parentElement.clientWidth - 32 + 'px';
    }

    if (trendingHashTags != null) {
        trendingHashTags.style.width = trendingHashTags.parentElement.clientWidth - 32 + 'px';
    }
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


    async componentDidUpdate(prevProps) {
        if (prevProps !== this.props && this.props.userData !== null) {
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
            this.props.history.push('/message/' + chatRoom.uuid);
        }
        else
            this.props.history.push('/message/');
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
            <Link to={notification.url} class="dropdown-item media my-0">
                <img className="notification-avatar rounded-circle mr-2" src={'http://127.0.0.1:8000' + notification.from_user.avatar[0].image}/>
                <div class="media-body">
                    <h6 class="mt-0 mb-1">{notification.from_user.first_name + ' ' + notification.from_user.last_name}</h6>
                    {notification.content}
            </div>
          </Link>
        )) : '';


        return (
            this.state.requestUserIsAnonymous == null || this.state.requestUserIsAnonymous == true ?
            (<nav ref={ (divElement) => this.divElement = divElement} class="navbar navbar-expand-lg navbar-light bg-white sticky-top py-0 px-5 main-menu">
            <Link class="navbar-brand" to="/"><img style={{width: '140px'}} src={logo} alt="Logo" /></Link>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav ml-auto">
                    <li className="nav-item">
                        <button className="ui button bg-white"><Link to='/login'><i aria-hidden="true" className="sign-in icon large"></i>Sign In</Link></button>
                    </li>
                </ul>
            </div>
            </nav>) :

            (<nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top py-0 px-5 main-menu">
            <Link class="navbar-brand" to="/"><img style={{width: '140px'}} src={logo} alt="Logo" /></Link>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          
            <div class="collapse navbar-collapse d-md-none" id="navbarSupportedContent">
                <ul class="navbar-nav d-md-none">
                <li class="nav-item">
                    <Link class="nav-link" onClick={this.goToChat}>
                        <i aria-hidden="true" className="bell outline icon"></i>Message
                    </Link>
                </li>
                <li class="nav-item">
                    <Link className="text-secondary nav-link" to={'/profile/' + localStorage.getItem('profile_name')}>
                        <i aria-hidden="true" className="address book outline icon"></i>Profile
                    </Link>
                </li>
                <li class="nav-item">
                    <Link class="nav-link" onClick={this.handleLogout}>
                        <i aria-hidden="true" className="sign-out icon"/>Logout
                    </Link>
                </li>
                </ul>
            </div>

            <div class="collapse navbar-collapse" id="">
                <div class="navbar-nav ml-auto mr-0">

                <div class="nav-item">
                <div className="ui icon input mx-2 px-5">
                <div className="ui search">
                    <div style={{padding: ".78em 0"}} className="ui icon input">
                    <input value={this.state.searchQuery} className='prompt' onBlur={this.searchBarFocusOut} onChange={this.searchAutocomplete} style={{minWidth: '280px'}} type="text" placeholder="Search..." />
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
                                    <img className='avatar' src={'http://127.0.0.1:8000' + item.avatar[0].image}/>
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

                <div class="nav-item dropdown mx-2">
                <a class="nav-link" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                    <button onClick={this.goToChat} className="ui button bg-white">
                        <i aria-hidden="true" className="mail outline icon large"></i>
                        {this.state.newMessages === 0 ? '' : <span class="badge badge-pill badge-danger">{this.state.newMessages}</span>}
                    </button>
                </a>
                </div>

                <div class="nav-item dropdown mx-2">
                    <a class="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                        <button onClick={this.readNotifications} className="ui button dropdown-item bg-white">
                            <i aria-hidden="true" className="bell outline icon large"></i>
                            {this.state.newNotifications === 0 ? '' : (<span class="badge badge-pill badge-danger">{this.state.newNotifications}</span>)}
                        </button>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-right list-unstyled py-0">
                    <h4 class="dropdown-header border-bottom text-center">What is new?</h4>
                    {notifications}
                    <Link to='/notifications' className='dropdown-item border-top text-center'>See more</Link>
                    </ul>
                </div>

                <div class="nav-item dropdown mx-2">
                    <a class="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                        <img className="ui navbar-avatar image" src={"http://127.0.0.1:8000" + this.state.user.avatar[0].image} />
                    </a>
                    <div class="dropdown-menu dropdown-menu-right py-0">
                    <h4 class="dropdown-header border-bottom text-center">Welcome, {localStorage.getItem('profile_name')}!</h4>
                    <Link to={'/profile/' + localStorage.getItem('profile_name')} className='dropdown-item'>
                        <i aria-hidden="true" className="address book outline icon"></i>Profile
                    </Link>
                    <Link className='dropdown-item' onClick={this.handleLogout}>
                        <i aria-hidden="true" className="sign-out icon"></i>Logout
                    </Link>
                    </div>
                </div>
                </div>
            </div>
          </nav>)
        );
    }
}