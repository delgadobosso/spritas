import React from 'react';
import './Navi.css';
import pfp from '../images/pfp.png'

export default class Navi extends React.Component {
    constructor(props) {
        super(props);
        this.toggleClick = this.toggleClick.bind(this);
        this.hashHandle = this.hashHandle.bind(this);
        this.state = {
            open: false
        };
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashHandle);
    }

    toggleClick() {
        this.setState(state => ({
            open: !state.open
        }), () => {
            if (this.state.open && window.location.hash !== "#navi") {
                var prevState = window.history.state;
                window.history.pushState(prevState, "", "#navi");
                window.history.scrollRestoration = 'manual';
            } else if (!this.state.open) window.history.go(-1);
            window.navigator.vibrate(10);
        });
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashHandle);
    }

    hashHandle(e) {
        if (e.oldURL.split('#')[1] === 'navi') {
            this.setState({
                open: false
            });
        } else if (e.newURL.split('#')[1] === 'navi') {
            this.setState({
                open: true
            });
        }
    }

    render() {
        const user = this.props.user;

        var itemOpen = (this.state.open) ? " Navi-itemOpen" : "";

        var home = <a className={"Navi-item" + itemOpen} href="/home">Home</a>;
        var avatarLink;
        var userItem;
        var admin;
        var createPost;
        var logout;
        if (user) {
            if (user.avatar) avatarLink = `/media/avatars/${user.avatar}`;
            userItem = <a className={"Navi-item" + itemOpen} href={"/u/" + user.username}>{user.nickname} (@{user.username})</a>;
            if (user.type === "ADMN") admin = <a className={"Navi-item" + itemOpen} href="/admin">Admin Portal</a>
            createPost = (user.type !== "BAN") ? <a className={"Navi-item" + itemOpen} href="/create/post">Create Post</a> : null;
            logout = <a className={"Navi-item" + itemOpen} href="/logout">Logout</a>;
        } else {
            avatarLink = pfp;
            userItem = <a className={"Navi-item" + itemOpen} href="/login">Login / Register</a>;
        }

        var avatar = (this.props.sessionChecked) ? <img className="Navi-img" src={avatarLink} alt="Navigation" /> : null;

        var open = (this.state.open) ? " Navi-open" : "";
        var hide = (this.props.hide && !this.state.open) ? " Navi-hide" : "";
        var avatarOpen = (this.state.open) ? " Navi-toggleOpen" : "";

        return (
            <div className="Navi-full">
                <div className={"Navi-backing" + (this.state.open ? " Navi-backing-open" : "")}
                onClick={this.toggleClick} />
                <div className={"Navi" + open + hide}>
                    <div className={"Navi-toggle" + avatarOpen} onClick={this.toggleClick}>
                        {avatar}
                    </div>
                    {home}
                    {userItem}
                    {admin}
                    {createPost}
                    {logout}
                </div>
            </div>
        )
    }
}