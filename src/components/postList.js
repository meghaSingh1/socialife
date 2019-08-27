import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'


export default class PostList extends Component {
    constructor(props) {
      super(props);
      this.state = {
          posts: null,
          allowToPost: false,
      }
    }

    componentDidMount() {
        this.setState({posts: this.props.posts, allowToPost: this.props.allowToPost});
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({posts: this.props.posts, allowToPost: this.props.allowToPost});
        }
    }

    handleLike = (e, postUUID) => {
        //Change the UI

        let numberOfLikes = Number(e.target.nextElementSibling.innerHTML.split(' ')[0]);

        e.target.nextElementSibling.innerHTML = e.target.classList.contains('outline') ?
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

    handleCreatePost = (e) => {
        e.preventDefault();
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        axios.post('/api/create_new_post', {email: email, text_content: this.state.text_content}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
        .then(data => {
            this.setState({text_content: ''})
            if (data.status == 201) 
                this.props.requestPosts();
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
  
    render() {
        const email = localStorage.getItem('email');
        const first_column_items = this.state.posts === null ? '' : 
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
            const likeButtonClass = !likedByMe ? 'like icon outline link large' : 'red like icon link large';
            const addACommentDisplay = post.showCommentForm != true ? {display: 'none'} : {display: 'inherit'}
            const comments = post.comments.map(comment => (
                <div className="comment">
                <div className="avatar">
                  <img src={'http://localhost:8000' + comment.user.avatar} />
                </div>
                <div className="content">
                    <a href={'/profile/' + comment.user.profile_name} className="author">{comment.user.first_name + ' ' + comment.user.last_name}</a>
                  <div className="metadata"><div>{comment.date_created}</div></div>
                  <div className="text">{comment.content}</div>
                </div>
              </div>
            ))
            if(index%2 === 0) return (
            <div className="column post-item">
                <div className='ui middle aligned grid post-header'>
                    <div className="ui tiny image two wide column">
                        <img className='ui image avatar' src={'http://localhost:8000' + post.user.avatar} />
                    </div>
                    <div className='ui eight wide column'>
                    <Link to={'/profile/' + post.user.profile_name} className="post-user-name">{post.user.first_name + ' ' + post.user.last_name}</Link>
                    <div className="post-time">{post.date_created}</div>
                    </div>
                </div>
                <div className="post-content">
                    <p>{post.text_content.trim()}</p>
                </div>
                <div className="extra">
                    <i aria-hidden="true" onClick={(e) => this.handleLike(e, post.uuid)} className={likeButtonClass}></i>
                    <a className="ui label">{post.liked_by.length + (post.liked_by.length > 1 ? ' Likes' : ' Like')}</a>
                    <a className='ui label' onClick={() => this.showAddComment(index)}>Add a comment</a>
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

        const second_column_items = this.state.posts === null ? '' : 
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
            const likeButtonClass = !likedByMe ? 'like icon outline link large' : 'red like icon link large';
            const addACommentDisplay = post.showCommentForm != true ? {display: 'none'} : {display: 'inherit'}
            const comments = post.comments.map(comment => (
                <div className="comment">
                <div className="avatar">
                  <img src={'http://localhost:8000' + comment.user.avatar} />
                </div>
                <div className="content">
                  <a href={'/profile/' + comment.user.profile_name} className="author">{comment.user.first_name + ' ' + comment.user.last_name}</a>
                  <div className="metadata"><div>{comment.date_created}</div></div>
                  <div className="text">{comment.content}</div>
                </div>
              </div>
            ))
            if(index%2 === 1) return (
            <div className="column post-item">
                <div className='ui middle aligned grid post-header'>
                    <div className="ui tiny image two wide column">
                        <img className='ui image avatar' src={'http://localhost:8000' + post.user.avatar} />
                    </div>
                    <div className='ui eight wide column'>
                    <Link to={'/profile/' + post.user.profile_name} className="post-user-name">{post.user.first_name + ' ' + post.user.last_name}</Link>
                    <div className="post-time">{post.date_created}</div>
                    </div>
                </div>
                <div className="post-content">
                    <p>{post.text_content.trim()}</p>
                </div>
                <div className="extra">
                    <i aria-hidden="true" onClick={(e) => this.handleLike(e, post.uuid)} className={likeButtonClass}></i>
                    <a className="ui label">{post.liked_by.length + (post.liked_by.length > 1 ? ' Likes' : ' Like')}</a>
                    <a className='ui label' onClick={() => this.showAddComment(index)}>Add a comment</a>
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

        const createNewPost = this.state.allowToPost ? 
        (<div className='post-input-section'>
        <div className="ui pointing menu">
            <a className="active item">What's on your mind right now?</a>
        </div>
        <div className="ui segment active tab">
            <form className="ui form" onSubmit={this.handleCreatePost} method="post">
                <div className='field'>
                    <textarea value={this.state.text_content} required onChange={e => this.setState({text_content: e.target.value})} style={{resize: 'none'}} placeholder="Tell us more" rows="3"></textarea>
                </div>
                <input type='submit' className="button ui blue" value="Post" />
            </form>
        </div></div>) : '';

        const post_contents = this.state.posts == null ? (
            <div><div className="ui padded two column grid">
            <div className='post-column column ui'>
                {createNewPost}
            </div>
            </div><div className="ui active centered inline loader"></div></div>) :
        (<div className="ui padded two column grid">
            <div className='post-column column ui'>
            {createNewPost}
            
            {first_column_items}</div>
            <div className='post-column column ui'>{second_column_items}</div>
        </div>)

        return (
            <div className="post-list">
                {post_contents}
            </div>
        );
    }
  }