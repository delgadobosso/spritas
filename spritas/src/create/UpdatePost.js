import React from 'react';
import './UpdatePost.css';
import { regex_video } from '../functions/constants';

export default class UpdatePost extends React.Component {
    constructor(props) {
        super(props);
        this.expand = this.expand.bind(this);
        this.state = ({ open: false });
    }

    expand() { this.setState(state => ({ open: !state.open })); }

    render() {
        const id = (this.props.post) ? this.props.post.id : null;
        const type = (this.props.post) ? this.props.post.type : null;

        const expand = (this.state.open) ?
        <div className="UpdatePost-expand" onClick={this.expand}>Close</div> :
        <div className="UpdatePost-expand" onClick={this.expand}>Update Post</div>;
        var open = (this.state.open) ? " UpdatePost-form-open" : "";

        const link = (type === "VIDO") ?
        <div className="CreatePost-item">
            <label htmlFor="link">Link: </label>
            <input type="text" name="link" id="link" required pattern={regex_video} />
        </div> : <input type="hidden" name="link" id="link" value="null" />;

        return (
            <div className="UpdatePost">
                {expand}
                <form action="/update/post/" className={"UpdatePost-form" + open} method="POST">
                    <input type="hidden" name="id" id="id" value={id} />
                    {link}
                    <textarea className="Reply-text" name="body" id="body" rows="6" cols="100" required />
                    <input className="Reply-submit" type="submit" value="Update" />
                </form>
            </div>
        )
    }
}