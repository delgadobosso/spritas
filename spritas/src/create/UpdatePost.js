import React from 'react';
import './UpdatePost.css';
import { regex_video } from '../functions/constants';

export default class UpdatePost extends React.Component {
    constructor(props) {
        super(props);
        this.expand = this.expand.bind(this);
        this.handleImg = this.handleImg.bind(this);
        this.delete = this.delete.bind(this);
        this.state = ({
            open: false,
            imgPreview: null
        });
    }

    expand() { this.setState(state => ({ open: !state.open })); }

    handleImg(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        if (!file.type.startsWith('image/')) return;
    
        reader.onload = ((e) => { this.setState({ imgPreview: e.target.result }); });
        reader.readAsDataURL(file);
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

        const link = (type === "VIDO") ?
        <div className="CreatePost-item">
            <label htmlFor="link">Link: </label>
            <input type="text" name="link" id="link" required pattern={regex_video} />
        </div> : <input type="hidden" name="link" id="link" value="null" />;

        const file = (type === "IMG") ?
        <div className='CreatePost-item'>
            <label htmlFor="file">File: </label>
            <input type="file" name="file" id="file" required
                onChange={this.handleImg}
                accept="image/png, image/jpeg, image/gif" />
        </div> : <input type="hidden" name="file" id="file" value="null" />;
        const imgPreview = (type === "IMG") ?
        <img className="CreatePost-imgPreview" src={this.state.imgPreview} alt="Preview" /> : null;

        const enctype = (type === "IMG") ? "multipart/form-data" : null;

        return (
            <div className="UpdatePost">
                <div className='UpdatePost-controls'>{controls}</div>
                <form action="/update/post/" className={"UpdatePost-form" + open} 
                    method="POST" encType={enctype}>
                    <input type="hidden" name="id" id="id" value={id} />
                    {link}
                    {file}
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