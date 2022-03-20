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
        this.delete = this.delete.bind(this);
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
            opid: null
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
                    document.title = he.decode(data[0].title) + " - The Spritas";
                }
            })
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
                        reply={true} opid={this.state.opid} />
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

    delete() {
        const post = (this.state.main) ? this.state.main[this.state.current - 1] : null;
        var answer = prompt(`Are you sure you want to delete this post? Any comments will still stick around.\nType "${post.title}" to confirm:`, '');
        if (answer === post.title) {
            var myBody = new URLSearchParams();
            myBody.append('ogid', this.state.post.id);
            myBody.append('currentid', post.id);

            fetch('/delete/post', {
                method: 'POST',
                body: myBody
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/';
                else console.error('Post deletion error');
            });
        }
        else alert(`Post not deleted.`);
    }

    setCurrent(value) {
        this.setState({ current: value });
    }

    render() {
        const id = (this.state.post) ? this.state.post.id : "";

        const title = (this.state.post) ? he.decode(this.state.post.title) : "";
        const main = (this.state.main) ? <PostMain posts={this.state.main} naviHide={this.props.naviHide} current={this.state.current} setCurrent={this.setCurrent} /> : null;

        if (this.state.post) {
            var update;
            if (this.props.user && this.props.user.id === this.state.opid && this.state.post.update != 'DELE') {
                update = <UpdatePost post={this.state.post} user={this.props.user} currentPost={this.state.main[this.state.current - 1]} />;
            } else if (this.props.user && this.props.user.type === 'ADMN' && this.state.post.update != 'DELE') {
                update = (
                    <div className='PostContainer-controls'>
                        <div className='UpdatePost-controlItem UpdatePost-delete' onClick={this.delete}>Delete Post As Admin</div>
                    </div>);
            }
        }

        const reply = (!update) ? <Reply parentId={id} main={true} /> : null;

        const loaded = (this.state.ever) ?
        <div className="PostContainer-loaded">All Replies Loaded</div> : null;
        const load = (this.state.more) ?
        <div className="PostContainer-load" onClick={this.loadReplies}>Load More Replies</div> : loaded;

        const comment = (this.state.replies.length > 0) ? "Comments" : "No Comments";

        return (
            <div className="PostContainer">
                <div className="PostContainer-header" onClick={this.scrollTop}
                    title={title}>
                    <h2 className="PostContainer-title" id={"PostName-" + id}>
                        {title}
                    </h2>
                </div>
                {main}
                {update}
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