import './CreatePost.css';
import { regex_video } from '../functions/constants';
import React from 'react';
import he from 'he';

export default class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.handleFile = this.handleFile.bind(this);
        this.handleLink = this.handleLink.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.clickVideoLink = this.clickVideoLink.bind(this);
        this.clickVideoUp = this.clickVideoUp.bind(this);
        this.videoRef = React.createRef();
        this.dropRef = React.createRef();
        this.state = {
            imgPreview: null,
            videoUp: true,
            vidLink: null,
            fileName: 'Select File'
        };
    }

    handleFile(e, fileDrop=null) {
        const file = (fileDrop) ? fileDrop : e.target.files[0];

        // Check file size
        if (file.size > 20971520) {
            e.target.value = '';
            alert('The file you selected is too large. It must be 20 MB or less.');
        } else {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = ((e) => {
                    this.setState({
                        imgPreview: e.target.result,
                        isLink: false
                    });
                });
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.videoRef.current.src = e.target.result;
                    this.videoRef.current.load();
                    this.videoRef.current.classList.remove('CreatePost-hide');
                    this.setState({
                        videoUp: true,
                        fileName: file.name
                    });
                }
                reader.readAsDataURL(file);
            }
        }
    }

    handleLink(e) {
        var video;
        const re = new RegExp(regex_video);
        const link = he.decode(e.target.value);
        if (e.target.value && re.test(link)) {
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
                <iframe className='CreatePost-vidLinkPreview'
                    id={`PostMainVideo`}
                    title="Embedded-Video" allowFullScreen
                    src={embedSrc}>
                </iframe>
            }

            this.setState({ vidLink: video });
        } else {
            this.setState({ vidLink: null });
        }
    }

    handleDrop(e) {
        e.preventDefault();

        this.dropRef.current.classList.remove('CreatePost-mediaAllValid');
        
        if (e.dataTransfer.items) {
            if (e.dataTransfer.items[0].kind === "file") {
                const file = e.dataTransfer.items[0].getAsFile();
                this.handleFile(e, file);
            }
        } else {
            const file = e.dataTransfer.files[0];
            this.handleFile(e, file);
        }
    }

    handleDrag(e) {
        e.preventDefault();

        if (e.type === "dragover") {
            e.dataTransfer.dropEffect = "copy";
            this.dropRef.current.classList.add('CreatePost-mediaAllValid');
        } else if (e.type === "dragexit") this.dropRef.current.classList.remove('CreatePost-mediaAllValid');
    }

    clickVideoUp() {
        this.setState({
            videoUp: true,
            vidLink: null
        });
    }

    clickVideoLink() {
        this.setState({
            videoUp: false,
            fileName: 'Select File'
        }, () => {
            this.videoRef.current.classList.add('CreatePost-hide');
            this.videoRef.current.pause();
            this.videoRef.current.removeAttribute('src');
            this.videoRef.current.load();
        });
    }

    render() {
        document.title = "Create a Post";
        const id = this.props.match.params.id;
        const type = new URLSearchParams(new URL(window.location.href).search).get('type');

        var username;
        var nickname;
        var avatar;
        if (this.props.user) {
            username = this.props.user.username;
            nickname = this.props.user.nickname;
            avatar = (this.props.user.avatar) ? `/media/avatars/${this.props.user.avatar}` : null;
        }

        var fileLink;
        if (this.state.videoUp) {
            fileLink = (
                <div className='CreatePost-options'>
                    <span className='CreatePost-option CreatePost-selected'>Media Upload</span>
                    <span className='CreatePost-option' onClick={this.clickVideoLink}>Media Link</span>
                </div>
            );
        } else if (!this.state.videoUp) {
            fileLink = (
                <div className='CreatePost-options'>
                    <span className='CreatePost-option' onClick={this.clickVideoUp}>Media Upload</span>
                    <span className='CreatePost-option CreatePost-selected'>Media Link</span>
                </div>
            );
        }

        var file = <input type="hidden" name="file" id="file" value="null" />;
        var link = <input type="hidden" name="link" id="link" value="null" />;
        if (this.state.videoUp) {
            file = (
            <div className="CreatePost-item">
                <label className='CreatePost-file' htmlFor="file">{this.state.fileName}</label>
                <input className='CreatePost-fileIn' type="file" name="file" id="file"
                    onChange={this.handleFile}
                    accept="video/mp4, video/webm" />
            </div>);
        } else if (!this.state.videoUp) {
            link = (
            <div className="CreatePost-item">
                <input className='CreatePost-link' type="text" name="link" id="link" pattern={regex_video} onChange={this.handleLink} placeholder="Enter Link Here" />
            </div>);
        } else if (type === "IMG") {
            file = (
            <div className="CreatePost-item">
                <label htmlFor="file">File: </label>
                <input type="file" name="file" id="file" required
                    onChange={this.handleFile}
                    accept="image/png, image/jpeg, image/gif" />
            </div>);
        }

        const vidContainer = (
            <div className='CreatePost-videoContainer'>
                <video className='CreatePost-hide' controls ref={this.videoRef} />
                {this.state.vidLink}
            </div>
        );

        const imgPreview = (type === "IMG" && this.state.imgPreview) ?
        <img className="CreatePost-imgPreview" src={this.state.imgPreview} alt="Preview" /> : null;

        const enctype = (type === "IMG" || this.state.videoUp) ? "multipart/form-data" : null;

        return (
            <div className="CreatePost">
                {/* <form action="/create/post/" className="CreatePost-form" method="POST"
                    encType={enctype}>
                    <h1>Create a Post</h1>
                    <input type="hidden" name="id" id="id" value={id} />
                    <input type="hidden" name="type" id="type" value={type} />
                    <div className="CreatePost-item">
                        <label htmlFor="name">Post Title: </label>
                        <input type="text" name="name" id="name" required />
                    </div>
                    <div className="CreatePost-item">
                        <label htmlFor="subtitle">Subtitle: </label>
                        <input type="text" name="subtitle" id="subtitle" maxLength="30" />
                    </div>
                    {fileLink}
                    {file}
                    {link}
                    {vidContainer}
                    {imgPreview}
                    <div className="CreatePost-item">
                        <label htmlFor="body">Body: </label>
                        <textarea name="body" id="body" rows="6" cols="100" required />
                    </div>
                    <div className="CreatePost-item">
                        <input type="submit" value="Post" />
                    </div>
                </form> */}
                <h1 className='CreatePost-createTitle'>Create a Post</h1>
                <div className='PostMain-container'>
                    <div className='CreatePost-mediaAll' onDrop={this.handleDrop} onDragOver={this.handleDrag} onDragExit={this.handleDrag} ref={this.dropRef}>
                        {fileLink}
                        {file}
                        {link}
                        <div className='PostMain-mediaContainer CreatePost-mediaContainer' >
                            {vidContainer}
                        </div>
                    </div>
                    <div className='PostMain-cards'>
                        <div className='PostMain-postOption'>
                            <div className='PostMain-post'>
                                <input className='PostMain-title CreatePost-title' type="text" name="name" id="name" placeholder='Post Title*' required />
                                <div className='PostMain-info'>
                                    <a href={`/u/${username}`} title={'@' + username} className="PostMain-a">
                                        <div className="PostMain-user">
                                            <img className="PostMain-img" src={avatar}
                                            alt="User icon" />
                                            <p className="PostMain-nickname">{nickname}</p>
                                        </div>
                                    </a>
                                </div>
                                <input className='PostMain-subtitle CreatePost-subtitle' type="text" name="subtitle" id="subtitle" maxLength="30" placeholder='Subtitle' />
                                <textarea className='PostMain-body CreatePost-body' name="body" id="body" rows="6" cols="100" placeholder='Post Body*' required />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}