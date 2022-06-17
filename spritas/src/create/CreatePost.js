import './CreatePost.css';
import { regex_video } from '../functions/constants';
import React from 'react';
import he from 'he';

export default class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.valid = ["video/mp4", "video/webm", "image/png", "image/jpeg", "image/gif"];
        this.handleFile = this.handleFile.bind(this);
        this.handleLink = this.handleLink.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.clickMediaLink = this.clickMediaLink.bind(this);
        this.clickMediaUpload = this.clickMediaUpload.bind(this);
        this.bodyCheck = this.bodyCheck.bind(this);
        this.submit = this.submit.bind(this);
        this.videoRef = React.createRef();
        this.dropRef = React.createRef();
        this.state = {
            imgPreview: null,
            mediaUpload: true,
            mediaLink: null,
            fileName: 'Select File',
            file: null
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
                        mediaUpload: true,
                        fileName: file.name,
                        imgPreview: e.target.result,
                        mediaLink: null,
                        file: file
                    }, () => {
                        this.videoRef.current.classList.add('CreatePost-hide');
                        this.videoRef.current.pause();
                        this.videoRef.current.removeAttribute('src');
                        this.videoRef.current.load();
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
                        mediaUpload: true,
                        fileName: file.name,
                        imgPreview: null,
                        mediaLink: null,
                        file: file
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
                <iframe width="100%" height="100%"
                    className='CreatePost-vidLinkPreview'
                    id={`PostMainVideo`}
                    title="Embedded-Video" allowFullScreen
                    src={embedSrc}>
                </iframe>
            }

            this.setState({
                mediaLink: video,
                imgPreview: e.target.result,
                file: null
            });
        } else {
            this.setState({ mediaLink: null });
        }
    }

    handleDrop(e) {
        e.preventDefault();

        this.dropRef.current.classList.remove('CreatePost-mediaAllValid');
        this.dropRef.current.lastChild.classList.remove('CreatePost-mediaContainerValid');
        this.dropRef.current.classList.remove('CreatePost-mediaAllInvalid');
        this.dropRef.current.lastChild.classList.remove('CreatePost-mediaContainerInvalid');
        
        if (e.dataTransfer.items && e.dataTransfer.items[0].kind === "file") {
            if (this.valid.includes(e.dataTransfer.items[0].type)) {
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
            if (e.dataTransfer.items && e.dataTransfer.items[0].kind === "file") {
                if (this.valid.includes(e.dataTransfer.items[0].type)) {
                    this.dropRef.current.classList.add('CreatePost-mediaAllValid');
                    this.dropRef.current.lastChild.classList.add('CreatePost-mediaContainerValid');
                } else {
                    this.dropRef.current.classList.add('CreatePost-mediaAllInvalid');
                    this.dropRef.current.lastChild.classList.add('CreatePost-mediaContainerInvalid');
                }
            }
            this.dropRef.current.classList.add('CreatePost-mediaAllValid');
            this.dropRef.current.lastChild.classList.add('CreatePost-mediaContainerValid');
        }
        else if (e.type === "dragexit") {
            this.dropRef.current.classList.remove('CreatePost-mediaAllValid');
            this.dropRef.current.lastChild.classList.remove('CreatePost-mediaContainerValid');
            this.dropRef.current.classList.remove('CreatePost-mediaAllInvalid');
            this.dropRef.current.lastChild.classList.remove('CreatePost-mediaContainerInvalid');
        }
    }

    clickMediaUpload() {
        this.setState({
            mediaUpload: true,
            mediaLink: null
        });
    }

    clickMediaLink() {
        this.setState({
            mediaUpload: false,
            imgPreview: null,
            fileName: 'Select File',
            file: null
        }, () => {
            this.videoRef.current.classList.add('CreatePost-hide');
            this.videoRef.current.pause();
            this.videoRef.current.removeAttribute('src');
            this.videoRef.current.load();
        });
    }

    bodyCheck(e) {
        var body = e.target.value;
        var newLines = body.match(/(\r\n|\n|\r)/g);
        var trueCount = body.length;
        if (newLines) trueCount += newLines.length;
        if (trueCount > 9999 && newLines) e.target.value = body.slice(0, 9999 - newLines.length);
        else if (trueCount > 9999) e.target.value = body.slice(0, 9999);
    }

    submit() {
        var formData = new FormData();
        const title = document.getElementById('title').value;
        const subtitle = document.getElementById('subtitle').value;
        const body = document.getElementById('body').value;
        const link = document.getElementById('link').value;

        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('body', body);
        formData.append('link', link);
        formData.append('file', this.state.file);

        fetch('/create/post', {
            method: 'POST',
            body: formData
        })
        .then(resp => {
            if (resp.ok) return resp.text();
        })
        .then(data => {
            var id = parseInt(data);
            if (id) window.location.href = "/post/" + id;
        })
    }

    render() {
        document.title = "Create a Post";

        var username;
        var nickname;
        var avatar;
        if (this.props.user) {
            username = this.props.user.username;
            nickname = this.props.user.nickname;
            avatar = (this.props.user.avatar) ? `/media/avatars/${this.props.user.avatar}` : null;
        }

        var file = <input type="hidden" name="file" id="file" value="null" />;
        var link = <input type="hidden" name="link" id="link" />;
        var fileLink;
        if (this.state.mediaUpload) {
            file = (
                <div className="CreatePost-item">
                    <label className='CreatePost-file' htmlFor="file">{this.state.fileName}</label>
                    <input className='CreatePost-fileIn' type="file" name="file" id="file"
                        onChange={this.handleFile}
                        accept="video/mp4, video/webm, image/png, image/jpeg, image/gif" />
                </div>);

            fileLink = (
                <div className='CreatePost-options'>
                    <span className='CreatePost-option CreatePost-selected'>Media Upload</span>
                    <span className='CreatePost-option' onClick={this.clickMediaLink}>Media Link</span>
                </div>
            );
        } else if (!this.state.mediaUpload) {
            link = (
                <div className="CreatePost-item">
                    <input className='CreatePost-link' type="text" name="link" id="link" pattern={regex_video} onChange={this.handleLink} placeholder="Enter Link Here" />
                </div>);

            fileLink = (
                <div className='CreatePost-options'>
                    <span className='CreatePost-option' onClick={this.clickMediaUpload}>Media Upload</span>
                    <span className='CreatePost-option CreatePost-selected'>Media Link</span>
                </div>
            );
        }

        const imgPreview = (this.state.imgPreview) ? (
            <div className='PostMain-imageContainer CreatePost-imageContainer'>
                <img className="PostMain-image" src={this.state.imgPreview} alt="Preview" />
            </div>)
        : null;

        const previewContainer = (
            <div className='CreatePost-previewContainer'>
                <video className='CreatePost-videoElem CreatePost-hide' controls ref={this.videoRef} />
                {this.state.mediaLink}
                {imgPreview}
            </div>
        );

        var createText = "Submit Text Post";
        if (this.state.file && this.state.imgPreview) createText = "Submit Picture Post";
        else if (this.state.file || this.state.mediaLink) createText = "Submit Video Post";

        // const enctype = (type === "IMG" || this.state.mediaUpload) ? "multipart/form-data" : null;

        return (
            <div className="CreatePost">
                <h1 className='CreatePost-createTitle'>Create a Post</h1>
                <div className='PostMain-container CreatePost-container'>
                    <div className='CreatePost-mediaAll' onDrop={this.handleDrop} onDragOver={this.handleDrag} onDragExit={this.handleDrag} ref={this.dropRef}>
                        {fileLink}
                        {file}
                        {link}
                        <div className='PostMain-mediaContainer CreatePost-mediaContainer' >
                            {previewContainer}
                        </div>
                    </div>
                    <div className='PostMain-cards'>
                        <div className='PostMain-postOption'>
                            <div className='PostMain-post'>
                                <input className='PostMain-title CreatePost-title' type="text" name="title" id="title" placeholder='Post Title*' required minLength="1" maxLength="64" />
                                <div className='PostMain-info'>
                                    <a href={`/u/${username}`} title={'@' + username} className="PostMain-a" tabIndex="-1">
                                        <div className="PostMain-user">
                                            <img className="PostMain-img" src={avatar}
                                            alt="User icon" />
                                            <span className="PostMain-nickname">{nickname}</span>
                                        </div>
                                    </a>
                                </div>
                                <input className='PostMain-subtitle CreatePost-subtitle' type="text" name="subtitle" id="subtitle" maxLength="32" placeholder='Subtitle' />
                                <textarea className='PostMain-body CreatePost-body' name="body" id="body" rows="6" cols="100" placeholder='Post Body*' required minLength="2" onChange={this.bodyCheck} />
                            </div>
                        </div>
                        <div className='PostMain-option'>
                            <div className='PostMain-optionItem' onClick={this.submit}>{createText}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}