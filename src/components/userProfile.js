import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'
import Navbar from './navbar'
import PostList from './postList'
import ImageUploader from 'react-images-upload'
import SideBar from './sidebar'
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css'; 
import { Dimmer } from 'semantic-ui-react'

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
        picData: '',
        aspect: 1/1,
        cropAvatarUploadActive: false,
        croppedAvatar: null,
        followings: [],
        followers: [],
        userAvatar: null
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
            {
                let isFollowing = false;
                for (let i = 0; i < res.data.followings.length; i++){
                    if(res.data.followings[i].profile_name === this.props.match.params.profileName) {
                        isFollowing = true;
                        break;
                    }
                }
                this.setState({isFollowing: isFollowing});
                this.setState({requestUserIsAnonymous: false, user: res.data.user, userData: res, userAvatar: res.data.user.avatar[0].image})
                console.log(this.state.user.avatar[0].image);
            }
            else
                this.setState({requestUserIsAnonymous: true})
        }).catch(err => {})
    }

    requestPosts = async () => {
        const email = localStorage.getItem('email');
        const profileName = this.props.match.params.profileName;
        let requestData = this.state.requestUserIsAnonymous ? {profile_name: profileName, email: -1} : {profile_name: profileName, email: email};
        await axios.post('/api/get_user_profile', requestData)
        .then(async res => {
            console.log(res);
            if (res.status === 200) {
                console.log(res.data)
                this.setState({user_posts: res.data.user_posts, user: res.data.user, followings: res.data.followings,
                followers: res.data.followers})
                if(!this.state.requestUserIsAnonymous && email == res.data.user.email)
                    this.setState({allowToPost: true})
                else this.setState({allowToPost: false})
                console.log(this.state.allowToPost);
                console.log(this.state.requestUserIsAnonymous);
                if(!this.state.allowToPost && !this.state.requestUserIsAnonymous)
                    this.setState({canChat: true})
                else this.setState({canChat: false})
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
                this.props.history.push('/message/' + uuid); }
        }).catch(err => {})
    }

    onDrop = (pictureFiles, picData) => {
        console.log(pictureFiles)
        this.setState({picData: picData, cropAvatarUploadActive: true})
    }

    dataURItoBlob = (dataURI) => {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
    }

    _crop = () => {
        // image in dataUrl
        let dataURI = this.refs.cropper.getCroppedCanvas().toDataURL();
        let blob = this.dataURItoBlob(dataURI);
        this.setState({croppedAvatar: new File([blob], "filename")})
    }

    closeCropDimmer = () => {
        this.setState({cropAvatarUploadActive: false})
    }

    handleUploadAvatar = () => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        if(this.state.croppedAvatar != null) {
            let formData = new FormData(); 
            formData.append('file', this.state.croppedAvatar); 
            formData.append('email', email);

            axios.post('/api/upload_avatar', formData, {headers: 
            {'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Bearer " + token}}).then(res => {
                window.location.reload();
            }).catch(err => console.log(err));
        }
    }
  
    render() {
        const cropPictures = this.state.picData == '' ? '' : (
            <Cropper
            ref='cropper'
            src={this.state.picData}
            style={{minWidth: '1000px'}}
            // Cropper.js options
            aspectRatio={1 / 1}
            guides={false}
            cropend={this._crop} />
        )
        const followButton = this.state.allowToPost ? '' :
        this.state.isFollowing == undefined ? <button className="ui loading button follow-button">Loading</button> : this.state.isFollowing ? <button onClick={e => {e.persist(); this.handleFollow(e)}} className='ui button follow-button'>Followed&nbsp; <i aria-hidden="true" className="check disabled icon"></i></button> :
        <button onClick={e => {e.persist(); this.handleFollow(e)}} className='ui blue button follow-button'>Follow</button>

        const startChatButton = this.state.canChat ? (
            <button className='ui red button' onClick={this.startChat}>Message</button>
        ) : '';

        const followers = this.state.user == null ? '' : this.state.user.followers == undefined ? '' : this.state.user.followers.length + (this.state.user.followers.length > 1 ? ' Followers' : ' Follower');
        const user_name = this.state.user == null ? '' : (this.state.user.first_name + ' ' + this.state.user.last_name);
        const avatar = this.state.user == null ? '' : ("http://127.0.0.1:8000" + (this.state.user.avatar.length > 0 ? this.state.user.avatar[0].image : ''));

        return (
            <div className='background'>
                <Navbar userData={this.state.userData} history={this.props.history}/>
                <div className='profile-container'>
                <div className='row'>
                    <div className='d-none d-md-block col-lg-3'>
                        <SideBar userData={this.state.userData} activeClass="profile-item" />
                    </div>
                    <div className="col-sm-12 col-lg-3 order-lg-9">
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
                        {this.state.allowToPost != true ? '' : <div className="avatar-uploader item">
                        <ImageUploader fileContainerStyle={{border: 'none', padding: '0'}}
                                withIcon={true} singleImage={true} withLabel={true}
                                buttonText='Choose images' label='Change your avatar'
                                onChange={this.onDrop}
                                imgExtension={['.jpg', '.gif', '.png', '.gif']}
                                maxFileSize={1000000} withPreview={true}
                        />
                        <button className="ui blue button" onClick={this.handleUploadAvatar}>Upload</button></div>}
                    </div>

                    <div className="col-sm-12 col-lg-6 order-lg-5">
                        <ul class="nav nav-tabs nav-fill" id="profile-tab" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="feed-tab" data-toggle="tab" href="#nav-feed" role="tab" aria-controls="feed" aria-selected="true">Feed</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="following-tab" data-toggle="tab" href="#nav-following" role="tab" aria-controls="following" aria-selected="false">Following</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="followers-tab" data-toggle="tab" href="#nav-followers" role="tab" aria-controls="followers" aria-selected="false">Followers</a>
                            </li>
                        </ul>

                        <div class="tab-content" id="profile-tabContent">
                        <div id="nav-feed" class="tab-pane fade show active">
                            <PostList userAvatar = {this.state.userAvatar} posts={this.state.user_posts} allowToPost={this.state.allowToPost} user={this.state.user} requestPosts={this.requestPosts} />
                        </div>
                        <div id="nav-following" class="tab-pane fade">
                            <div role="list" className="ui list item">
                                {this.state.followings.map(fl =>(
                                    <div onClick={() => this.props.history.push("/profile/" + fl.profile_name)} role="listitem" className="item">
                                        <img src={"http://127.0.0.1:8000" + fl.avatar[0].image} className="ui avatar image" />
                                        <div className="content">
                                        <div className="header">{fl.first_name + ' ' + fl.last_name}</div>
                                            {fl.profile_name}
                                        </div>
                                        <button className='ui blue button profile-list-follow-button'>Follow</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div id="nav-followers" class="tab-pane fade">
                            <div role="list" className="ui list item">
                                {this.state.followers.map(fl =>(
                                    <div onClick={() => this.props.history.push("/profile/" + fl.profile_name)} role="listitem" className="item">
                                        <img src={"http://127.0.0.1:8000" + fl.avatar[0].image} className="ui avatar image" />
                                        <div className="content">
                                        <div className="header">{fl.first_name + ' ' + fl.last_name}</div>
                                            {fl.profile_name}
                                        </div>
                                        <button className='ui blue button profile-list-follow-button'>Follow</button>
                                    </div>
                                ))}
                            </div>
                        </div> 
                        </div>
                    </div>

                    </div>
                </div>
                <Dimmer active={this.state.cropAvatarUploadActive} page>
                    {cropPictures}<br/>
                    <button onClick={this.closeCropDimmer} className="ui blue button">Done</button>
                </Dimmer>
            </div>
        );
    }
  }