import React from 'react';
import './PostContainer.css';
import PostMain from './PostMain';
import Post from './Post';
import Reply from '../create/Reply';
import scrollBounce from '../functions/scrollBounce';
import he from 'he';

export default class PostContainer extends React.Component {
    constructor(props) {
        super(props);
        this.scrollTop = this.scrollTop.bind(this);
        this.loadReplies = this.loadReplies.bind(this);
        this.extendReplies = this.extendReplies.bind(this);
        this.setCurrent = this.setCurrent.bind(this);
        this.reloadComments = this.reloadComments.bind(this);
        this.state = {
            main: null,
            replies: [],
            post: null,
            current: 0,
            offset: 0,
            amount: 4,
            more: false,
            ever: false,
            opid: null,
            blockers: [],
            loadingMore: false
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
                        this.loadReplies(true);
                    });
                    const title = (data[0].title) ? data[0].title : '';
                    document.title = he.decode(title);
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

    loadReplies(first=false) {
        const id = (this.state.main) ? this.state.main[this.state.current - 1].id : null;
        if (!this.state.ever && this.state.offset > 0) this.setState({ever: true});

        fetch(`/r/${id}.${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                const moreReplies = data.slice(0, this.state.amount).map((reply, index) =>
                    <Post key={index + this.state.offset} post={reply}
                        reply={true} opid={this.state.opid} user={this.props.user}
                        blockers={this.state.blockers} delay={index} reload={this.reloadComments} />
                );
                var rep = document.getElementById('Replies');
                if (rep && !first) {
                    let maxHeight = rep.scrollHeight;
                    rep.style.height = maxHeight + "px";
                }
                this.setState(state => ({
                    replies: [...state.replies, ...moreReplies],
                    loadingMore: false
                }), () => { if (!first) this.extendReplies(); })
                if (data.length < (this.state.amount + 1)) {
                    this.setState({
                        more: false
                    });
                } else {
                    this.setState(state => ({
                        offset: state.offset + this.state.amount,
                        more: true
                    }));
                }
            })
            .catch(error => this.setState({ loadingMore: false }));
    }

    extendReplies(first=false) {
        var rep = document.getElementById('Replies');
        if (rep && !first) {
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

    setCurrent(value, cb) {
        this.setState({
            current: value,
            replies: [],
            offset: 0,
            more: false,
            ever: false,
            loadingMore: false
        }, () => {
            if (cb) cb(value);
            this.loadReplies(true);
        });
    }

    reloadComments() {
        this.setState({
            replies: [],
            offset: 0,
            more: false,
            ever: false,
            loadingMore: false
        }, () => this.loadReplies(true));
    }

    render() {
        const id = (this.state.main) ? this.state.main[this.state.current - 1].id : null;

        var reply;
        if (this.props.user && this.props.user.type === "BAN") reply = <p className="PostContainer-banBlock">You Are Banned</p>;
        else if (this.state.blockers.includes(this.state.opid)) reply = <p className="PostContainer-banBlock">{this.state.post.nickname} Has Blocked You From Commenting</p>;
        else if (this.props.user && this.props.user.id !== this.state.opid) reply = <Reply id={id} main={true} user={this.props.user} reload={this.reloadComments} target={'post'} />

        const loaded = (this.state.ever) ?
        <div className="PostContainer-loaded">All Comments Shown</div> : null;

        var loadMsg = "Show More Comments";
        var cover = ""
        if (this.state.loadingMore) {
            loadMsg = "Loading More Comments...";
            cover = " LoadingCover-anim";
        }
        const load = (this.state.more) ? (
        <div className="PostContainer-load" onClick={() => {
            this.setState({
                loadingMore: true
            }, () => this.loadReplies())
        }}>
            <div className={'LoadingCover' + cover}></div>
            {loadMsg}
        </div>
        ) : loaded;

        const rest = (this.state.replies.length > 0 || reply) ? (
            <div className='PostContainer-rest'>
                {reply}
                <div className="PostContainer-replies" id="Replies">
                    {this.state.replies}
                </div>
                {load}
            </div>
        ) : null;

        const main = (this.state.main) ? <PostMain posts={this.state.main} user={this.props.user} naviHide={this.props.naviHide} current={this.state.current} setCurrent={this.setCurrent} rest={rest} extendReplies={this.extendReplies} scrollTop={this.scrollTop} /> : null;

        return (
            <div className={"PostContainer"}>
                {main}
            </div>
        )
    }
}