import React from 'react';
import AuditItem from './AuditItem';
import './AuditLog.css';

export default class AuditLog extends React.Component {
    constructor(props) {
        super(props);
        this.audit = this.audit.bind(this);
        this.unresolved = this.unresolved.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
        this.state = {
            audit: [],
            offset: 0,
            amount: 20,
            more: false,
            loadingMore: false,
            unresolvedOnly: false
        }
    }

    componentDidMount() {
        this.audit();
    }

    audit(filter = "audit") {
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                fetch(`/admin/${filter}/${this.state.offset}.${this.state.amount}`)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        var newItems = data.slice(0, this.state.amount).map((item, index) => 
                            <AuditItem key={item.id} item={item} postClick={this.props.postClick} />);
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

    unresolved() {
        if (this.state.unresolvedOnly) {
            var confirm = window.confirm('Show all audit items?');
            if (confirm) {
                this.setState({
                    unresolvedOnly: false,
                    audit: [],
                    offset: 0,
                    more: false
                }, () => this.audit('audit'));
            }
        } else {
            var confirm = window.confirm('Filter for unresolved items only?');
            if (confirm) {
                this.setState({
                    unresolvedOnly: true,
                    audit: [],
                    offset: 0,
                    more: false
                }, () => this.audit('unresolved'));
            }
        }
    }

    scrollTo() {
        var con = document.getElementById('AuditLog');
        con.scrollIntoView({ behavior: "smooth" });
    }

    render() {
        var loadMsg = "Show More Items";
        var cover = "";
        if (this.state.loadingMore) {
            loadMsg = "Loading More Items...";
            cover = " LoadingCover-anim";
        }

        var resolvedHead = 'Resolved?';
        var filter = 'audit';
        var filtered = '';
        if (this.state.unresolvedOnly) {
            filter = 'unresolved';
            resolvedHead = 'Unresolved Only';
            filtered = ' AuditLog-filtered';
        }

        const load = (this.state.more) ? (
            <td className='PostContainer-load AuditLog-load' onClick={() => this.audit(filter)} colSpan="3">
                <div className={'LoadingCover' + cover}></div>
                {loadMsg}
            </td>
        ) : <td className='PostContainer-loaded AuditLog-load' colSpan="3">All Items Shown</td>;

        return (
            <div id='AuditLog' className='AuditLog'>
                <div className='AuditLog-header' onClick={this.scrollTo}>
                    <h1 className='AuditLog-title'>Audit Log</h1>
                </div>
                <table className='AuditLog-table'>
                    <thead>
                        <tr>
                            <th className='AuditLog-th'>Item</th>
                            <th className='AuditLog-th'>Reason</th>
                            <th className={'AuditLog-th AuditLog-filter' + filtered} onClick={this.unresolved}>{resolvedHead}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.audit}
                        <tr>{load}</tr>
                    </tbody>
            </table>
            </div>
        )
    }
}
