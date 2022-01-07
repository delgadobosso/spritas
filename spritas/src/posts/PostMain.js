import './PostMain.css';
import React from 'react';
import Post from './Post';
import he from 'he';
import { regex_video } from '../functions/constants';

export default class PostMain extends React.PureComponent {
    constructor(props) {
        super(props);
        this.left = this.left.bind(this);
        this.right = this.right.bind(this);
        this.toggleSize = this.toggleSize.bind(this);
        this.toggleSharp = this.toggleSharp.bind(this);
        this.toggleBackground = this.toggleBackground.bind(this);
        this.imageCanvas = React.createRef();
        this.state = ({
            current: props.posts.length,
            imgSize: false,
            imgSharp: true,
            bgWhite: false
        });
    }

    componentDidUpdate() {
        // Change video in iframe without messing up on re-render
        const currentPost = this.props.posts[this.state.current - 1];
        var ifram = document.getElementById(`PostMainVideo-${currentPost.id}`);
        if (ifram) {
            ifram.remove();
            document.getElementsByClassName('PostMain-video')[0].appendChild(ifram);
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

    toggleSize() {
        this.setState(state => ({
            imgSize: !state.imgSize
        }));
    }

    toggleSharp() {
        this.setState(state => ({
            imgSharp: !state.imgSharp
        }));
    }

    toggleBackground() {
        this.setState(state => ({
            bgWhite: !state.bgWhite
        }));
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
                    const imgElem = new Image();
                    imgElem.src = currentPost.link;
                    imgElem.onload = (e) => {
                        const canvas = this.imageCanvas.current;
                        if (canvas.getContext) {
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(imgElem, 0, 0);
                        }
                    };
                    
                    var imgRend;
                    var rendLabel;
                    if (this.state.imgSharp) {
                        imgRend = 'pixelated';
                        rendLabel = 'Pixelated';
                    } else {
                        imgRend = 'auto';
                        rendLabel = 'Smooth Edges';
                    }

                    var bgColor = (this.state.bgWhite) ? 'white' : 'black';

                    const divStyle = {
                        backgroundColor: bgColor
                    };
                    const imgStyle = {
                        imageRendering: imgRend
                    };

                    image =
                    <div className='PostMain-imageContainer'>
                        <div className='PostMain-image'
                            style={divStyle}>
                            <canvas className='PostMain-img'
                                ref={this.imageCanvas}
                                style={imgStyle} />
                        </div>
                        <div className='PostMain-imageControls'>
                                <div className='PostMain-imageButton'
                                    onClick={this.toggleSharp}>{rendLabel}</div>
                                <div className='PostMain-imageButton'
                                    onClick={this.toggleBackground}>Toggle Background Color</div>
                        </div>
                    </div>
                }
                break;

            default:
                break;
        }

        return (
            <div className="PostMain">
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