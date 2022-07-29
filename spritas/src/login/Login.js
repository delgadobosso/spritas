import React from 'react';
import './Login.css';

import { AppContext } from '../contexts/AppContext';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.tooltipAdd = this.tooltipAdd.bind(this);
        this.tooltipRemove = this.tooltipRemove.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handleNickname = this.handleNickname.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleEmail = this.handleEmail.bind(this);
        this.usernameCheck = this.usernameCheck.bind(this);
        this.inputCompare = this.inputCompare.bind(this);
        this.login = this.login.bind(this);
        this.state = {
            userAvail: "",
            userChecking: false,
            userCheckId: null,
            emailAvail: "",
            emailChecking: false,
            emailCheckId: null,
            registering: false,
            logginIn: false
        }
    }
    
    tooltipAdd(tip) {
        const tooltip = document.getElementById(tip);
        if (tooltip) tooltip.classList.add('Tooltip-on');
    }
    
    tooltipRemove(tip) {
        const tooltip = document.getElementById(tip);
        if (tooltip) tooltip.classList.remove('Tooltip-on');
    }
    
    handleUsername(e) {
        var input = e.target.value;
        // Only allow a-zA-Z0-9_
        e.target.value = input.slice(0, 16).replace(/[^\w]+/g, '');
    }
    
    handleNickname(e) {
        var input = e.target.value;
        // Only allow one whitespace, not multiple back to back
        e.target.value = input.trimStart().slice(0, 32).replace(/[\s]{2,}/g, " ");
        if (e.target.value !== "") e.target.classList.add('Login-inputValid');
        else e.target.classList.remove('Login-inputValid');
    }

    handlePassword(e) {
        const passConfirm = document.getElementById('pass-confirm');
        if (passConfirm) {
            passConfirm.value = "";
            passConfirm.setCustomValidity('');
            passConfirm.classList.remove('Login-inputValid');
            passConfirm.classList.remove('Login-inputInvalid');
        }
        if (e.target.checkValidity()) {
            e.target.classList.remove('Login-inputInvalid');
            e.target.classList.add('Login-inputValid');
        } else {
            e.target.classList.remove('Login-inputValid');
            e.target.classList.add('Login-inputInvalid');
        }
    }

    handleEmail() {
        const emailConfirm = document.getElementById('email-confirm');
        if (emailConfirm) {
            emailConfirm.value = "";
            emailConfirm.setCustomValidity('');
            emailConfirm.classList.remove('Login-inputValid');
            emailConfirm.classList.remove('Login-inputInvalid');
        }
    }
    
    usernameCheck() {
        var username = document.getElementById('register-username');
        if (username) {
            if (username.value !== "") {
                var myBody = new URLSearchParams();
                myBody.append('username', username.value);
        
                this.setState({ userChecking: true }, () => {
                    fetch('/login/usercheck', {
                        method: 'POST',
                        body: myBody
                    })
                    .then(resp => resp.text())
                    .then(data => {
                        if (data === "taken") this.setState({ userAvail: "taken" }, () => username.setCustomValidity('Username taken'));
                        else if (data === "free") this.setState({ userAvail: "free" }, () => username.setCustomValidity(''));
                        this.setState({ userChecking: false });
                    })
                    .catch(error => this.setState({ userChecking: false }));
                })
            } else this.setState({ userAvail: "" });
        }
    }

    emailCheck() {
        var email = document.getElementById('email');
        if (email) {
            if (email.value !== "") {
                var myBody = new URLSearchParams();
                myBody.append('email', email.value);
        
                this.setState({ emailChecking: true }, () => {
                    fetch('/login/emailcheck', {
                        method: 'POST',
                        body: myBody
                    })
                    .then(resp => resp.text())
                    .then(data => {
                        if (data === "taken") this.setState({ emailAvail: "taken" }, () => email.setCustomValidity('Email Already In Use'));
                        else if (data === "free") this.setState({ emailAvail: "free" }, () => email.setCustomValidity(''));
                        else if (data === "noemail") this.setState({ emailAvail: "noemail" });
                        this.setState({ emailChecking: false });
                    })
                    .catch(error => this.setState({ emailChecking: false }));
                })
            } else this.setState({ emailAvail: "" });
        }
    }

    inputCompare(e, other) {
        const compareTo = document.getElementById(other);
        if (compareTo) {
            if (!compareTo.checkValidity()) {
                e.target.value = "";
                compareTo.focus();
            } else if (e.target.value === "") {
                e.target.setCustomValidity('');
                e.target.classList.remove('Login-inputValid');
                e.target.classList.remove('Login-inputInvalid');
            } else if (e.target.value !== compareTo.value) {
                e.target.setCustomValidity('Fields Must Match');
                e.target.classList.remove('Login-inputValid');
                e.target.classList.add('Login-inputInvalid');
            } else {
                e.target.setCustomValidity('');
                e.target.classList.remove('Login-inputInvalid');
                e.target.classList.add('Login-inputValid');
            }
        }
    }

    submit(e) {
        e.preventDefault();
        if (this.state.userAvail === "free" && this.state.emailAvail === "free" && !this.state.registering && !this.state.logginIn) {
            this.setState({
                registering: true
            }, () => {
                var myBody = new URLSearchParams();
                const username = document.getElementById('register-username');
                const nickname = document.getElementById('nickname');
                const pass = document.getElementById('register-pass');
                const email = document.getElementById('email');
                myBody.append('username', username.value);
                myBody.append('nickname', nickname.value);
                myBody.append('pass', pass.value);
                myBody.append('email', email.value);

                fetch('/login/signup', {
                    method: "POST",
                    body: myBody
                })
                .then(resp => {
                    this.setState({ registering: false }, () => {
                        if (resp.ok) window.location.href = '/login?success=register';
                        else this.context.toastPush('failure', 'register');
                    });
                });
            })
        }
    }

    login(e) {
        e.preventDefault();
        if (!this.state.logginIn && !this.state.registering) {
            this.setState({
                logginIn: true
            }, () => {
                var myBody = new URLSearchParams();
                const username = document.getElementById('login-username');
                const pass = document.getElementById('login-pass');
                myBody.append('username', username.value);
                myBody.append('pass', pass.value);

                fetch('/login/signin', {
                    method: "POST",
                    body: myBody
                })
                .then(resp => {
                    this.setState({ logginIn: false }, () => {
                        if (resp.ok) window.location.href = '/home?success=login';
                        else if (resp.status === 400) this.context.toastPush('failure', 'login');
                        else this.context.toastPush('failure', 'login-error');
                    })
                })
                .catch(error => {
                    this.context.toastPush('failure', 'login-error');
                    this.setState({ logginIn: false });
                });
            });
        }
    }

    render() {
        document.title = "Login / Register";

        var usercheck;
        var userTaken;
        var userTakenClass = "";
        var userCover = "";
        if (!this.state.userChecking) {
            switch(this.state.userAvail) {
                case "taken":
                    userTaken = "Username Taken.";
                    userTakenClass = "Login-inputInvalid";
                    break;

                case "free":
                    userTaken = "Username Available.";
                    userTakenClass = "Login-inputValid";
                    break;
            }
        } else {
            userTaken = "Checking Availability...";
            userCover = " LoadingCover-anim";
        }

        var emailcheck;
        var emailTaken;
        var emailTakenClass = "";
        var emailCover = "";
        if (!this.state.emailChecking) {
            switch(this.state.emailAvail) {
                case "taken":
                    emailTaken = "Email Already In Use.";
                    emailTakenClass = "Login-inputInvalid";
                    break;

                case "free":
                    emailTaken = "Email Available To Use.";
                    emailTakenClass = "Login-inputValid";
                    break;

                case "noemail":
                    emailTaken = "Not A Valid Mail.";
                    emailTakenClass = "Login-inputInvalid";
            }
        } else {
            emailTaken = "Checking Availability...";
            emailCover = " LoadingCover-anim";
        }

        const regiCover = (this.state.registering) ? " LoadingCover-anim" : "";
        const loginCover = (this.state.logginIn) ? " LoadingCover-anim" : "";

        return(
            <div className="Login-forms">
                <form onSubmit={this.login} className="Login-form" method="POST">
                    <div className={'LoadingCover Login-cover' + loginCover}></div>
                    <h1 className="Login-title">Login</h1>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="username">Username</label>
                        <div className="Login-username">
                            <span className="Login-at">@ </span>
                            <input type="text" name="username" id="login-username" required autoCapitalize='off' placeholder="Username" onChange={this.handleUsername}></input>
                        </div>
                    </div>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="pass">Password</label>
                        <input type="password" name="pass" id="login-pass" required placeholder="Password"></input>
                    </div>
                    <div className="Login-item">
                        <input className="Login-submit" type="submit" value="Login"></input>
                    </div>
                </form>

                <form onSubmit={this.submit} className="Login-form Login-register" method="POST" autoComplete="off">
                    <div className={'LoadingCover Login-cover' + regiCover}></div>
                    <h1 className="Login-title">Register</h1>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="username">Username</label>
                        <div className="Login-username">
                            <span className="Login-at">@ </span>
                            <input className={userTakenClass} type="text" name="username" id="register-username" required maxLength="16" autoCapitalize='off' placeholder="Username" onChange={e => {
                                this.handleUsername(e);
                                if (e.target.value === "") {
                                    clearTimeout(this.state.userCheckId);
                                    clearTimeout(usercheck);
                                    this.setState({
                                        userChecking: false,
                                        userAvail: ""
                                    });
                                } else if (this.state.userChecking) {
                                    clearTimeout(this.state.userCheckId);
                                    clearTimeout(usercheck);
                                    usercheck = setTimeout(() => this.usernameCheck(), 2000);
                                } else {
                                    usercheck = setTimeout(() => this.usernameCheck(), 2000);
                                    this.setState({
                                        userChecking: true,
                                        userCheckId: usercheck
                                    });
                                }
                            }} onFocus={() => this.tooltipAdd('tip-username')} onBlur={() => this.tooltipRemove('tip-username')}></input>
                        </div>
                        <span id="tip-username" className="Tooltip">
                            <div className={'LoadingCover' + userCover}></div>
                            Unique, 16 Characters Max.<br></br>(a-z, A-Z, 0-9, "_")<br></br>{userTaken}
                        </span>
                    </div>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="nickname">Display Name</label>
                        <input type="text" name="nickname" id="nickname" maxLength="32" required autoCapitalize='off' placeholder="Display Name" onChange={e => this.handleNickname(e)} onFocus={() => this.tooltipAdd('tip-displayname')} onBlur={() => this.tooltipRemove('tip-displayname')}></input>
                        <span id="tip-displayname" className="Tooltip">Name Seen Everywhere.<br></br>Can Change Later.<br></br>32 Characters Max.</span>
                    </div>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="pass">Password</label>
                        <input type="password" name="pass" id="register-pass" minLength="8" required placeholder="Password" onChange={this.handlePassword} onFocus={() => this.tooltipAdd('tip-password')} onBlur={() => this.tooltipRemove('tip-password')}></input>
                        <span id="tip-password" className="Tooltip">8 Characters Minimum.<br></br>Longer Password Better.</span>

                        <label className="sr-only" htmlFor="pass-confirm">Confirm Password</label>
                        <input type="password" name="pass-confirm" id="pass-confirm" required placeholder="Confirm Password" onChange={e => this.inputCompare(e, 'register-pass')}></input>
                    </div>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="email">Email</label>
                        <input className={emailTakenClass} type="email" name="email" id="email" required placeholder="Email" onChange={e => {
                            this.handleEmail();
                            e.target.setCustomValidity('');
                            if (e.target.value === "") {
                                clearTimeout(this.state.emailCheckId);
                                clearTimeout(emailcheck);
                                this.setState({
                                    emailChecking: false,
                                    emailAvail: ""
                                });
                            } else if (e.target.checkValidity() && this.state.emailChecking) {
                                clearTimeout(this.state.emailCheckId);
                                clearTimeout(emailcheck);
                                emailcheck = setTimeout(() => this.emailCheck(), 2000);
                            } else if (e.target.checkValidity()) {
                                emailcheck = setTimeout(() => this.emailCheck(), 2000);
                                this.setState({
                                    emailChecking: true,
                                    emailCheckId: emailcheck
                                });
                            } else {
                                clearTimeout(this.state.emailCheckId);
                                clearTimeout(emailcheck);
                                this.setState({
                                    emailChecking: false,
                                    emailAvail: "noemail"
                                })
                            }
                        }} onFocus={() => this.tooltipAdd('tip-email')} onBlur={() => this.tooltipRemove('tip-email')}></input>
                        <span id="tip-email" className="Tooltip">
                            <div className={'LoadingCover' + emailCover}></div>
                            A Valid Email.<br></br>Will Need To Verify.<br></br>{emailTaken}
                        </span>

                        <label className="sr-only" htmlFor="email-confirm">Confirm Email</label>
                        <input type="email" name="email-confirm" id="email-confirm" required placeholder="Confirm Email" onChange={e => this.inputCompare(e, 'email')}></input>
                    </div>
                    <div className="Login-item">
                        <input className="Login-submit" type="submit" value="Register"></input>
                    </div>
                </form>
            </div>
        );
    }
}

Login.contextType = AppContext;
