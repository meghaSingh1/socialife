import React, {Component} from 'react';
import {Link} from 'react-router-dom'

var globalSocket = null;

export default class Sidebar extends Component {
    constructor(props) {
      super(props);
      this.state = {
          userData: null,
          followings: [],
          sidebarPosition: 'static'
      }
    }

    componentDidMount() {
        let activeClass = this.props.activeClass;
        let el = document.getElementById(activeClass);
        el.classList.add("active");
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userData != this.props.userData) {
            this.setState({followings: this.props.userData.data.followings})
            console.log(this.props.userData);
        }
    }


    render() {        
        return (
            <div id="sidebar" className="position-fixed">
                <div className="ui custom-sidebar secondary vertical menu">
                    <Link to='/' id="home-item" className="item link-item">
                        <i style={{float: 'none'}} aria-hidden="true" className="home icon"></i>Home</Link>
                    <Link to={'/profile/' + localStorage.getItem('profile_name')} id="profile-item" className="item link-item">
                        <i style={{float: 'none'}} aria-hidden="true" className="user icon"></i>Profile</Link>
                    <Link id="message-item" className="item link-item">
                        <i style={{float: 'none'}} aria-hidden="true" className="mail icon"></i>Message</Link>
                    <Link to='/notifications' id="notification-item" className="item link-item">
                        <i style={{float: 'none'}} aria-hidden="true" className="bell icon"></i>Notifications</Link>
                    <Link to='/bookmark' id="bookmark-item" className="item link-item">
                        <i style={{float: 'none'}} aria-hidden="true" className="bookmark icon"></i>Bookmark</Link>
                    <Link id="group-item" className="item link-item">
                        <i style={{float: 'none'}} aria-hidden="true" className="group icon"></i>Groups</Link>
                    <Link to='/setting' id="setting-item" className="item link-item">
                        <i style={{float: 'none'}} aria-hidden="true" className="setting icon"></i>Settings</Link>
                    <Link id="help-item" className="item link-item">
                        <i style={{float: 'none'}} aria-hidden="true" className="help circle icon"></i>Help</Link>
                </div>
            </div>
        );
    }
  }