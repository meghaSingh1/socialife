import React, {Component} from 'react';
import axios from 'axios'
import Navbar from './navbar'
import SideBar from './sidebar'
import RightContent from './rightContent';
import PostList from './postList'

export default class Bookmark extends Component {
    constructor(props) {
      super(props);
      this.state = {
          email: '',
          userData: null,
          trendingHashTags: [],
          followings: [],
          notifications: [],
          bookmark: null
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
        //Request Bookmark

        await axios.post('/api/get_bookmark', {email: email}, {headers: 
            {'Content-Type': 'application/x-www-form-urlencoded',
             'Authorization': "Bearer " + token}})
        .then(res => {
            this.setState({bookmark: res.data.bookmarked_posts});
        }).catch(err => {})
    }

    render() {
        return (
            <div className='background'>
                <Navbar userData={this.state.userData} history={this.props.history}/>
                <div className='feed-container'>
                    <div className='row'>
                    <div className='d-none d-md-block col-lg-3 feed-column'>
                        <SideBar userData={this.state.userData} activeClass="bookmark-item" />
                    </div>
                    <div className='col-sm-12 col-lg-6 bookmark-column blue px-0'>
                        <div class="media my-0 py-3 px-1 notification-item bookmark-header text-center">     
                            <h4 className="font-weight-bold">Bookmark</h4>
                        </div>
                        <PostList inBookmark={true} posts={this.state.bookmark} allowToPost={false} user={this.state.user} />
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