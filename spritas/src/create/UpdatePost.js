import React from 'react';
import './UpdatePost.css';
import { regex_video } from '../functions/constants';
import he from 'he';

export default class UpdatePost extends React.Component {
    constructor(props) {
        super(props);
        this.expand = this.expand.bind(this);
        this.handleImg = this.handleImg.bind(this);
        this.handleLink = this.handleLink.bind(this);
        this.clickVideoLink = this.clickVideoLink.bind(this);
        this.clickVideoUp = this.clickVideoUp.bind(this);
        this.videoRef = React.createRef();
        this.delete = this.delete.bind(this);
        this.state = ({
            open: false,
            imgPreview: null,
            videoUp: true,
            vidLink: null,
            fileName: 'Select File'
        });
    }

    expand() {
        this.setState(state => ({ open: !state.open }));
    }

    handleImg(e) {
        const file = e.target.files[0];

        // Check file size
        if (file.size > 20971520) {
            e.target.value = '';
            alert('The file you selected is too large. Image must be 20 MB or less.');
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
                <iframe width="640" height="360"
                    className='CreatePost-vidLinkPreview'
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

    delete() {
        const post = (this.props.currentPost) ? this.props.currentPost : null;
        var answer = prompt(`Are you sure you want to delete this post?\nType "${this.props.post.title}" to confirm:`, '');
        if (answer === this.props.post.title) {
            var myBody = new URLSearchParams();
            myBody.append('ogid', this.props.post.id);
            myBody.append('currentid', post.id);

            fetch('/delete/post', {
                method: 'POST',
                body: myBody
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/';
                else alert('Post deletion error');
            });
        } else if (answer !== null) alert(`Value incorrect. Post not deleted.`);
    }

    render() {
        const id = (this.props.post) ? this.props.post.id : null;
        const type = (this.props.post) ? this.props.post.type : null;

        var controls = [];
        var open = (this.state.open) ? " UpdatePost-form-open" : "";
        if (this.state.open) controls.push(<div className="UpdatePost-controlItem" onClick={this.expand} key='0'>Close</div>);
        else controls.push(<div className="UpdatePost-controlItem" onClick={this.expand} key='0'>Update Post</div>);
        controls.push(<div className='UpdatePost-controlItem UpdatePost-delete' onClick={this.delete} key='1'>Delete Post</div>);

        var fileLink;
        if (type === "VIDO" && this.state.videoUp) {
            fileLink = (
                <div className='CreatePost-options'>
                    <span className='CreatePost-option CreatePost-selected'>Video Upload</span>
                    <span className='CreatePost-option' onClick={this.clickVideoLink}>Video Link</span>
                </div>
            );
        } else if (type === "VIDO" && !this.state.videoUp) {
            fileLink = (
                <div className='CreatePost-options'>
                    <span className='CreatePost-option' onClick={this.clickVideoUp}>Video Upload</span>
                    <span className='CreatePost-option CreatePost-selected'>Video Link</span>
                </div>
            );
        }

        var file = <input type="hidden" name="file" id="file" value="null" />;
        var link = <input type="hidden" name="link" id="link" value="null" />;
        if (type === "VIDO" && this.state.videoUp) {
            file = (
            <div className="CreatePost-item">
                <label className='CreatePost-file' htmlFor="file">{this.state.fileName}</label>
                <input className='CreatePost-fileIn' type="file" name="file" id="file"
                    onChange={this.handleImg}
                    accept="video/mp4, video/webm" />
            </div>);
        } else if (type === "VIDO" && !this.state.videoUp) {
            link = (
            <div className="CreatePost-item">
                <input className='CreatePost-link' type="text" name="link" id="link" pattern={regex_video} onChange={this.handleLink} placeholder="Enter Link Here" />
            </div>);
        } else if (type === "IMG") {
            file = (
            <div className="CreatePost-item">
                <label htmlFor="file">File: </label>
                <input type="file" name="file" id="file" required
                    onChange={this.handleImg}
                    accept="image/png, image/jpeg, image/gif" />
            </div>);
        }

        const imgPreview = (type === "IMG" && this.state.imgPreview) ?
        <img className="CreatePost-imgPreview" src={this.state.imgPreview} alt="Preview" /> : null;

        const enctype = (type === "IMG" || this.state.videoUp) ? "multipart/form-data" : null;

        return (
            <div className="UpdatePost">
                <div className='UpdatePost-controls'>{controls}</div>
                <form action="/update/post/" className={"UpdatePost-form" + open} 
                    method="POST" encType={enctype}>
                    <input type="hidden" name="id" id="id" value={id} />
                    {fileLink}
                    {file}
                    {link}
                    <div className='CreatePost-videoContainer'>
                        <video className='CreatePost-hide' controls ref={this.videoRef} width="640" height="360" />
                        {this.state.vidLink}
                    </div>
                    {imgPreview}
                    <div className="CreatePost-item">
                        <label htmlFor="subtitle">Subtitle: </label>
                        <input type="text" name="subtitle" id="subtitle" maxLength="30" />
                    </div>
                    <textarea className="Reply-text" name="body" id="body" rows="6" cols="100" required />
                    <input className="Reply-submit" type="submit" value="Update" />
                </form>
            </div>
        )
    }
}