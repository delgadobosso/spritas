import React from 'react';
import './UserContainer.css';
import UserCard from './UserCard';
import TopicPortal from '../topics/TopicPortal';
import TopicPost from '../topics/TopicPost';
import UserOptions from './UserOptions';
import UserEdit from './UserEdit';

export default class UserContainer extends React.Component {
    constructor(props) {
        super(props);
        this.loadPosts = this.loadPosts.bind(this);
        this.extendPosts = this.extendPosts.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
        this.userEdit = this.userEdit.bind(this);
        this.state = {
            thisUser: null,
            posts: [],
            offset: 0,
            amount: 10,
            more: true,
            edit: false
        }
    }

    componentDidMount() {
        var con = document.getElementById('UserContainer-scroll');
        var naviTime = false;
        var prevScroll = con.scrollTop;
        con.onscroll = () => {
          clearTimeout(naviTime);
          naviTime = setTimeout(() => {
            var down = prevScroll < con.scrollTop;
            this.props.naviHide(down);
            prevScroll = con.scrollTop;
          }, 50);
        }

        const id = (this.props.id) ? this.props.id : this.props.match.params.id;

        fetch(`/user/${id}`)
            .then(res => res.json())
            .then(data => { this.setState({
                thisUser: data
            }, () => {
                if (this.state.thisUser) {
                    document.title = `${this.state.thisUser.name} - The Spritas`;
                    window.history.replaceState(window.history.state, "", `/user/${id}`);
                    window.history.scrollRestoration = 'manual';
                }
            }); });

        this.loadPosts(true);
    }

    loadPosts(first=false) {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;

        fetch(`/user/posts/${id}.${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const posts = data.slice(0, this.state.amount).map((post, index) =>
                    <TopicPost key={index + this.state.offset} post={post}
                        postClick={this.props.postClick} />);
                    if (data.length < (this.state.amount + 1)) {
                        this.setState(state => ({
                            more: !state.more
                        }));
                    } else {
                        this.setState(state => ({
                            offset: state.offset + this.state.amount
                        }));
                    }
                    if (!first) {
                        var sub = document.getElementById('UserContainer-topics');
                        let maxHeight = sub.scrollHeight;
                        sub.style.height = maxHeight + "px";
                    }
                    this.setState(state => ({
                        posts: [...state.posts, ...posts]
                    }), () => { if (!first) this.extendPosts(sub) });
                }
            });
    }

    extendPosts(sub) {
        if (sub) {
            let maxHeight = sub.scrollHeight;
            sub.style.height = maxHeight + "px";
            const controller = new AbortController();
            sub.addEventListener('transitionend', (e) => {
                if (e.currentTarget === e.target) {
                    sub.style.height = "auto";
                    controller.abort();
                }
            }, {signal: controller.signal});
        }
    }

    scrollTo() {
        var con = document.getElementById('UserPosts');
        con.scrollIntoView({ behavior: "smooth" });
        if (window.location.hash !== "#posts") window.history.pushState({}, "", "#posts");
    }

    userEdit(yes) {
        this.setState({ edit: yes });
    }

    render() {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;
        const posts = (this.state.posts) ? this.state.posts : null;

        const options = (this.props.user && id) ? <UserOptions user={this.props.user} thisUser={this.state.thisUser} thisId={id} userEdit={this.userEdit} editMode={this.state.edit} /> : null;

        const cards = (!this.state.edit) ? (
            <div className='UserContainer-cards'>
                <UserCard user={this.props.user} thisUser={this.state.thisUser} />
                {options}
            </div>
        ) : (
            <div className='UserContainer-cards'>
                <UserEdit user={this.props.user} thisUser={this.state.thisUser} />
                {options}
            </div>
        );

        return (
            <div className='UserContainer'>
                {cards}
                <div className='UserContainer-postContainer' id='UserPosts'>
                    <div className="UserContainer-header" onClick={this.scrollTo}>
                        <h1 className="UserContainer-title">Posts</h1>
                    </div>
                    <div className='UserContainer-container' id='UserContainer-scroll'>
                        <div className='UserContainer-topics' id='UserContainer-topics'>
                            <TopicPortal posts={posts} more={this.state.more} load={this.loadPosts} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}