import React from 'react';
import './AuditLog.css';

export default class AuditLog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <table className='AuditLog'>
                <thead>
                    <tr>
                        <th>Stuff</th>
                    </tr>
                </thead>
            </table>
        )
    }
}
