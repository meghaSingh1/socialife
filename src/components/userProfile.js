import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'
import Navbar from './navbar'
import PostList from './postList'
import ImageUploader from 'react-images-upload'

export default class Login extends Component {
    constructor(props) {
      super(props);
      this.state = {
        user: null,
        user_posts: null,
        allowToPost: false,
        requestUserIsAnonymous: true,
        userData: null,
        canChat: false,
        pictures: [],
      }
    }

    async UNSAFE_componentWillMount() {
        await this.checkAuth()
        await this.requestPosts();
    }

    async componentDidUpdate(prevProps) {
        if(prevProps !== this.props)
        {
            await this.checkAuth();
            await this.requestPosts();
        }
    }

    checkAuth = async () => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        await axios.post('/api/check_logged_in', {email: email}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
         .then(res => {
            if (res.status === 200)
                this.setState({requestUserIsAnonymous: false, user: res.data.user, userData: res})
            else
                this.setState({requestUserIsAnonymous: true})
        }).catch(err => {})
    }

    requestPosts = async () => {
        const email = localStorage.getItem('email');
        const profileName = this.props.match.params.profileName;
        let requestData = this.state.requestUserIsAnonymous ? {profile_name: profileName, email: -1} : {profile_name: profileName, email: email};
        await axios.post('/api/get_user_profile', requestData)
        .then(res => {
            console.log(res);
            if (res.status === 200) {
                console.log(res.data)
                this.setState({user_posts: res.data.user_posts, user: res.data.user, isFollowing: res.data.is_in_your_following})
                if(!this.state.requestUserIsAnonymous && email == res.data.user.email)
                    this.setState({allowToPost: true})
                if(!this.state.allowToPost && !this.state.requestUserIsAnonymous)
                    this.setState({canChat: true})
            }
        }).catch(err => {})
    }

    handleFollow = (e) => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        const profileName = this.props.match.params.profileName;
        axios.post('/api/follow_user',{email: email, profile_name: profileName}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
        .then(res => {
            if (res.status === 200)
            {
                e.target.innerHTML = e.target.classList.contains('blue') ?  `Followed &nbsp;<i aria-hidden="true" className="check disabled icon"></i>` :
                'Follow';

                e.target.classList.contains('blue') ? e.target.classList.remove('blue') :
                e.target.classList.add('blue');
            }
        }).catch(err => {})
    }

    startChat = () => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        const profileName = this.props.match.params.profileName;

        axios.post('/api/enter_chat_room',{email: email, profile_name: profileName}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
        .then(res => {
            if(res.status == 200 || res.status == 201) {
                console.log(res)
                let uuid = res.data.room.uuid;
                while(uuid.includes('-'))
                    uuid = uuid.replace('-', '');
                this.props.history.push('/chat/' + uuid); }
        }).catch(err => {})
    }

    onDrop = (pictureFiles) => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        if(pictureFiles.length > 0) {
            console.log(pictureFiles[0]);

            let formData = new FormData(); 
            formData.append('file', pictureFiles[0]); 
            formData.append('email', email);
            for (var pair of formData.entries()) { console.log(pair[0]+ ', ' + pair[1]); }
            axios.post('/api/upload_picture', formData, {headers: 
            {'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Bearer " + token}}).then(res => {
                window.location.reload();
            }).catch(err => console.log(err));
        }
    }

  
    render() {
        const followButton = this.state.allowToPost ? '' :
        this.state.isFollowing == undefined ? <button className="ui loading button follow-button">Loading</button> : this.state.isFollowing ? <button onClick={e => {e.persist(); this.handleFollow(e)}} className='ui button follow-button'>Followed&nbsp; <i aria-hidden="true" className="check disabled icon"></i></button> :
        <button onClick={e => {e.persist(); this.handleFollow(e)}} className='ui blue button follow-button'>Follow</button>

        const startChatButton = this.state.canChat ? (
            <button className='ui red button' onClick={this.startChat}>Chat</button>
        ) : '';

        const followers = this.state.user == null ? '' : this.state.user.followers == undefined ? '' : this.state.user.followers.length + (this.state.user.followers.length > 1 ? ' Followers' : ' Follower');
        const user_name = this.state.user == null ? '' : (this.state.user.first_name + ' ' + this.state.user.last_name);
        const avatar = this.state.user == null ? '' : "https://socialifenetwork.herokuapp.com" + this.state.user.avatar;

        return (
            <div className='background'>
                <Navbar userData={this.state.userData} history={this.props.history}/>
                <div className='profile-container'>
                <div className="ui grid">
                    <div className="four wide column">
                    <div className="ui card">
                    <div className="image avatar">
                        <img className='profile-avatar' src={avatar} />
                    </div>
                    <div className="content">
                        <div style={{textAlign: 'center'}} className="header">
                            {user_name}
                        </div>
                        <div className="meta"><span className="date">
                        <div role="list" className="ui list">
                    <div role="listitem" className="item">
                        <i aria-hidden="true" className="users icon"></i>
                        <div className="content">Semantic UI</div>
                    </div>
                    <div role="listitem" className="item">
                        <i aria-hidden="true" className="marker icon"></i>
                        <div className="content">New York, NY</div>
                    </div>
                    <div role="listitem" className="item">
                        <i aria-hidden="true" className="mail icon"></i>
                        <div className="content"><a href="mailto:jack@semantic-ui.com">jack@semantic-ui.com</a></div>
                    </div>
                    <div role="listitem" className="item">
                        <i aria-hidden="true" className="linkify icon"></i>
                        <div className="content"><a href="http://www.semantic-ui.com">semantic-ui.com</a></div>
                    </div>
                    </div></span></div>
                        <div className="description">Matthew is a musician living in Nashville.</div>
                    </div>
                    <div className="extra content">
                        <a><i aria-hidden="true" className="user icon"></i>{followers}</a>
                        <br />
                        {followButton}
                        {startChatButton}
                    </div>
                    </div>
                    {this.state.allowToPost != true ? '' :
                    <ImageUploader className='item'
                            withIcon={true} singleImage={true} withLabel={true}
                            buttonText='Choose images' label='Change your avatar'
                            onChange={this.onDrop}
                            imgExtension={['.jpg', '.gif', '.png', '.gif']}
                            maxFileSize={5242880} withPreview={true}
                    />}
                    </div>
                    <div className="twelve wide column">
                        <PostList posts={this.state.user_posts} allowToPost={this.state.allowToPost} user={this.state.user} requestPosts={this.requestPosts} />
                    </div>
                    </div>
                </div>
            </div>
        );
    }
  }