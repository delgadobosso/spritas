import React from 'react';
import './Reply.css';
import pfp from '../images/pfp.png';

export default class Reply extends React.Component {
    constructor(props) {
        super(props);
        this.expand = this.expand.bind(this);
        this.submit = this.submit.bind(this);
        this.state = ({
            open: false,
            submitting: false
        });
    }

    expand() {
        this.setState(state => ({
            open: !state.open
        }), () => {
            if (this.state.open) {
                const id = (this.props.id) ? this.props.id : "";
                document.getElementById(`reply${id}`).focus();
            }
        });
    }

    submit() {
        if (!this.state.submitting) {
            this.setState({ submitting: true }, () => {
                const id = (this.props.id) ? this.props.id : "";

                var myBody = new URLSearchParams();
                const reply = document.getElementById(`reply${id}`).value;
                myBody.append('id', id);
                myBody.append('reply', reply);
        
                var urlForm
        
                fetch('/create/reply', {
                    method: 'POST',
                    body: myBody
                })
                .then(resp => {
                    if (resp.ok) return resp.text();
                })
                .then(data => {
                    setTimeout(() => {
                        this.setState({
                            submitting: false,
                            open: false
                        }, () => {
                            document.getElementById(`reply${id}`).value = "";
                            this.props.reload();
                        });
                    }, 3000);
                })
                .catch(error => this.setState({ submitting: false }));
            })
        }
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

        var submitText = (this.state.submitting) ? "Sending..." : "Send";

        const cover = (this.state.submitting) ? " LoadingCover-anim" : "";

        return (
            <div className="Reply">
                {expand}
                <div className={"Reply-form" + open}>
                    <div className={'LoadingCover' + cover}></div>
                    <img className="Reply-img" src={avatar} alt="You" />
                    <textarea className="Reply-text" name="reply" id={`reply${id}`} rows="6" required placeholder={placeholder} />
                    <input className="Reply-submit" type="submit" value={submitText} onClick={this.submit} />
                </div>
            </div>
        )
    }
}