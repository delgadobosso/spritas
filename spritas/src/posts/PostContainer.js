import React from 'react';
import './PostContainer.css';
import Post from './Post';
import Reply from './Reply';
import CreateReply from '../create/CreateReply';
import scrollBounce from '../functions/scrollBounce';
import he from 'he';

export default class PostContainer extends React.Component {
    constructor(props) {
        super(props);
        this.scrollTop = this.scrollTop.bind(this);
        this.loadReplies = this.loadReplies.bind(this);
        this.loadReply = this.loadReply.bind(this);
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
            loadingMore: false,
            oneReply: false
        }
    }

    componentDidMount() {
        var id = this.props.id;
        var idReply = this.props.idReply;
        if (this.props.match) {
            if (this.props.match.params.id) id = this.props.match.params.id;
            if (this.props.match.params.idReply) idReply = this.props.match.params.idReply;
        }

        if (idReply) this.setState({ oneReply: true });

        fetch(`/post/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    this.setState({
                        main: data,
                        post: data[0],
                        current: data.length,
                        opid: data[0].idUser
                    }, () => {
                        if (!idReply) this.loadReplies(true);
                        else this.loadReply(idReply);
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
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                const id = (this.state.main) ? this.state.main[this.state.current - 1].id : null;
                if (!this.state.ever && this.state.offset > 0) this.setState({ever: true});

                fetch(`/replies/${id}.${this.state.offset}.${this.state.amount}`)
                    .then(res => res.json())
                    .then(data => {
                        const moreReplies = data.slice(0, this.state.amount).map((reply, index) =>
                            <Reply key={index + this.state.offset} post={reply}
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
            });
        }
    }

    loadReply(idReply, idSub = null) {
        fetch(`/reply/${idReply}`)
        .then(resp => resp.json())
        .then(data => {
            if (data[0].idParent) this.loadReply(data[0].idParent, idReply);
            else {
                var focus = (!idSub) ? true : false;
                const theReply = (<Reply post={data[0]}
                reply={true} opid={this.state.opid} user={this.props.user}
                blockers={this.state.blockers} reload={this.reloadComments} idSub={idSub} focus={focus} />);
                this.setState({ replies: [theReply] }, () => {
                    const rep = document.getElementById(`rMain${idReply}`);
                    if (rep && !idSub) rep.style.background = 'linear-gradient(90deg, var(--mid-grey), var(--spritan-fade-gold))';
                });
            }
        })
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
        if (this.state.oneReply) {
            var stateObj = { id: this.state.post.id };
            const currentPath = window.location.pathname;
            var link = currentPath.replace(/\/r\/.*/g, '');
            window.history.replaceState(stateObj, "", link);
            window.history.scrollRestoration = 'manual';
        }

        this.setState({
            replies: [],
            offset: 0,
            more: false,
            ever: false,
            loadingMore: false,
            oneReply: false
        }, () => this.loadReplies(true));
    }

    render() {
        const id = (this.state.main) ? this.state.main[this.state.current - 1].id : null;
        var ogId = this.props.id;
        if (this.props.match && this.props.match.params.id) ogId = this.props.match.params.id;

        var reply;
        if (this.props.user && this.props.user.type === "BAN") reply = <p className="PostContainer-banBlock">You Are Banned</p>;
        else if (this.state.blockers.includes(this.state.opid)) reply = <p className="PostContainer-banBlock">{this.state.post.nickname} Has Blocked You From Commenting</p>;
        else if (this.props.user && this.props.user.id !== this.state.opid && !this.state.oneReply) reply = <CreateReply id={id} main={true} user={this.props.user} reload={this.reloadComments} target={'post'} />

        var showAll = (this.state.oneReply) ? (
            <div className='PostContainer-load PostContainer-showAll' onClick={() => this.reloadComments()}>Show All Post Replies</div>
        ) : null;

        const loaded = (this.state.ever) ?
        <div className="PostContainer-loaded">All Replies Shown</div> : null;

        var loadMsg = "Show More Replies";
        var cover = ""
        if (this.state.loadingMore) {
            loadMsg = "Loading More Replies...";
            cover = " LoadingCover-anim";
        }
        const load = (this.state.more) ? (
        <div className="PostContainer-load" onClick={() => this.loadReplies()}>
            <div className={'LoadingCover' + cover}></div>
            {loadMsg}
        </div>
        ) : loaded;

        const rest = (this.state.replies.length > 0 || reply) ? (
            <div className='PostContainer-rest'>
                {reply}
                {showAll}
                <div className="PostContainer-replies" id="Replies">
                    {this.state.replies}
                </div>
                {load}
            </div>
        ) : null;

        const main = (this.state.main) ? <Post posts={this.state.main} user={this.props.user} naviHide={this.props.naviHide} current={this.state.current} setCurrent={this.setCurrent} rest={rest} extendReplies={this.extendReplies} scrollTop={this.scrollTop} ogId={ogId} oneReply={this.state.oneReply} /> : null;

        return (
            <div className="PostContainer">
                {main}
            </div>
        )
    }
}