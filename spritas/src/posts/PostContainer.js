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
        this.loadPost = this.loadPost.bind(this);
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
            if (this.props.match.params.id) id = parseInt(this.props.match.params.id);
            if (this.props.match.params.idReply) idReply = parseInt(this.props.match.params.idReply);
        }

        if (idReply) this.setState({ oneReply: true });

        this.loadPost(id, idReply);

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

    loadPost(id, idReply = null, goTo = null) {
        fetch(`/post/${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                if (data[0].status === "DELE" && idReply) {
                    this.setState({
                        main: data,
                        current: 1,
                        opid: data[0].idUser
                    }, () => this.loadReply(idReply));
                }
                else if (data[0].idParent) this.loadPost(data[0].idParent, idReply, id);
                else {
                    var current = 1;
                    const nonDeleted = [];
                    data.map((post) => { if (post.status !== "DELE") nonDeleted.push(post); });
                    if (goTo) nonDeleted.map((post, index) => { if (post.id === goTo) current = index + 1; });
                    if (nonDeleted.length <= 0) window.location.href = '/';
                    this.setState({
                        main: nonDeleted,
                        current: current,
                        opid: data[0].idUser
                    }, () => {
                        if (!idReply) this.loadReplies(true);
                        else this.loadReply(idReply);
                    });
                    const title = (data[0].title) ? data[0].title : '';
                    document.title = he.decode(title);
                }
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
                            <Reply key={reply.id} post={reply}
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
                            loadingMore: false,
                            more: !(data.length < (this.state.amount + 1)),
                            offset: state.offset + this.state.amount
                        }), () => { if (!first) this.extendReplies(); })
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
                const theReply = (<Reply key={data[0].id} post={data[0]}
                reply={true} opid={this.state.opid} user={this.props.user}
                blockers={this.state.blockers} reload={this.reloadComments} idSub={idSub} focus={focus} />);
                this.setState({ replies: [theReply] }, () => {
                    const rep = document.getElementById(`rMain${idReply}`);
                    if (rep && !idSub) rep.style.background = 'linear-gradient(275deg, var(--mid-grey), var(--spritan-fade-gold))';
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
            loadingMore: false,
            oneReply: false
        }, () => {
            var stateObj = { id: this.state.main[this.state.current - 1].id };
            const currentPath = window.location.pathname;
            var link = currentPath.replace(/\/p\/.*/g, '');
            link = link + "/p/" + this.state.main[this.state.current - 1].id;
            window.history.replaceState(stateObj, "", link);
            window.history.scrollRestoration = 'manual';

            if (cb) cb(value);
            this.loadReplies(true);
        });
    }

    reloadComments() {
        if (this.state.oneReply) {
            var stateObj = { id: this.state.main[this.state.current - 1].id };
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

        var reply;
        if (this.props.user && this.props.user.type === "BAN") reply = <p className="PostContainer-banBlock">You Are Banned</p>;
        else if (this.state.blockers.includes(this.state.opid)) reply = <p className="PostContainer-banBlock">{this.state.main[0].nickname} Has Blocked You From Commenting</p>;
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

        const main = (this.state.main) ? <Post posts={this.state.main} user={this.props.user} naviHide={this.props.naviHide} current={this.state.current} setCurrent={this.setCurrent} rest={rest} extendReplies={this.extendReplies} scrollTop={this.scrollTop} oneReply={this.state.oneReply} /> : null;

        return (
            <div className="PostContainer">
                {main}
            </div>
        )
    }
}