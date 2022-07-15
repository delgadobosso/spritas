import React from 'react';
import './Login.css';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.tooltipAdd = this.tooltipAdd.bind(this);
        this.tooltipRemove = this.tooltipRemove.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handleNickname = this.handleNickname.bind(this);
        this.usernameCheck = this.usernameCheck.bind(this);
        this.state = {
            avail: "",
            checking: false
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
    }
    
    usernameCheck() {
        var username = document.getElementById('register-username');
        if (username) {
            if (username.value !== "") {
                var myBody = new URLSearchParams();
                myBody.append('username', username.value);
        
                this.setState({ checking: true }, () => {
                    fetch('/login/usercheck', {
                        method: 'POST',
                        body: myBody
                    })
                    .then(resp => resp.text())
                    .then(data => {
                        if (data === "taken") this.setState({ avail: "taken" }, () => username.focus());
                        else if (data === "free") this.setState({ avail: "free" });
                        this.setState({ checking: false });
                    })
                    .catch(error => this.setState({ checking: false }));
                })
            } else this.setState({ avail: "" });
        }
    }

    submit(e) {
        // e.preventDefault();
    }

    render() {
        document.title = "Login / Register";

        var usercheck;
        var taken;
        var takenClass = "";
        var cover = "";
        if (!this.state.checking) {
            switch(this.state.avail) {
                case "taken":
                    taken = "Username Taken";
                    takenClass = "Login-usernameTaken";
                    break;

                case "free":
                    taken = "Username Available";
                    takenClass = "Login-usernameFree";
                    break;
            }
        } else {
            taken = "Checking Availability...";
            cover = " LoadingCover-anim";
        }

        return(
            <div className="Login-forms">
                <form action="/login/signin" className="Login-form" method="POST">
                    <h1 className="Login-title">Login</h1>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="username">Username</label>
                        <div className="Login-username">
                            <span className="Login-at">@ </span>
                            <input type="text" name="username" id="login-username" required autoCapitalize='off' placeholder="Username" onChange={e => this.handleUsername(e)}></input>
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

                <form action="/login/signup" className="Login-form Login-register" method="POST" autocomplete="off">
                    <h1 className="Login-title">Register</h1>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="username">Username</label>
                        <div className="Login-username">
                            <span className="Login-at">@ </span>
                            <input className={takenClass} type="text" name="username" id="register-username" required maxLength="16" autoCapitalize='off' placeholder="Username" onChange={e => {
                                this.handleUsername(e);
                                clearTimeout(usercheck);
                                usercheck = setTimeout(() => this.usernameCheck(), 1500);
                            }} onFocus={() => this.tooltipAdd('tip-username')} onBlur={() => this.tooltipRemove('tip-username')}></input>
                        </div>
                        <span id="tip-username" className="Tooltip">
                            <div className={'LoadingCover' + cover}></div>
                            Unique, 16 Characters Max.<br></br>(a-z, A-Z, 0-9, "_")<br></br>{taken}
                        </span>
                    </div>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="nickname">Display Name</label>
                        <input type="text" name="nickname" id="nickname" maxLength="32" required autoCapitalize='off' placeholder="Display Name" onChange={e => this.handleNickname(e)} onFocus={() => this.tooltipAdd('tip-displayname')} onBlur={() => this.tooltipRemove('tip-displayname')}></input>
                        <span id="tip-displayname" className="Tooltip">Name Seen Everywhere.<br></br>Can Change Later.<br></br>32 Characters Max.</span>
                    </div>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="pass">Password</label>
                        <input type="password" name="pass" id="register-pass" minlength="8" required placeholder="Password" onFocus={() => this.tooltipAdd('tip-password')} onBlur={() => this.tooltipRemove('tip-password')}></input>
                        <span id="tip-password" className="Tooltip">8 Characters Minimum.<br></br>Longer Password Better.</span>

                        <label className="sr-only" htmlFor="pass-confirm">Confirm Password</label>
                        <input type="password" name="pass-confirm" id="pass-confirm" required placeholder="Confirm Password"></input>
                    </div>
                    <div className="Login-item">
                        <label className="sr-only" htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" required placeholder="Email" onFocus={() => this.tooltipAdd('tip-email')} onBlur={() => this.tooltipRemove('tip-email')}></input>
                        <span id="tip-email" className="Tooltip">A Valid Email.<br></br>Will Need To Verify.</span>

                        <label className="sr-only" htmlFor="email-confirm">Confirm Email</label>
                        <input type="email" name="email-confirm" id="email-confirm" required placeholder="Confirm Email"></input>
                    </div>
                    <div className="Login-item">
                        <input className="Login-submit" type="submit" value="Register" onSubmit={this.submit}></input>
                    </div>
                </form>
            </div>
        );
    }
}
