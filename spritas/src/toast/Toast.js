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
        var notifs = [];
        params.forEach((value, key) => {
            var msg = "";
            var classStatus = "";
            switch(key) {
                case "success":
                    classStatus = " Toast-success";
                    switch(value) {
                        case "register":
                            msg = "Account registered. You may now login to your account."
                            break;
                        
                        default:
                            break;
                    }
                    break;

                case "failure":
                    classStatus = " Toast-failure";
                    break;

                default:
                    break;
            }
            var notif = <div className={'Toast-notif' + classStatus} onClick={this.dismiss}>{msg}</div>
            notifs.push(notif);
        });
        this.setState(state => ({ notifs: [...state.notifs, notifs] }));
    }

    dismiss(e) {
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

    render() {
        return (
            <div className='Toast'>
                {this.state.notifs}
            </div>
        );
    }
}