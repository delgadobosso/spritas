import './Login.css';

export default function Login() {
    document.title = "Login / Register";

    return(
        <div className="Login-forms">
            <form action="/login/signin" className="Login-form" method="POST">
                <h1 className="Login-title">Login</h1>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="username">Username</label>
                    <div className="Login-username">
                        <span className="Login-at">@ </span>
                        <input type="text" name="username" id="username" required placeholder="username" onChange={e => handleUsername(e)}></input>
                    </div>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="pass">Password</label>
                    <input type="password" name="pass" id="pass" required placeholder="Password"></input>
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
                        <input type="text" name="username" id="username" required maxLength="16" placeholder="username" onChange={e => handleUsername(e)} onFocus={() => tooltipAdd('tip-username')} onBlur={() => tooltipRemove('tip-username')}></input>
                    </div>
                    <span id="tip-username" className="Tooltip">Unique, 16 Characters Max<br></br>(a-z, A-Z, 0-9, "_")</span>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="nickname">Display Name</label>
                    <input type="text" name="nickname" id="nickname" maxLength="32" required placeholder="Display Name" onChange={e => handleNickname(e)} onFocus={() => tooltipAdd('tip-displayname')} onBlur={() => tooltipRemove('tip-displayname')}></input>
                    <span id="tip-displayname" className="Tooltip">Name that will be seen everywhere<br></br>32 Characters Max</span>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="pass">Password</label>
                    <input type="password" name="pass" id="pass" minlength="8" required placeholder="Password" onFocus={() => tooltipAdd('tip-password')} onBlur={() => tooltipRemove('tip-password')}></input>
                    <span id="tip-password" className="Tooltip">8 Characters Minimum</span>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="pass-confirm">Confirm Password</label>
                    <input type="password" name="pass-confirm" id="pass-confirm" required placeholder="Confirm Password"></input>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" required placeholder="Email" onFocus={() => tooltipAdd('tip-email')} onBlur={() => tooltipRemove('tip-email')}></input>
                    <span id="tip-email" className="Tooltip">A valid email</span>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="email-confirm">Confirm Email</label>
                    <input type="email" name="email-confirm" id="email-confirm" required placeholder="Confirm Email"></input>
                </div>
                <div className="Login-item">
                    <input className="Login-submit" type="submit" value="Register" onSubmit={submit()}></input>
                </div>
            </form>
        </div>
    );
}

function submit(e) {
    // e.preventDefault();
}

function tooltipAdd(tip) {
    const tooltip = document.getElementById(tip);
    if (tooltip) tooltip.classList.add('Tooltip-on');
}

function tooltipRemove(tip) {
    const tooltip = document.getElementById(tip);
    if (tooltip) tooltip.classList.remove('Tooltip-on');
}

function handleUsername(e) {
    var input = e.target.value;
    // Only allow a-zA-Z0-9_
    e.target.value = input.slice(0, 16).replace(/[^\w]+/g, '');
}

function handleNickname(e) {
    var input = e.target.value;
    // Only allow one whitespace, not multiple back to back
    e.target.value = input.trimStart().slice(0, 32).replace(/[\s]{2,}/g, " ");
}
