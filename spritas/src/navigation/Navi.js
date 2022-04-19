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

        var avatar;
        var userItem;
        var logout;
        if (user) {
            avatar = (user.avatar) ? `/media/avatars/${user.avatar}` : pfp;
            userItem = <a className="Navi-item" href={"/user/" + user.id}>{user.nickname}</a>;
            logout = <a className="Navi-item" href="/logout">Logout</a>;
        } else {
            avatar = pfp;
            userItem = <a className="Navi-item" href="/login">Login</a>;
        }
        var open = (this.state.open) ? " Navi-open" : "";
        var hide = (this.props.hide && !this.state.open) ? " Navi-hide" : "";

        return (
            <div className="Navi-full">
                <div className={"Navi-backing" + (this.state.open ? " Navi-backing-open" : "")}
                onClick={this.toggleClick} />
                <div className={"Navi" + open + hide}>
                    <div className="Navi-toggle" onClick={this.toggleClick}>
                        <img className="Navi-img" src={avatar} alt="Navigation" />
                    </div>
                    {userItem}
                    {logout}
                </div>
            </div>
        )
    }
}