import './CreatePost.css';
import { regex_video } from '../functions/constants';
import React from 'react';
import he from 'he';
import CrossIcon from '../icons/cross';

import { AppContext } from '../contexts/AppContext';

export default class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.valid = ["video/mp4", "video/webm", "image/png", "image/jpeg", "image/gif"];
        this.handleFile = this.handleFile.bind(this);
        this.handleLink = this.handleLink.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.clickMediaLink = this.clickMediaLink.bind(this);
        this.clickMediaUpload = this.clickMediaUpload.bind(this);
        this.removeUpload = this.removeUpload.bind(this);
        this.removeLink = this.removeLink.bind(this);
        this.bodyCheck = this.bodyCheck.bind(this);
        this.submit = this.submit.bind(this);
        this.videoRef = React.createRef();
        this.dropRef = React.createRef();
        this.state = {
            imgPreview: null,
            mediaUpload: true,
            mediaLink: null,
            fileName: 'Select A File',
            file: null,
            submitting: false,
            removeable: false
        };
    }

    componentDidMount() {
        if (this.props.ogPost && this.props.height) {
            const card = document.getElementById('CreatePost-post');
            card.animate([
                { height: `${this.props.height}px` },
                { height: '380px' }
            ], { duration: 500, easing: 'ease' });
        }
    }

    handleFile(e, fileDrop=null) {
        const file = (fileDrop) ? fileDrop : e.target.files[0];

        // Check file size
        if (file && file.size > 20971520) {
            e.target.value = '';
            this.context.toastPush('failure', 'file-large');
        } else if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = ((e) => {
                    this.setState({
                        mediaUpload: true,
                        fileName: file.name,
                        imgPreview: e.target.result,
                        mediaLink: null,
                        file: file,
                        removeable: true
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
                        file: file,
                        removeable: true
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
                file: null,
                removeable: true
            });
        } else {
            if (link === "") {
                this.setState({
                    mediaLink: null,
                    removeable: false
                });
            } else {
                this.setState({
                    mediaLink: null,
                    removeable: true
                });
            }
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

    handleBeforeUnload(e) {
        e.preventDefault();
        return e.returnValue = "Your post is still submitting. Are you sure you want to exit?";
    }

    clickMediaUpload() {
        this.setState({
            mediaUpload: true,
            mediaLink: null,
            removeable: false
        });
    }

    clickMediaLink() {
        this.setState({
            mediaUpload: false,
            imgPreview: null,
            fileName: 'Select A File',
            file: null,
            removeable: false
        }, () => {
            this.videoRef.current.classList.add('CreatePost-hide');
            this.videoRef.current.pause();
            this.videoRef.current.removeAttribute('src');
            this.videoRef.current.load();
        });
    }

    removeUpload() {
        this.setState({
            imgPreview: null,
            fileName: 'Select A File',
            file: null,
            removeable: false
        }, () => {
            this.videoRef.current.classList.add('CreatePost-hide');
            this.videoRef.current.pause();
            this.videoRef.current.removeAttribute('src');
            this.videoRef.current.load();
        });
    }

    removeLink() {
        this.setState({
            mediaLink: null,
            removeable: false
        }, () => document.getElementById('link').value = "");
    }

    bodyCheck(e) {
        var body = e.target.value;
        var newLines = body.match(/(\r\n|\n|\r)/g);
        var trueCount = body.length;
        if (newLines) trueCount += newLines.length;
        if (trueCount > 9999 && newLines) e.target.value = body.slice(0, 9999 - newLines.length);
        else if (trueCount > 9999) e.target.value = body.slice(0, 9999);
    }

    submit(e) {
        var titleElem;
        if (!this.props.ogPost) {
            titleElem = document.getElementById('title');
            if (!titleElem.checkValidity()) {
                titleElem.setCustomValidity('Your post requires a title.');
                return titleElem.reportValidity();
            }
        }
        const bodyElem = document.getElementById('body');
        if (!bodyElem.checkValidity()) {
            bodyElem.setCustomValidity('Your post requires a body.');
            return bodyElem.reportValidity();
        }
        const linkElem = document.getElementById('link');
        if (!linkElem.checkValidity()) {
            linkElem.setCustomValidity('Invalid link supplied.');
            return linkElem.reportValidity();
        }

        if (!this.state.submitting) {
            this.setState({
                submitting: true
            }, () => {
                window.addEventListener('beforeunload', this.handleBeforeUnload);

                var formData = new FormData();
                const title = (titleElem) ? titleElem.value : null;
                const subtitle = document.getElementById('subtitle').value;
                const body = bodyElem.value;
                const link = linkElem.value;
        
                if (title) formData.append('title', title);
                formData.append('subtitle', subtitle);
                formData.append('body', body);
                formData.append('link', link);
                formData.append('file', this.state.file);
                
                var fetchURL = '/create/post';

                if (this.props.ogPost) {
                    formData.append('id', this.props.ogId);
                    fetchURL = '/update/post';
                }
        
                fetch(fetchURL, {
                    method: 'POST',
                    body: formData
                })
                .then(resp => {
                    if (resp.ok) return resp.text();
                    else {
                        if (!this.props.ogPost) this.context.toastPush('failure', 'pc');
                        else this.context.toastPush('failure', 'pu');
                        this.setState({ submitting: false });
                    }
                })
                .then(data => {
                    var id = parseInt(data);
                    if (id) {
                        setTimeout(() => {
                            this.setState({
                                submitting: false
                            }, () => {
                                window.removeEventListener('beforeunload', this.handleBeforeUnload);
                                if (!this.props.ogPost) window.location.href = "/p/" + id + "?success=pc";
                                else window.location.href = "/p/" + id + "?success=pu";
                            });
                        }, 5000);
                    }
                })
                .catch(error => this.setState({
                    submitting: false
                }, () => {
                    if (!this.props.ogPost) this.context.toastPush('failure', 'pc');
                    else this.context.toastPush('failure', 'pu');
                    window.removeEventListener('beforeunload', this.handleBeforeUnload);
                }));
            });
        }
    }

    render() {
        // Update Specific Stuff
        var title = <input className='PostMain-title CreatePost-title' type="text" name="title" id="title" placeholder='Title* (Required, length 1-64)' required minLength="1" maxLength="64" onFocus={e => e.target.setCustomValidity('')} />;
        var titleLabel = (!this.props.ogPost) ? <label className="sr-only" htmlFor='title'>Title</label> : null;
        var cancel;
        var updateText = "";
        var mediaAllText = "";
        var mediaContainText = "";
        var mediaTopUpdate = "";
        var cardsText = "";
        // For Update, if a post is  given
        if (this.props.ogPost) {
            title = <h2 className='PostMain-title'>{he.decode(this.props.ogPost.title)}</h2>;
            cancel = <div className='PostMain-optionItem' onClick={() => this.props.updateMode(false)}>Cancel Update</div>;
            updateText = " Update";
            mediaTopUpdate = " CreatePost-mediaTopUpdate";
            if (this.props.fromPost.type === "TEXT") {
                mediaAllText = " CreatePost-mediaAllText";
                mediaContainText = " CreatePost-containerText";
                cardsText = " CreatePost-cardsText";
            }
        } else {
            document.title = "Create a Post";
        }

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

        var crossClass = '';
        var pathClass = 'CreatePost-pathClass';
        var crossColor = 'var(--info-grey)';
        if (this.state.removeable) {
            crossClass = ' CreatePost-remove';
            crossColor = 'var(--spritan-red)';
        }
        if (this.state.mediaUpload) {
            file = (
                <div className="CreatePost-item">
                    <label className='CreatePost-file' htmlFor="file">{this.state.fileName}</label>
                    <input className='CreatePost-fileIn' type="file" name="file" id="file"
                        onChange={this.handleFile}
                        accept="video/mp4, video/webm, image/png, image/jpeg, image/gif" />
                    <div className={'CreatePost-iconWrapper' + crossClass} onClick={this.removeUpload}>
                        <CrossIcon title='Remove File' stroke={crossColor} pathClass={pathClass} />
                    </div>
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
                    <input className='CreatePost-link' type="text" name="link" id="link" pattern={regex_video} onChange={this.handleLink} placeholder="Enter Link Here" onFocus={e => e.target.setCustomValidity('')} />
                    <div className={'CreatePost-iconWrapper' + crossClass} onClick={this.removeLink}>
                        <CrossIcon title='Remove Link' stroke={crossColor} pathClass={pathClass} />
                    </div>
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

        var topInfo = (this.state.mediaUpload) ? "Drag Or Select A File (Optional)" : "Enter A Valid Link Above (Optional)";
        var bottomInfo = (this.state.mediaUpload) ? 'You Can Upload Up To 20MB: ".mp4", ".webm", ".png", ".jpeg", or ".gif"' : 'You Can Link YouTube Videos';
        const previewInfo = (!this.state.file && !this.state.mediaLink) ? (
                <div className='CreatePost-previewInfo'>
                    <span className='CreatePost-info'>{topInfo}</span>
                    <span className='CreatePost-info'>{bottomInfo}</span>
                </div>
        ) : null;

        const previewContainer = (
            <div className='CreatePost-previewContainer'>
                <video className='CreatePost-videoElem CreatePost-hide' controls ref={this.videoRef} />
                {this.state.mediaLink}
                {imgPreview}
                {previewInfo}
            </div>
        );

        var typeText = "Text Post" + updateText;
        if (this.state.file && this.state.imgPreview) typeText = "Picture Post" + updateText;
        else if (this.state.file || this.state.mediaLink) typeText = "Video Post" + updateText;
        var submitText = (this.state.submitting) ? `Submitting ${typeText}...` : `Submit ${typeText}`;

        const cover = (this.state.submitting) ? " LoadingCover-anim" : "";

        return (
            <div className="CreatePost">
                <div className='PostMain-container CreatePost-container'>
                    <div className={'CreatePost-mediaAll' + mediaAllText} onDrop={this.handleDrop} onDragOver={this.handleDrag} onDragExit={this.handleDrag} ref={this.dropRef}>
                        <div className={'LoadingCover' + cover}></div>
                        <div className={'CreatePost-mediaTop' + mediaTopUpdate}>
                            {fileLink}
                            {file}
                            {link}
                        </div>
                        <div className={'PostMain-mediaContainer CreatePost-mediaContainer' + mediaContainText} >
                            {previewContainer}
                        </div>
                    </div>
                    <div className={'PostMain-cards' + cardsText}>
                        <div className='PostMain-postOption'>
                            <div id='CreatePost-post' className='PostMain-post CreatePost-post'>
                                <div className={'LoadingCover' + cover}></div>
                                {titleLabel}
                                {title}
                                <div className='PostMain-info'>
                                    <a href={`/u/${username}`} title={'@' + username} className="PostMain-a" tabIndex="-1">
                                        <div className="PostMain-user">
                                            <img className="PostMain-img" src={avatar}
                                            alt="User icon" />
                                            <span className="PostMain-nickname">{nickname}</span>
                                        </div>
                                    </a>
                                </div>
                                {this.props.controls}
                                <label className="sr-only" htmlFor='subtitle'>Subtitle</label>
                                <input className='PostMain-subtitle CreatePost-subtitle' type="text" name="subtitle" id="subtitle" maxLength="32" placeholder='Subtitle (Optional, length 1-32)' />
                                <label className="sr-only" htmlFor='body'>Body</label>
                                <textarea className='PostMain-body CreatePost-body' name="body" id="body" rows="6" cols="100" placeholder='Body* (Required, length 1-10000)' required minLength="1" onChange={this.bodyCheck} onFocus={e => e.target.setCustomValidity('')} />
                            </div>
                        </div>
                        <div className='PostMain-option CreatePost-optionContainer'>
                            <div className={'LoadingCover' + cover}></div>
                            <div className='PostMain-optionItem' onClick={this.submit}>{submitText}</div>
                            {cancel}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

CreatePost.contextType = AppContext;
