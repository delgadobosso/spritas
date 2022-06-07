import React from 'react';
import './PostContainer.css';
import PostMain from './PostMain';
import Post from './Post';
import Reply from '../create/Reply';
import scrollBounce from '../functions/scrollBounce';
import UpdatePost from '../create/UpdatePost';
import he from 'he';

export default class PostContainer extends React.Component {
    constructor(props) {
        super(props);
        this.scrollTop = this.scrollTop.bind(this);
        this.loadReplies = this.loadReplies.bind(this);
        this.extendReplies = this.extendReplies.bind(this);
        this.setCurrent = this.setCurrent.bind(this);
        this.state = {
            main: null,
            replies: [],
            post: null,
            current: 0,
            offset: 0,
            amount: 4,
            more: true,
            ever: false,
            opid: null,
            blockers: []
        }
    }

    componentDidMount() {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;

        fetch(`/p/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    this.setState({
                        main: data,
                        post: data[0],
                        current: data.length,
                        opid: data[0].idUser
                    }, () => {
                        const title = document.getElementById('PostName-' + id);
                        if (title) scrollBounce(title);
                        this.loadReplies();
                    });
                    const title = (data[0].title) ? data[0].title : '';
                    document.title = he.decode(title) + " - The Spritas";
                }
            })

        fetch('/user/blockers')
            .then(resp => resp.json())
            .then(data => {
              if (data.length > 0) {
                var list = [];
                data.forEach(block => list.push(Object.values(block)[0]));
                this.setState({ blockers: list });
              }
            });
    }

    scrollTop() {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;

        var con = (this.props.id) ? document.getElementById('PostHome-' + id) : window;
        con.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    loadReplies() {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;
        if (!this.state.ever && this.state.offset > 0) this.setState({ever: true});

        fetch(`/r/${id}.${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                const moreReplies = data.slice(0, this.state.amount).map((reply, index) =>
                    <Post key={index + this.state.offset} post={reply}
                        reply={true} opid={this.state.opid} user={this.props.user}
                        blockers={this.state.blockers} />
                );
                var rep = document.getElementById('Replies');
                let maxHeight = rep.scrollHeight;
                rep.style.height = maxHeight + "px";
                this.setState(state => ({
                    replies: [...state.replies, ...moreReplies]
                }), () => this.extendReplies())
                if (data.length < (this.state.amount + 1)) {
                    this.setState(state => ({
                        more: !state.more
                    }));
                } else {
                    this.setState(state => ({
                        offset: state.offset + this.state.amount
                    }));
                }
            })
    }

    extendReplies() {
        var rep = document.getElementById('Replies');
        if (rep) {
            let maxHeight = rep.scrollHeight;
            rep.style.height = maxHeight + "px";
            const controller = new AbortController();
            rep.addEventListener('transitionend', (e) => {
                if (e.currentTarget === e.target) {
                    rep.style.height = "auto";
                    controller.abort();
                }
            }, { signal: controller.signal });
        }
    }

    setCurrent(value) {
        this.setState({ current: value });
    }

    render() {
        const id = (this.state.post) ? this.state.post.id : "";

        const main = (this.state.main) ? <PostMain posts={this.state.main} user={this.props.user} naviHide={this.props.naviHide} current={this.state.current} setCurrent={this.setCurrent} /> : null;

        var reply;
        if (this.props.user && this.props.user.type === "BAN") reply = <h2 className="PostContainer-reply-header">You Are Banned</h2>;
        else if (this.state.blockers.includes(this.state.opid)) reply = <h2 className="PostContainer-reply-header">{this.state.post.nickname} Has Blocked You From Commenting</h2>;
        else if (this.props.user && this.props.user.id !== this.state.opid) reply = <Reply parentId={id} main={true} user={this.props.user} />

        const loaded = (this.state.ever) ?
        <div className="PostContainer-loaded">All Replies Loaded</div> : null;
        const load = (this.state.more) ?
        <div className="PostContainer-load" onClick={this.loadReplies}>Load More Replies</div> : loaded;

        const comment = (this.state.replies.length > 0) ? "Comments" : "No Comments";

        return (
            <div className="PostContainer">
                {main}
                <h2 className="PostContainer-reply-header">{comment}</h2>
                {reply}
                <div className="PostContainer-replies" id="Replies">
                    {this.state.replies}
                </div>
                {load}
            </div>
        )
    }
}