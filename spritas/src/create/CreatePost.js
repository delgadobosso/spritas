import './CreatePost.css';
import { regex_video } from '../functions/constants';
import React from 'react';

export default class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.handleImg = this.handleImg.bind(this);
        this.canvasRef = React.createRef();
        this.videoRef = React.createRef();
        this.state = {
            imgPreview: null,
            videoUp: false
        };
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
                reader.onload = ((e) => { this.setState({ imgPreview: e.target.result }); });
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.videoRef.current.src = e.target.result;
                    this.videoRef.current.load()
                }
                reader.readAsDataURL(file);
            }
        }
    }

    render() {
        document.title = "Create a Post - The Spritas";
        const id = this.props.match.params.id;
        const type = new URLSearchParams(new URL(window.location.href).search).get('type');

        const link = (type === "VIDO") ?
        <div className="CreatePost-item">
            <label htmlFor="link">Link: </label>
            <input type="text" name="link" id="link" pattern={regex_video} />
        </div>
        : <input type="hidden" name="link" id="link" value="null" />;

        const videoFile = (type === "VIDO") ?
        <div className="CreatePost-item">
            <label htmlFor="videoFile">Video File: </label>
            <input type="file" name="videoFile" id="videoFile"
                onChange={this.handleImg}
                accept="video/mp4, video/webm" />
        </div>
        : <input type="hidden" name="videoFile" id="videoFile" value="null" />;

        const file = (type === "IMG") ?
        <div className="CreatePost-item">
            <label htmlFor="file">File: </label>
            <input type="file" name="file" id="file" required
                onChange={this.handleImg}
                accept="image/png, image/jpeg, image/gif" />
        </div> : <input type="hidden" name="file" id="file" value="null" />;
        const imgPreview = (type === "IMG" && this.state.imgPreview) ?
        <img className="CreatePost-imgPreview" src={this.state.imgPreview} alt="Preview" /> : null;

        const enctype = (type === "IMG" || this.state.videoUp) ? "multipart/form-data" : null;

        return (
            <div className="CreatePost">
                <form action="/create/post/" className="CreatePost-form" method="POST"
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
                    {videoFile}
                    {link}
                    {file}
                    <video controls ref={this.videoRef} width="640" height="360" loop muted />
                    {imgPreview}
                    <div className="CreatePost-item">
                        <label htmlFor="body">Body: </label>
                        <textarea name="body" id="body" rows="6" cols="100" required />
                    </div>
                    <div className="CreatePost-item">
                        <input type="submit" value="Post" />
                    </div>
                </form>
            </div>
        )
    }
}