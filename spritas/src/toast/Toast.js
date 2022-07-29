import React from 'react';
import './Toast.css';

export default class Toast extends React.Component {
    constructor(props) {
        super(props);
        this.dismiss = this.dismiss.bind(this);
        this.state = {
            notifs: []
        };
    }

    componentDidMount() {
        var url = new URL(window.location.href);
        var params = new URLSearchParams(url.search);
        var newParams = new URLSearchParams();
        var notifs = [];
        params.forEach((value, key) => {
            var msg = "";
            var classStatus = "";
            var skip = false;
            switch(key) {
                case "success":
                    classStatus = " Toast-success";
                    switch(value) {
                        case "register":
                            msg = "Email verification sent. Please click the link in that email to complete the registration process.";
                            break;

                        case "email-verify":
                            msg = "Email verification complete. You may now log in to your account.";
                            break;

                        case "pc":
                            msg = "Post created.";
                            break;

                        case "pu":
                            msg = "Post updated.";
                            break;

                        case "dp":
                            msg = 'Post deleted.';
                            break;
                        
                        default:
                            skip = true;
                            newParams.append(key, value);
                            break;
                    }
                    break;

                case "failure":
                    classStatus = " Toast-failure";
                    switch(value) {
                        case 'email-verify':
                            msg = 'Failed to verify email. Please start the registration process again.';
                            break;

                        default:
                            break;
                    }
                    break;

                default:
                    skip = true;
                    newParams.append(key, value);
                    break;
            }
            if (!skip) {
                var notif = <div className={'Toast-notif' + classStatus} onClick={this.dismiss}>{msg}</div>;
                notifs.push(notif);
            }
        });
        this.setState(state => ({ notifs: [...state.notifs, notifs] }));
        const historyObj = window.history.state;
        var resParams = (newParams.toString() !== "") ? '?' + newParams.toString() : '';
        const newUrl = window.location.pathname + resParams;
        window.history.replaceState(historyObj, '', newUrl);
    }

    componentDidUpdate() {
        if (this.props.notifs && this.props.notifs.length > 0) {
            var notifs = [];
            this.props.notifs.forEach(toast => {
                var msg = "";
                var classStatus = "";
                switch(toast.success) {
                    case "success":
                        classStatus = " Toast-success";
                        switch(toast.event) {
                            case "cr":
                                msg = 'Reply posted.';
                                break;

                            case "rp":
                                msg = 'Post reported to the Admins.';
                                break;

                            case "rr":
                                msg = 'Reply reported to the Admins.';
                                break;

                            case "dr":
                                msg = 'Reply deleted.';
                                break;

                            default:
                                break;
                        }
                        break;

                    case "failure":
                        classStatus = " Toast-failure";
                        switch(toast.event) {
                            case 'pc':
                                msg = 'Failed to create post. Try again.';
                                break;

                            case 'pu':
                                msg = 'Failed to update post. Try again.';
                                break;

                            case 'cr':
                                msg = 'Failed to reply. Try again.';
                                break;

                            case 'rp':
                                msg = 'Failed to report post. Try again or contact an Admin directly.';
                                break;

                            case 'rr':
                                msg = 'Failed to report reply. Try again or contact an Admin directly.';
                                break;

                            case 'dp':
                                msg = 'Failed to delete post. Try again.';
                                break;

                            case 'dr':
                                msg = 'Failed to delete reply. Try again.';
                                break;

                            default:
                                break;
                        }
                        break;

                    default:
                        break;
                }
                var notif = <div className={'Toast-notif' + classStatus} onClick={this.dismiss}>{msg}</div>;
                notifs.push(notif);
            })
            this.setState(state => ({ notifs: [...state.notifs, notifs] }));
            this.props.toastClear();
        }
    }

    dismiss(e) {
        var animations = e.target.getAnimations().map(animation => animation.cancel());
        if (animations.length === 0) {
            var dismissed = e.target.animate([
                { opacity: 1 },
                { opacity: 0 }
            ], { duration: 120, fill: 'forwards' });
            dismissed.onfinish = () => {
                var shrink = e.target.animate([
                    { height: e.target.offsetHeight + 'px',
                        padding: '15px',
                        marginBottom: '10px',
                        border: '5px solid' },
                    { height: '0px',
                        padding: '0px',
                        marginBottom: '0px',
                        border: '0px solid' }
                ], { duration: 250, fill: 'forwards', easing: 'ease-out' });
                shrink.onfinish = () => e.target.remove();
            }
        }
    }

    render() {
        return (
            <div className='Toast'>
                {this.state.notifs}
            </div>
        );
    }
}