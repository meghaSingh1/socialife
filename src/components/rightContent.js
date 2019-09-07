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

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({followings: this.props.followings});

            let unfollowButtons = document.getElementsByClassName("unfollow-button");
            for (let i = 0; i < unfollowButtons.length; i++)
                unfollowButtons[i].style.display = "none";
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

        let followings = []
        for (let i = 0; i < (this.state.followings.length <= 3 ? this.state.followings.length : 3); i++)
            followings.push(
                <Link to='/' onMouseOver={() => this.showUnfollowButton(i, true)} onMouseOut={() => this.showUnfollowButton(i, false)} className="media list-group-item">
                    <img className="notification-avatar rounded-circle mr-2" src={'http://127.0.0.1:8000' + this.state.followings[i].avatar[0].image}/>
                    <div className="media-body">
                    <h6 class="mt-0 mb-1">{this.state.followings[i].first_name + ' ' + this.state.followings[i].last_name}</h6>
                        @{this.state.followings[i].profile_name}
                    </div>
                    <button id={"unfollow-" + i} className='ui red button unfollow-button'>Unfollow</button>
                </Link>
              )

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
                    </ul>
                </div>

                <div className="web-info">
                    <div className="ui grid container">
                        <a class="three wide column">Terms</a>
                        <a class="five wide column">Privacy policy</a>
                        <a class="three wide column">Cookies</a>
                        <a class="three wide column">Ads info</a>
                        <a class="sixteen wide column">© 2019 SOCIALIFE, Huy Lê</a>
                    </div>
                </div>
            </div>
        );
    }
  }