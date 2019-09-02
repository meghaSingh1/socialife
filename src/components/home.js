import React, {Component} from 'react';
import axios from 'axios'
import Navbar from './navbar'
import PostList from './postList'
import SideBar from './sidebar'


export default class Login extends Component {
    constructor(props) {
      super(props);
      this.state = {
          email: '',
          text_content: null,
          user_posts: null,
          userData: null
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
            else this.setState({userData: res});
        }).catch(err => {
            localStorage.clear();
            this.props.history.push('/login');
        })

        await this.requestPosts();
    }

    requestPosts = async () => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        await axios.post('/api/get_feed_posts', {email: email}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
         .then(res => {
            if (res.status === 200)
                this.setState({user_posts: res.data.user_posts});
        }).catch(err => {})
    }

    render() {
        return (
            <div className='background'>
                <Navbar userData={this.state.userData} history={this.props.history} profile_name={this.state.use}/>
                <div className='feed-container'>
                    <div className='ui grid'>
                    <div className='four wide column feed-column'>
                        <SideBar userData={this.state.userData} activeClass="home-item" />
                    </div>
                    <div className='eight wide column feed-column'>
                        <div>
                            <PostList posts={this.state.user_posts} isHomePage={true} allowToPost={true} requestPosts={this.requestPosts} />
                        </div>
                    </div>
                    <div className='four wide column feed-column'>
                        <div>Trending</div>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
  }