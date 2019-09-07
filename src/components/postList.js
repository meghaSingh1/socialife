import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'
import ImageUploader from 'react-images-upload'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import { Dimmer, Confirm } from 'semantic-ui-react'
import pictureIcon from '../assets/icon/picture.png'
import hashTagIcon from '../assets/icon/hashtag.png'
import emojiIcon from '../assets/icon/emoji.png'

export default class PostList extends Component {
    constructor(props) {
      super(props);
      this.state = {
        posts: null,
        allowToPost: false,
        pictures: [],
        displayAddImagesSection: 'none',
        displayAddHashTagForm: 'none',
        images: [],
        postOptionHover: false,
        postToDelete: -1,
        openDeleteConfirm: false,
        hashtag: '',
        hashtags: [],
        userAvatar: null
      }
    }

    windowOnClick = () => {
        if(!this.state.postOptionHover) {
            let optionDropdowns = document.getElementsByClassName("dropdown-options");
            for (let i = 0; i < optionDropdowns.length; i++) {
                optionDropdowns[i].style.display = "none";
            }
        }
    }


    async componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            await this.setState({posts: this.props.posts, allowToPost: this.props.allowToPost, userAvatar: this.props.userAvatar});
            console.log(this.props.posts);
            let _this = this;
            //Close the dropdown menu when click outside
            window.addEventListener("click", this.windowOnClick, true);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.windowOnClick, true);
    }

    handleLike = (e, postUUID) => {
        //Change the UI
        let likeNumber = document.getElementById("like-" + postUUID);
        let numberOfLikes = Number(likeNumber.innerHTML.split(' ')[0]);
        console.log(numberOfLikes);

        likeNumber.innerHTML = e.target.classList.contains('outline') ?
        (numberOfLikes + 1 + (numberOfLikes+1 > 1 ?  ' Likes' : ' Like')) : (numberOfLikes - 1 + (numberOfLikes-1 > 1 ?  ' Likes' : ' Like'));

        e.target.classList.contains('outline') ? e.target.classList.add('red') :
        e.target.classList.remove('red');

        e.target.classList.contains('outline') ? e.target.classList.remove('outline') :
        e.target.classList.add('outline');

        //Call API
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        axios.post('/api/like_a_post',{email: email, post_uuid: postUUID}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
        .then(res => {
            if (res.status === 200)
                console.log(res);
        }).catch(err => {})
    }

    handleCreatePost = async (e) => {
        e.preventDefault();
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        await axios.post('/api/create_new_post', {email: email, text_content: this.state.text_content, hashtags: this.state.hashtags}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
        .then(async (res) => {
            this.setState({text_content: ''})
            if (res.status == 201) {
                if(this.state.pictures.length > 0) {
                    let formData = new FormData(); 
                    for(let i = 0; i < this.state.pictures.length; i++)
                        formData.append('file', this.state.pictures[i]);
                    console.log(this.state.pictures);
                    formData.append('email', email);
                    formData.append('type', 'post');
                    formData.append('uuid', res.data.post.uuid);
                    axios.post('/api/upload_picture', formData, {headers: 
                    {'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': "Bearer " + token}}).then(async (res) => {
                        this.setState({pictures: []});
                        this.setState({displayAddImagesSection: 'none'})
                        await this.props.requestPosts();
                    }).catch(err => console.log(err));
                }
                else  {await this.props.requestPosts();}
            }
        }).catch(err => {
        })
    }

    showAddComment = (index) => {
        let newPostState = [...this.state.posts];
        newPostState[index].showCommentForm = !newPostState[index].showCommentForm
        this.setState({posts: newPostState})
    }

    handleComment = (e, index, postUUID) => {
        e.preventDefault();
        let content = e.target.children[0].children[0].value;

        //Call API
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        axios.post('/api/add_a_comment',{email: email, post_uuid: postUUID, content: content}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Bearer " + token}})
        .then(res => {
            if (res.status === 200)
            {
                console.log(res.data);
                let newPostState = this.state.posts;
                newPostState[index].comments = [...newPostState[index].comments, ...[res.data.comment]]
                this.setState({posts: newPostState})
            }
        }).catch(err => {})

        e.target.children[0].children[0].value = '';
    }

    onDrop = (pictureFiles) => {
        this.setState({pictures: pictureFiles});
    }

    toogleDisplayAddImagesSection = async () => {
        let display = this.state.displayAddImagesSection === 'none' ? 'block' : 'none';
        await this.setState({displayAddImagesSection: display})
    }

    toogleDisplayAddHashTagForm = async () => {
        let display = this.state.displayAddHashTagForm === 'none' ? 'block' : 'none';
        await this.setState({displayAddHashTagForm: display})
    }

    openImageDimmer = (imageIndex, index, images) => {
        let image = this.state.posts[index].images[imageIndex].image;
        this.setState({dimmerActive: true, dimmerImage: image, images: images})
    }

    closeImageDimmer = () => {
        this.setState({dimmerActive: false})
    }

    showPostOption = (e) => {
        let optionDropdowns = document.getElementsByClassName("dropdown-options");
        for (let i = 0; i < optionDropdowns.length; i++) {
            optionDropdowns[i].style.display = "none";
        }
        let dropdown = e.target.nextSibling;
        dropdown.style.display = dropdown.style.display == "block" ? "none" : "block";
    }

    deletePost = () => {
        this.setState({openDeleteConfirm: false})
        //Call API
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        axios.post('/api/delete_a_post',{email: email, post_uuid: this.state.postToDelete}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Bearer " + token}})
        .then(res => {
            if (res.status === 200) {
                let newPosts = this.state.posts;
                for (let i = 0; i < newPosts.length; i++)
                    if (newPosts[i].uuid === this.state.postToDelete) {
                        newPosts.splice(i, 1); break; }
                this.setState({posts: newPosts})
            }
        }).catch(err => {})
    }

    handleAddHashTagKeyPress = (target) => {
        if(target.charCode==13){
            this.addHashTag();   
        } 
    }

    addHashTag = (e) => {
        e.preventDefault();
        if(this.state.hashtag != '' && !this.state.hashtags.includes(this.state.hashtag)){
            if (this.state.hashtags.length >= 6) {
                let newHashTags = this.state.hashtags.slice();
                newHashTags.shift()
                newHashTags.push(this.state.hashtag);
                this.setState({hashtags: newHashTags}); }
            else this.setState({hashtags: [...this.state.hashtags.slice(), ...[this.state.hashtag]]})
        }
        this.setState({hashtag: ''})
    }

    deleteHashTag = (hashtag) => {
        let index = this.state.hashtags.indexOf(hashtag);
        let newHashTags = this.state.hashtags.slice();
        newHashTags.splice(index, 1);
        this.setState({hashtags: newHashTags});
    }
  
    render() {
        const email = localStorage.getItem('email');
        const posts = this.state.posts === null ? '' : 
        this.state.posts.map((post, index) => {
            let likedByMe = false;
            for (let i = 0; i < post.liked_by.length; i++)
            {
                if (post.liked_by[i].email == email)
                {
                    likedByMe = true;
                    break;
                }
            }
            const likeButtonClass = !likedByMe ? 'like icon outline link' : 'red like icon link';
            const addACommentDisplay = post.showCommentForm != true ? {display: 'none'} : {display: 'inherit'}
            const comments = post.comments.map(comment => (
                <div className="comment">
                <div className="avatar">
                  <img src={'http://127.0.0.1:8000' + comment.user.avatar[0].image} />
                </div>
                <div className="content">
                    <a href={'/profile/' + comment.user.profile_name} className="author">{comment.user.first_name + ' ' + comment.user.last_name}</a>
                  <div className="metadata"><div>{comment.date_created}</div></div>
                  <div className="text">{comment.content}</div>
                </div>
              </div>
            ))

            const postDropdown = post.user.profile_name === localStorage.getItem('profile_name') ?
            (<div class="dropdown-menu dropdown-menu-right" aria-labelledby="notification-dropdown">
                <a onClick={() => this.setState({postToDelete: post.uuid, openDeleteConfirm: true})} class="dropdown-item" href="#">Delete this post</a>
                <a class="dropdown-item" href="#">Change post privacy</a>
            </div>) : (
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="notification-dropdown">
                <a class="dropdown-item" href="#">Hide this post</a>
                <a class="dropdown-item" href="#">{"Stop showing post from " + post.user.first_name + " " + post.user.last_name}</a>
            </div>
            );

            const postHashTags = post.hashtags.map(hashtag => {
                return (<div class="ui label post-hashtag">
                    {hashtag.name}
                </div>
            )});
            return (
            <div className="container post-item">
                <a style={{cursor: 'pointer'}} aria-haspopup="true" aria-expanded="false" role="button" id="notification-dropdown" data-toggle="dropdown" className="float-right"><i class="triangle down icon"></i></a>
                {postDropdown}
                
                <div className='row post-header'>
                    <div className="col-sm-2 col-lg-1 post-avatar-column">
                        <img className='ui image avatar' src={'http://127.0.0.1:8000' + post.user.avatar[0].image} />
                    </div>
                    <div className='col-sm-10 col-lg-10 post-user-name-column'>
                        <Link to={'/profile/' + post.user.profile_name} className="post-user-name">{post.user.first_name + ' ' + post.user.last_name}</Link>
                        <div className="post-time">{post.date_created}</div>
                    </div>
                </div>
                <div className="post-content">
                    <p>{post.text_content.trim()}</p>
                    <Carousel onClickItem={(imageIndex) => this.openImageDimmer(imageIndex, index, post.images)}>
                    {post.images.length == 0 ? '' :
                        post.images.map(image => (
                        <div>
                        <img src={'http://127.0.0.1:8000' + image.image} />
                        
                        </div>
                        ))}
                    </Carousel>
                        {postHashTags}
                </div>

                <div className="extra">
                    <div class="ui right labeled button post-like">
                        <button style={{padding: '0 .7em'}} class="ui icon button post-like-button" tabindex="0">
                            <i onClick={(e) => this.handleLike(e, post.uuid)} aria-hidden="true" className={likeButtonClass}></i>
                        </button>
                        <a id={"like-" + post.uuid} style={{fontSize: '.85714286rem'}} class="ui left pointing basic label">{post.liked_by.length + (post.liked_by.length > 1 ? ' Likes' : ' Like')}</a>
                    </div>
                    <div style={{cursor: 'pointer'}} className='ui blue label' onClick={() => this.showAddComment(index)}>Add a comment</div>
                    <div className="ui comments">
                        <h3 className="ui dividing header">Comments</h3>
                        {comments}
                    </div>
                    <form onSubmit={e => this.handleComment(e, index, post.uuid)} style={addACommentDisplay} className="ui reply form">
                        <div className="field"><textarea rows="3"></textarea></div>
                        <button className="ui icon primary left labeled button">
                        <i aria-hidden="true" className="edit icon"></i>
                        Add Reply
                        </button>
                    </form>
                </div>
            </div>
            )
        });

        const formHashTags = this.state.hashtags.map(hashtag => (
            <div class="ui label post-hashtag">
            {hashtag}<i onClick={() => this.deleteHashTag(hashtag)} aria-hidden="true" class="delete icon"></i>
            </div>
        ))

        const createNewPost = this.state.allowToPost ? 
        (<div className='post-input-section'>
        <div className="ui pointing menu">
            <a className="active item">What's on your mind right now?</a>
        </div>
        <div className="ui segment active tab">
            <form className="ui form create-post-form" onSubmit={this.handleCreatePost} method="post">
                <div className='fields'>
                    <img className='create-post-user-avatar rounded-circle' src={'http://127.0.0.1:8000' + this.state.userAvatar} />
                    <textarea value={this.state.text_content} required onChange={e => this.setState({text_content: e.target.value})} style={{resize: 'none'}} placeholder="Tell us more" rows="3"></textarea>
                </div>
                <div className="field">
                    <input style={{float: 'right'}} type='submit' className="button ui blue" value="Post" />
                    <button onClick={this.toogleDisplayAddImagesSection} type='button' className="ui button add-image-button"><img src={pictureIcon} /></button>
                    <button onClick={this.toogleDisplayAddHashTagForm} type='button' className="ui button add-hashtags-button"><img src={hashTagIcon} /></button>
                    <button type='button' className="ui button add-image-button"><img src={emojiIcon} /></button>
                </div>
                <div style={{display: this.state.displayAddImagesSection}} className='images-uploader-wrapper'>
                    <ImageUploader
                            withIcon={true} singleImage={false} withLabel={false}
                            buttonText='Choose images'
                            onChange={this.onDrop}
                            imgExtension={['.jpg', '.gif', '.png', '.gif']}
                            maxFileSize={5242880} withPreview={true}/>
                </div>
            </form>
            {formHashTags}
            <form style={{display: this.state.displayAddHashTagForm, marginTop: '.5em'}} onSubmit={this.addHashTag} className="ui form add-hashtag-form">
                <div className='field'>
                    <input value={this.state.hashtag} onChange={e => this.setState({hashtag: e.target.value})} type="text" className="add-hashtag-input border-left-0 border-right-0 border-top-0" placeholder="Add hashtags" />
                </div>
            </form>
        </div></div>) : '';

        const post_contents = this.state.posts == null ? (
            <div className=''>
                {createNewPost}
                <div className="ui active centered inline loader"></div>
            </div>) :
            (<div className=''>
                {createNewPost}
                {posts}
            </div>)

        return (
            <div className="post-list">
                {post_contents}
                <Confirm
                    open={this.state.openDeleteConfirm}
                    content='Are you sure you want to delete this post?'
                    onCancel={() => this.setState({openDeleteConfirm: false})}
                    onConfirm={this.deletePost}
                />
                <Dimmer active={this.state.dimmerActive} onClickOutside={this.closeImageDimmer} page>
                    <Carousel>
                    {this.state.images.length == 0 ? '' :
                        this.state.images.map(image => (
                        <div>
                        <img src={'http://127.0.0.1:8000' + image.image} />
                        </div>
                        ))}
                    </Carousel>
                    <i onClick={this.closeImageDimmer} aria-hidden="true" className="x icon dimmer-close-button"></i>
                </Dimmer>
            </div>
        );
    }
  }