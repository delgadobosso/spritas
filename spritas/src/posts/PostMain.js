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
        this.goToPost = this.goToPost.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.state = ({
            modal: false
        });
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashHandle);
    }

    componentDidUpdate() {
        const currentPost = this.props.posts[this.props.current - 1];
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
        if (e.oldURL.split('#')[1] === `image${this.props.current}`) {
            const modal = document.getElementById('PostModal-' + this.props.posts[this.props.current - 1].id);
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
        } else if (e.newURL.split('#')[1] === `image${this.props.current}`) {
            this.setState({
                modal: true
            }, () => this.props.naviHide(true));
        }
    }

    left() {
        if (this.props.current > 1) {
            this.props.setCurrent(this.props.current - 1);
        }
    }

    right() {
        if (this.props.current < this.props.posts.length) {
            this.props.setCurrent(this.props.current + 1);
        }
    }

    goToPost(index) {
        this.props.setCurrent(index);
    }

    toggleModal() {
        this.setState(state => ({
            modal: !state.modal
        }), () => {
            if (this.state.modal) {
                this.props.naviHide(true);
                var prevState = window.history.state;
                window.history.pushState(prevState, "", `#image${this.props.current}`);
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
        const currentPost = posts[this.props.current - 1];
        const currentElem = <Post post={currentPost} op={true} />;

        // Update controls
        if (length > 1) {
            const nodes = posts.map((post, index) => {
                var fill, r;
                if (this.props.current - 1 === index) {
                    fill = 'red';
                    r = '15';
                } else {
                    fill = 'black';
                    r = '8';
                }

                return (
                    <g key={index} className='PostMain-nodeHit'
                        onClick={() => this.goToPost(index + 1)}>
                        <circle cx={60 * index} cy='50%' r='25' fillOpacity='0' />
                        <circle className='PostMain-node'
                            cx={60 * index} cy='50%' r={r} fill={fill} />
                        <title>{post.subtitle}</title>
                    </g>
                )
            });

            const nodeStyle = { transform: `translate(-${60 * (this.props.current - 1)}px)` };
            const leftArrow = (this.props.current === 1)
            ? { backgroundColor: 'grey' } : { backgroundColor: 'var(--spritan-red)' };
            const rightArrow = (this.props.current === length)
            ? { backgroundColor: 'grey' } : { backgroundColor: 'var(--spritan-red)' };

            var controls = (
                <div className="PostMain-controls">
                    <svg className="PostMain-arrowContainer" xmlns="http://www.w3.org/2000/svg" 
                        viewBox='0 0 80 40' onClick={this.left} style={leftArrow}>
                        <title>Previous Update</title>
                        <path className='PostMain-arrowL' d='M 40 10 L 30 20 L 40 30'
                            stroke='white' strokeWidth='5px' strokeLinecap='round' strokeLinejoin='round'
                            fill='none' />
                    </svg>

                    <svg className='PostMain-update' xmlns="http://www.w3.org/2000/svg">
                        <svg overflow='visible' x='50%'>
                            <g className='PostMain-nodeContainer' style={nodeStyle}>
                                <line x1='0' y1='50%' x2={60 * (length - 1)} y2='50%'
                                    stroke='black' strokeWidth='3px' />
                                {nodes}
                            </g>
                        </svg>
                    </svg>

                    <svg className="PostMain-arrowContainer" xmlns="http://www.w3.org/2000/svg" 
                        viewBox='0 0 80 40' onClick={this.right} style={rightArrow}>
                        <title>Next Update</title>
                        <path className='PostMain-arrowR' d='M 35 10 L 45 20 L 35 30'
                            stroke='white' strokeWidth='5px' strokeLinecap='round' strokeLinejoin='round'
                            fill='none' />
                    </svg>
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
                        video = (
                        <div className="PostMain-video">
                            <iframe width="100%" height="675"
                                id={`PostMainVideo-${currentPost.id}`}
                                title="Embedded-Video" allowFullScreen
                                src={embedSrc}>
                            </iframe>
                        </div>);
                    }
                } else if (currentPost.link) {
                    video = (
                        <div className='PostMain-video'>
                            <video src={link} controls width="100%" height="100%"></video>
                        </div>
                    )
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
                            <div className='PostMain-gradientTop'></div>
                            <div className='PostMain-gradientBot'></div>
                            <p className='PostMain-view'>Click To View Full Image</p>
                        </div>
                    </div>
                }
                break;

            default:
                break;
        }

        const subtitle = (currentPost.subtitle) ?
        <div className='PostMain-subtitleContainer'>
            <h3 className='PostMain-subtitle'>{he.decode(currentPost.subtitle)}</h3>
        </div> : null;

        return (
            <div className="PostMain">
                {modal}
                {controls}
                {video}
                {image}
                {subtitle}
                <div className="PostMain-post">{currentElem}</div>
            </div>
        )
    }
}