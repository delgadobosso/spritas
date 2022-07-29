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

                        case "login":
                            msg = "Successfully logged in. Welcome!";
                            break;

                        case "logout":
                            msg = "Logged out. Bye!";
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

                        case 'user-edit':
                            msg = 'Successfully updated your profile.';
                            break;

                        case 'user-ban':
                            msg = 'User successfully banned.';
                            break;

                        case 'user-unban':
                            msg = 'User successfully unbanned.';
                            break;

                        case 'user-block':
                            msg = 'User successfully blocked.';
                            break;

                        case 'user-unblock':
                            msg = 'User successfully unblocked.';
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

                            case 'user-report':
                                msg = 'User reported to the Admins.';
                                break;

                            default:
                                break;
                        }
                        break;

                    case "failure":
                        classStatus = " Toast-failure";
                        switch(toast.event) {
                            case 'login':
                                msg = 'Wrong username or password. Please try again.';
                                break;

                            case 'login-error':
                                msg = 'An error has occurred. Please try again.';

                            case 'pc':
                                msg = 'Failed to create post. Please try again.';
                                break;

                            case 'file-large-20':
                                msg = 'The file you selected is too large. It must be 20 MB or less.';
                                break;

                            case 'file-large-1':
                                msg = 'The file you selected is too large. It must be 1 MB or less.';
                                break;

                            case 'pu':
                                msg = 'Failed to update post. Please try again.';
                                break;

                            case 'cr':
                                msg = 'Failed to reply. Please try again.';
                                break;

                            case 'rp':
                                msg = 'Failed to report post. Please try again or contact an Admin directly.';
                                break;

                            case 'rr':
                                msg = 'Failed to report reply. Please try again or contact an Admin directly.';
                                break;

                            case 'dp':
                                msg = 'Failed to delete post. Please try again.';
                                break;

                            case 'dr':
                                msg = 'Failed to delete reply. Please try again.';
                                break;

                            case 'user-change':
                                msg = 'No changes made.';
                                break;

                            case 'user-time':
                                msg = 'You must wait 5 minutes from when you last updated your profile.';
                                break;

                            case 'user-ban':
                                msg = 'Failed to ban user. Please try again.';
                                break;

                            case 'user-unban':
                                msg = 'Failed to unban user. Please try again.';
                                break;

                            case 'user-block':
                                msg = 'Failed to block user. Please try again.';
                                break;

                            case 'user-unblock':
                                msg = 'Failed to unblock user. Please try again.';
                                break;

                            case 'user-report':
                                msg = 'Failed to report user. Please try again or contact an Admin directly.';
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