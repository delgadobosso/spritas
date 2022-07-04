import React from 'react';
import './AuditLog.css';

export default class AuditLog extends React.Component {
    constructor(props) {
        super(props);
        this.audit = this.audit.bind(this);
        this.state = {
            audit: [],
            offset: 0,
            amount: 10,
            more: true
        }
    }

    componentDidMount() {
        this.audit();
    }

    audit() {
        fetch(`/admin/audit/${this.state.offset}.${this.state.amount}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                var newItems = data.slice(0, this.state.amount).map((item, index) =>
                    <tr>
                        <td>{item.idFrom}</td>
                        <td>{item.idTo}</td>
                        <td>{item.idContent}</td>
                        <td>{item.type}</td>
                        <td>{item.reason}</td>
                        <td>{item.ts}</td>
                    </tr>
                );
                console.log(newItems);
                if (data.length < (this.state.amount + 1)) this.setState({ more: false });
                else this.setState(state => ({ offset: state.offset + this.state.amount }));
                this.setState(state => ({ audit: [newItems, ...state.audit] }));
            }
        })
    }

    render() {
        return (
            <table className='AuditLog'>
                <thead>
                    <tr>
                        <th>Audit Log</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.audit}
                </tbody>
            </table>
        )
    }
}
