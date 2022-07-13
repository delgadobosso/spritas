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
                        <input type="text" name="username" id="username" required placeholder="username"></input>
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

            <form action="/login/signup" className="Login-form" method="POST">
                <h1 className="Login-title">Register</h1>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="username">Username</label>
                    <div className="Login-username">
                        <span className="Login-at">@ </span>
                        <input type="text" name="username" id="username" required placeholder="username"></input>
                    </div>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="nickname">Display Name</label>
                    <input type="text" name="nickname" id="nickname"
                    minlength="2" required placeholder="Display Name"></input>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="pass">Password</label>
                    <input type="password" name="pass" id="pass"
                    minlength="8" required placeholder="Password"></input>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="pass-confirm">Confirm Password</label>
                    <input type="password" name="pass-confirm" id="pass-confirm" required placeholder="Confirm Password"></input>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" required placeholder="Email"></input>
                </div>
                <div className="Login-item">
                    <label className="sr-only" htmlFor="email-confirm">Confirm Email</label>
                    <input type="email" name="email-confirm" id="email-confirm" required placeholder="Confirm Email"></input>
                </div>
                <div className="Login-item">
                    <input className="Login-submit" type="submit" value="Register"></input>
                </div>
            </form>
        </div>
    );
}