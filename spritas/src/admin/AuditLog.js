import React from 'react';
import AuditItem from './AuditItem';
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
                    <AuditItem item={item} postClick={this.props.postClick} />);
                if (data.length < (this.state.amount + 1)) this.setState({ more: false });
                else this.setState(state => ({ offset: state.offset + this.state.amount }));
                this.setState(state => ({ audit: [newItems, ...state.audit] }));
            }
        })
    }

    render() {
        return (
            <div className='AuditLog'>
                <div className='AuditLog-header'>
                    <h1 className='AuditLog-title'>Audit Log</h1>
                </div>
                <table className='AuditLog-table'>
                    <thead>
                        <tr>
                            <th className='AuditLog-th'>Action</th>
                            <th className='AuditLog-th'>Reason</th>
                            <th className='AuditLog-th'>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.audit}
                    </tbody>
            </table>
            </div>
        )
    }
}
