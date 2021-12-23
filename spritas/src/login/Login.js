import './Login.css';

export default function Login() {
    document.title = "Login / Register - The Spritas";

    return(
        <div className="Login-forms">
            <form action="/login/signin" className="Login-form" method="POST">
                <h1>Login</h1>
                <div className="Login-item">
                    <label htmlFor="name">Username: </label>
                    <input type="text" name="name" id="name" required></input>
                </div>
                <div className="Login-item">
                    <label htmlFor="pass">Password: </label>
                    <input type="password" name="pass" id="pass" required></input>
                </div>
                <div className="Login-item">
                    <input type="submit" value="Login"></input>
                </div>
            </form>

            <form action="/login/signup" className="Login-form" method="POST">
                <h1>Register</h1>
                <div className="Login-item">
                    <label htmlFor="name">Username: </label>
                    <input type="text" name="name" id="name"
                    minlength="2" required></input>
                </div>
                <div className="Login-item">
                    <label htmlFor="pass">Password: </label>
                    <input type="password" name="pass" id="pass"
                    minlength="8" required></input>
                </div>
                <div className="Login-item">
                    <label htmlFor="pass-confirm">Confirm Your Password: </label>
                    <input type="password" name="pass-confirm" id="pass-confirm" required></input>
                </div>
                <div className="Login-item">
                    <label htmlFor="email">Email: </label>
                    <input type="email" name="email" id="email" required></input>
                </div>
                <div className="Login-item">
                    <label htmlFor="email-confirm">Confirm Your Email: </label>
                    <input type="email" name="email-confirm" id="email-confirm" required></input>
                </div>
                <div className="Login-item">
                    <input type="submit" value="Register"></input>
                </div>
            </form>
        </div>
    );
}