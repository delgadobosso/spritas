import React from 'react';
import AuditItem from './AuditItem';
import './AuditLog.css';

export default class AuditLog extends React.Component {
    constructor(props) {
        super(props);
        this.audit = this.audit.bind(this);
        this.contentFilter = this.contentFilter.bind(this);
        this.unresolved = this.unresolved.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
        this.state = {
            audit: [],
            offset: 0,
            amount: 20,
            more: false,
            loadingMore: false,
            contentFilter: null,
            unresolvedOnly: false
        }
    }

    componentDidMount() {
        this.audit();
    }

    audit(filter = "audit", content = null) {
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                var contentParam = (content) ? content + "." : "";
                fetch(`/admin/${filter}/${contentParam}${this.state.offset}.${this.state.amount}`)
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
                    } else this.setState({ loadingMore: false });
                })
                .catch(error => this.setState({ loadingMore: false }));
            });
        }
    }

    contentFilter() {
        if (!this.state.contentFilter) {
            const filter = prompt('Filter for post# or reply#?', '');
            if (filter) {
                this.setState({
                    contentFilter: filter,
                    unresolvedOnly: false,
                    audit: [],
                    offset: 0,
                    more: false
                }, () => this.audit('content', filter));
            }
            else if (filter === '') alert('No value entered.');
        } else this.setState({
            contentFilter: null,
            audit: [],
            offset: 0,
            more: false
        }, () => this.audit('audit'));
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
                    contentFilter: null,
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
        } else if (this.state.contentFilter) {
            filter = 'content';
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
                            <th className='AuditLog-th AuditLog-filter' onClick={this.contentFilter}>Item{ this.state.contentFilter ? `: ${this.state.contentFilter}` : "" }</th>
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
