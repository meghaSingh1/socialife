import React, {Component} from 'react';
import axios from 'axios'
import {Link} from 'react-router-dom'

export default class RightContent extends Component {
    constructor(props) {
      super(props);
      this.state = {
          userData: null,
          trendingHashTags: [],
          followings: []
      }
    }

    componentDidMount() {
        axios.get('/api/get_trending_hashtags')
        .then(res => {
            console.log(res);
            if (res.status === 200)
                this.setState({trendingHashTags: res.data.trending_hashtags});
        }).catch(err => {})
    }

    async componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            await this.setState({followings: this.props.followings.slice(0,5)});

            let unfollowButtons = document.getElementsByClassName("unfollow-button");
            for (let i = 0; i < unfollowButtons.length; i++){
                console.log(unfollowButtons[i]);
                unfollowButtons[i].style.display = "none";
            }
        }
    }

    showUnfollowButton = (i, show) => {
        let button = document.getElementById("unfollow-" + i);
        button.style.display = show ? "block" : "none";
    }

    render() {
        const trendingHashTags = this.state.trendingHashTags.map(hashtag => {
            return (<div className="media list-group-item">
            <div className="media-body">
            <h6 class="mt-0 mb-1">#{hashtag.name}</h6>
                {hashtag.posts.length} posts in 30 days
            </div>
            </div>)
        })

        let followings = this.state.followings.map((fl, index) => (
            <Link to='/' onMouseOver={() => this.showUnfollowButton(index, true)} onMouseOut={() => this.showUnfollowButton(index, false)} className="media list-group-item">
            <img className="notification-avatar rounded-circle mr-2" src={'http://127.0.0.1:8000' + fl.avatar[0].image}/>
            <div className="media-body">
            <h6 class="mt-0 mb-1">{fl.first_name + ' ' + fl.last_name}</h6>
                @{fl.profile_name}
            </div>
            <button id={"unfollow-" + index} className='ui red button unfollow-button'>Unfollow</button>
        </Link>
        ))

        return (
            <div id="trending-hashtags" className="position-fixed">

                <div class="card border-dark mb-3 py-0 px-0 trending-hashtags-container">
                    <div class="card-header">Trending</div>
                    <ul class="card-body p-0 list-group text-dark">
                    {trendingHashTags}
                    <div className="media list-group-item border-top text-center">
                        <div className="media-body see-more">
                            See More
                        </div>
                    </div>
                    </ul>
                </div>

                <div class="card border-dark mb-3 py-0 px-0 sidebar-following">
                    <div class="card-header">People I Follow</div>
                    <ul class="card-body p-0 list-group text-dark">
                    {followings}
                    <div className="media list-group-item border-top text-center">
                        <div className="media-body see-more">
                            See More
                        </div>
                    </div>
                    </ul>
                </div>

                <div className="web-info">
                    {/* <div className="ui grid container"> */}
                        <a>Terms -</a>&nbsp;
                        <a>Privacy policy -</a>&nbsp;
                        <a>Cookies -</a>&nbsp;
                        <a>About -</a>&nbsp;
                        <a>© 2019 SOCIALIFE, Huy Lê</a>
                    {/* </div> */}
                </div>
            </div>
        );
    }
  }