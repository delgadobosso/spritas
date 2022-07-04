import React from 'react';
import './AdminPortal.css';
import AuditLog from './AuditLog';

export default class AdminPortal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='AdminPortal'>
                <AuditLog />
            </div>
        )
    }
}