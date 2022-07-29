import React from 'react';
import './CreateReply.css';
import pfp from '../images/pfp.png';

import { AppContext } from '../contexts/AppContext';

export default class CreateReply extends React.Component {
    constructor(props) {
        super(props);
        this.expand = this.expand.bind(this);
        this.bodyCheck = this.bodyCheck.bind(this);
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

    bodyCheck(e) {
        var body = e.target.value;
        var newLines = body.match(/(\r\n|\n|\r)/g);
        var trueCount = body.length;
        if (newLines) trueCount += newLines.length;
        if (trueCount > 2499 && newLines) e.target.value = body.slice(0, 2499 - newLines.length);
        else if (trueCount > 2499) e.target.value = body.slice(0, 2499);
    }

    submit() {
        const id = (this.props.id) ? this.props.id : "";

        const bodyElem = document.getElementById(`reply${id}`);
        if (!bodyElem.checkValidity()) {
            bodyElem.setCustomValidity('Your message requires text.');
            return bodyElem.reportValidity();
        }

        if (!this.state.submitting) {
            this.setState({
                submitting: true,
                open: false
            }, () => {
                var myBody = new URLSearchParams();
                const reply = bodyElem.value;
                myBody.append('id', id);
                myBody.append('reply', reply);
        
                fetch('/create/reply/' + this.props.target, {
                    method: 'POST',
                    body: myBody
                })
                .then(resp => {
                    if (resp.ok) return resp.text();
                    else this.context.toastPush('failure', 'cr');
                })
                .then(data => {
                    setTimeout(() => {
                        this.setState({
                            submitting: false
                        }, () => {
                            this.context.toastPush('success', 'cr');
                            document.getElementById(`reply${id}`).value = "";
                            this.props.reload();
                        });
                    }, 1000);
                })
                .catch(error => {
                    this.context.toastPush('failure', 'cr');
                    this.setState({ submitting: false });
                });
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
        if (this.state.submitting) expand = <div className="Reply-expand" onClick={this.expand}>Sending...</div>

        var placeholder = "Reply";
        if (this.props.main) {
            expand = null;
            placeholder = "Reply to Post";
        }

        var submitText = (this.state.submitting) ? "Sending..." : "Send";

        const cover = (this.state.submitting) ? " LoadingCover-anim" : "";

        return (
            <div className="Reply">
                <div className={'LoadingCover' + cover}></div>
                {expand}
                <div className={"Reply-form" + open}>
                    <img className="Reply-img" src={avatar} alt="You" />
                    <label className="sr-only" htmlFor={`reply${id}`}>Reply</label>
                    <textarea className="Reply-text" name="reply" id={`reply${id}`} rows="6" required placeholder={placeholder} onChange={this.bodyCheck} onFocus={e => e.target.setCustomValidity('')} />
                    <input className="Reply-submit" type="submit" value={submitText} onClick={this.submit} />
                </div>
            </div>
        )
    }
}

CreateReply.contextType = AppContext;
