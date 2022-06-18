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
            amount: 20,
            more: true,
            edit: false,
            loadingMore: false
        }
    }

    componentDidMount() {
        const name = this.props.match.params.name;

        fetch(`/user/info/${name}`)
            .then(res => res.json())
            .then(data => {
                this.setState({
                    thisUser: data
                }, () => {
                    if (this.state.thisUser) {
                        document.title = `${this.state.thisUser.nickname}`;
                        window.history.replaceState(window.history.state, "", `/u/${name}`);
                        window.history.scrollRestoration = 'manual';
                        this.loadPosts(true);
                    }
                });
            });
    }

    loadPosts(first=false) {
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                if (this.state.thisUser) {
                    const id = this.state.thisUser.id;
                    fetch(`/user/posts/${id}.${this.state.offset}.${this.state.amount}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.length > 0) {
                                const posts = data.slice(0, this.state.amount).map((post, index) =>
                                <TopicPost key={index + this.state.offset} post={post}
                                    postClick={this.props.postClick} delay={index} />);
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
                                    posts: [...state.posts, ...posts],
                                    loadingMore: false
                                }), () => { if (!first) this.extendPosts(sub) });
                            }
                        })
                }
            });
        }
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
        // if (window.location.hash !== "#posts") window.history.pushState({}, "", "#posts");
    }

    userEdit(yes) {
        this.setState({ edit: yes });
    }

    render() {
        const id = (this.state.thisUser) ? this.state.thisUser.id : null;
        const posts = (this.state.posts) ? this.state.posts : null;

        const options = (this.props.user && id && this.props.user.type !== "BAN") ? <UserOptions user={this.props.user} thisUser={this.state.thisUser} thisId={id} userEdit={this.userEdit} editMode={this.state.edit} /> : null;

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

        const name = (this.state.thisUser) ? `${this.state.thisUser.nickname}'s Posts` : 'Posts';

        return (
            <div className='UserContainer'>
                {cards}
                <div className='UserContainer-postContainer' id='UserPosts'>
                    <div className="UserContainer-header" onClick={this.scrollTo}>
                        <h1 className="UserContainer-title">{name}</h1>
                    </div>
                    <div className='UserContainer-container' id='UserContainer-scroll'>
                        <div className='UserContainer-topics' id='UserContainer-topics'>
                            <TopicPortal posts={posts} more={this.state.more} load={this.loadPosts} loadingMore={this.state.loadingMore} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}