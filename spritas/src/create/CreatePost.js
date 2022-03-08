import './CreatePost.css';
import { regex_video } from '../functions/constants';
import React from 'react';

export default class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.handleImg = this.handleImg.bind(this);
        this.state = { imgPreview: null };
    }

    handleImg(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        if (!file.type.startsWith('image/')) return;
    
        reader.onload = ((e) => { this.setState({ imgPreview: e.target.result }); });
        reader.readAsDataURL(file);
    }

    render() {
        document.title = "Create a Post - The Spritas";
        const id = this.props.match.params.id;
        const type = new URLSearchParams(new URL(window.location.href).search).get('type');

        const link = (type === "VIDO") ?
        <div className="CreatePost-item">
            <label htmlFor="link">Link: </label>
            <input type="text" name="link" id="link" required pattern={regex_video} />
        </div> : <input type="hidden" name="link" id="link" value="null" />;

        const file = (type === "IMG") ?
        <div className="CreatePost-item">
            <label htmlFor="file">File: </label>
            <input type="file" name="file" id="file" required
                onChange={this.handleImg}
                accept="image/png, image/jpeg, image/gif" />
        </div> : <input type="hidden" name="file" id="file" value="null" />;
        const imgPreview = (type === "IMG") ?
        <img className="CreatePost-imgPreview" src={this.state.imgPreview} alt="Preview" /> : null;

        const enctype = (type === "IMG") ? "multipart/form-data" : null;

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
                    {link}
                    {file}
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