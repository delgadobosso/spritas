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
            amount: 2,
            more: false,
            loadingMore: false
        }
    }

    componentDidMount() {
        this.audit();
    }

    audit() {
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                fetch(`/admin/audit/${this.state.offset}.${this.state.amount}`)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        var newItems = data.slice(0, this.state.amount).map((item, index) => 
                            <AuditItem item={item} postClick={this.props.postClick} />);
                        if (data.length < (this.state.amount + 1)) this.setState({ more: false });
                        else this.setState(state => ({
                            offset: state.offset + this.state.amount,
                            more: true
                        }));
                        this.setState(state => ({
                            audit: [...state.audit, newItems],
                            loadingMore: false
                        }));
                    }
                })
                .catch(error => this.setState({ loadingMore: false }));
            });
        }
    }

    render() {
        var loadMsg = "Show More Items";
        var cover = "";
        if (this.state.loadingMore) {
            loadMsg = "Loading More Items...";
            cover = " LoadingCover-anim";
        }

        const load = (this.state.more) ? (
            <div className='PostContainer-load' onClick={this.audit}>
                <div className={'LoadingCover' + cover}></div>
                {loadMsg}
            </div>
        ) : <div className='PostContainer-loaded'>All Items Shown</div>;

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
                        {load}
                    </tbody>
            </table>
            </div>
        )
    }
}
