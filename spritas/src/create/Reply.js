import React from 'react';
import './Reply.css';
import pfp from '../images/pfp.png';

export default class Reply extends React.Component {
    constructor(props) {
        super(props);
        this.expand = this.expand.bind(this);
        this.state = ({ open: false });
    }

    expand() {
        this.setState(state => ({
            open: !state.open
        }), () => {
            if (this.state.open) {
                // document.getElementById('reply').focus();
            }
        });
    }

    render() {
        const id = (this.props.id) ? this.props.id : "";

        var avatar = (this.props.user && this.props.user.avatar) ? `/media/avatars/${this.props.user.avatar}` : pfp;

        var expand = (this.state.open) ?
        <div className="Reply-expand" onClick={this.expand}>Close</div> :
        <div className="Reply-expand" onClick={this.expand}>Reply</div>;
        var open = (this.state.open || this.props.main) ? " Reply-form-open" : "";

        var placeholder = "Reply";
        if (this.props.main) {
            expand = null;
            placeholder = "Comment";
        }

        return (
            <div className="Reply">
                {expand}
                <form action="/create/reply" className={"Reply-form" + open} method="POST">
                    <img className="Reply-img" src={avatar} alt="You" />
                    <input type="hidden" name="id" id="id" value={id} />
                    <textarea className="Reply-text" name="reply" id="reply" rows="6" required placeholder={placeholder} />
                    <input className="Reply-submit" type="submit" value="Send" />
                </form>
            </div>
        )
    }
}