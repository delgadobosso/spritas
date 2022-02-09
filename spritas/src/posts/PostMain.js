import './PostMain.css';
import React from 'react';
import Post from './Post';
import he from 'he';
import { regex_video } from '../functions/constants';
import PostModal from './PostModal';

export default class PostMain extends React.PureComponent {
    constructor(props) {
        super(props);
        this.hashHandle = this.hashHandle.bind(this);
        this.left = this.left.bind(this);
        this.right = this.right.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.state = ({
            current: props.posts.length,
            modal: false
        });
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashHandle);
    }

    componentDidUpdate() {
        const currentPost = this.props.posts[this.state.current - 1];
        var ifram = document.getElementById(`PostMainVideo-${currentPost.id}`);
        if (ifram) {
            ifram.remove();
            document.getElementsByClassName('PostMain-video')[0].appendChild(ifram);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashHandle);
    }

    hashHandle(e) {
        if (e.oldURL.split('#')[1] === `image${this.state.current}`) {
            const modal = document.getElementById('PostModal-' + this.props.posts[this.state.current - 1].id);
            modal.style.opacity = 0;
            const controller = new AbortController();
            modal.addEventListener('transitionend', (e) => {
                if (e.currentTarget === e.target) {
                    this.setState({
                        modal: false
                    }, () => this.props.naviHide(false));
                    controller.abort();
                }
            }, { signal: controller.signal });
        } else if (e.newURL.split('#')[1] === `image${this.state.current}`) {
            this.setState({
                modal: true
            }, () => this.props.naviHide(true));
        }
    }

    left() {
        if (this.state.current > 1) {
            this.setState(state => ({
                current: state.current - 1
            }));
        }
    }

    right() {
        if (this.state.current < this.props.posts.length) {
            this.setState(state => ({
                current: state.current + 1
            }));
        }
    }

    toggleModal() {
        this.setState(state => ({
            modal: !state.modal
        }), () => {
            if (this.state.modal) {
                this.props.naviHide(true);
                var prevState = window.history.state;
                window.history.pushState(prevState, "", `#image${this.state.current}`);
                window.history.scrollRestoration = 'manual';
            } else if (!this.state.modal) {
                this.props.naviHide(false);
                window.history.go(-1);
            }
        });
    }

    render() {
        const posts = this.props.posts;
        const length = posts.length;
        const currentPost = posts[this.state.current - 1];
        const currentElem = <Post post={currentPost} op={true} />;
        if (length > 1) {
            var controls = (
                <div className="PostMain-controls">
                    <div className="PostMain-arrow" onClick={this.left}>&lt;--</div>
                    <div className="PostMain-current">{`Update ${this.state.current}`}</div>
                    <div className="PostMain-arrow" onClick={this.right}>--&gt;</div>
                </div>
            )
        }
        var modal;
        
        var video;
        var image;
        switch(currentPost.type) {
            case "VIDO":
                const re = new RegExp(regex_video);
                const link = he.decode(currentPost.link);
                if (currentPost.link && re.test(link)) {
                    const matches = link.match(regex_video).groups;
                    var source;
                    for (const thisSrc in matches) {
                        if (thisSrc.includes('source') && matches[thisSrc]) source = matches[thisSrc];
                    }
                    var id;
                    for (const thisId in matches) {
                        if (thisId.includes('id') && matches[thisId]) id = matches[thisId];
                    }
                    if (id) {
                        var embedSrc;
                        if (source === "youtube" || source === "youtu.be") embedSrc = `https://www.youtube.com/embed/${id}?modestbranding=1`;
                        else if (source === "streamable") embedSrc = `https://streamable.com/e/${id}`;
                        video =
                        <div className="PostMain-video">
                            <iframe width="100%" height="675"
                                id={`PostMainVideo-${currentPost.id}`}
                                title="Embedded-Video" allowFullScreen
                                src={embedSrc}>
                            </iframe>
                        </div>
                    }
                }
                break;

            case "IMG":
                if (currentPost.link) {
                    modal = (this.state.modal) ? 
                        <PostModal link={currentPost.link} id={currentPost.id}/>
                        : null;

                    image =
                    <div className='PostMain-imagePreview'>
                        <div className='PostMain-imageContainer'
                            onClick={this.toggleModal}>
                            <img className='PostMain-img'
                                src={currentPost.link}
                                alt="Main Post" />
                            <div className='PostMain-gradient'></div>
                            <p className='PostMain-view'>View Image</p>
                        </div>
                    </div>
                }
                break;

            default:
                break;
        }

        return (
            <div className="PostMain">
                {modal}
                {controls}
                {video}
                {image}
                <div className="PostMain-post">
                    {currentElem}
                </div>
            </div>
        )
    }
}