import React, {Component} from 'react';
import axios from 'axios'
import Navbar from './navbar'
import SideBar from './sidebar'
import RightContent from './rightContent';
import {Link} from 'react-router-dom'

export default class Notification extends Component {
    constructor(props) {
      super(props);
      this.state = {
          email: '',
          userData: null,
          trendingHashTags: [],
          followings: [],
          notifications: []
      }
    }

    async componentDidMount() {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        await axios.post('/api/check_logged_in', {email: email}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
         .then(res => {
            if (res.status !== 200) {
                localStorage.clear();
                this.props.history.push('/login');
            }
            else this.setState({userData: res, notifications: res.data.notifications, followings: res.data.followings});
        }).catch(err => {
            localStorage.clear();
            this.props.history.push('/login');
        })
    }

    render() {
        const notifications = this.state.notifications.map(notification => (
            <Link to={notification.url} class="media my-0 py-2 px-1 notification-item">
                <img className="notification-avatar rounded-circle mr-4" src={'http://127.0.0.1:8000' + notification.from_user.avatar[0].image}/>
                <div class="media-body">
                    <h6 class="mt-0 mb-1">{notification.from_user.first_name + ' ' + notification.from_user.last_name}</h6>
                    {notification.content}
                </div>
          </Link>
        ));

        return (
            <div className='background'>
                <Navbar userData={this.state.userData} history={this.props.history}/>
                <div className='feed-container'>
                    <div className='row'>
                    <div className='d-none d-md-block col-lg-3 feed-column'>
                        <SideBar userData={this.state.userData} activeClass="notification-item" />
                    </div>
                    <div className='col-sm-12 col-lg-6 notification-column px-0'>
                            <div class="media my-0 py-3 px-1 notification-item notification-header text-center">
                                
                                <h4 className="font-weight-bold">Notifications</h4>
                                <a aria-haspopup="true" aria-expanded="false" role="button" id="notification-dropdown" data-toggle="dropdown" className="text-right"><i class="setting icon large blue"></i></a>
                                <div class="dropdown-menu" aria-labelledby="notification-dropdown">
                                    <a class="dropdown-item" href="#">Clear Notifications</a>
                                    <a class="dropdown-item" href="#">Notification Setting</a>
                                </div>
                            </div>
                            {notifications}
                    </div>
                    <div className='d-none d-md-block col-sm-12 col-lg-3 feed-column'>
                        <RightContent followings={this.state.followings} />
                    </div>
                    </div>
                </div>
            </div>
        );
    }
  }