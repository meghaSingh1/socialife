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

    showUnfollowButton = (i, show) => {
        let button = document.getElementById("unfollow-" + i);
        button.style.display = show ? "block" : "none";
    }

    render() {
        let followings = []
        for (let i = 0; i < (this.state.followings.length <= 3 ? this.state.followings.length : 3); i++)
            followings.push(<div onMouseOver={() => this.showUnfollowButton(i, true)} onMouseOut={() => this.showUnfollowButton(i, false)} role="listitem" className="item">
                <button id={"unfollow-" + i} className='ui red button unfollow-buttton'>Unfollow</button>
                <img src={"http://127.0.0.1:8000" + this.state.followings[i].avatar[0].image} className="ui avatar image" />
                <div className="content">
                <div className="header">{this.state.followings[i].first_name + ' ' + this.state.followings[i].last_name}</div>
                    {this.state.followings[i].followers.length} followers
                </div>
            </div>)
        
        return (
            <div style={{position: this.state.sidebarPosition}} id="sidebar" className="ui custom-sidebar secondary vertical menu">
                <Link to='/' id="home-item" className="item link-item">
                    <i style={{float: 'left'}} aria-hidden="true" className="home icon"></i>Home</Link>
                <Link to='/setting' id="setting-item" className="item link-item">
                    <i style={{float: 'left'}} aria-hidden="true" className="setting icon"></i>Settings</Link>
                <Link to={'/profile/' + localStorage.getItem('profile_name')} id="profile-item" className="item link-item">
                    <i style={{float: 'left'}} aria-hidden="true" className="user icon"></i>Profile</Link>
                    <div className="ui divider"></div>
                <div role="list" className="ui list item">
                    <div role="listitem" className="item people-following">
                        <div className="header people-i-followed-header"><i style={{float: 'left'}} aria-hidden="true" className="users icon"></i>People I Follow</div>
                    </div>
                    {followings}
                    <a className="see-all">See All<i aria-hidden="true" className="triangle right icon"></i></a>
                </div>
            </div>
        );
    }
  }