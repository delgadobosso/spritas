import React from 'react';
import './Featured.css';

export default class Featured extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='Featured'>
                <div className='Featured-header'>
                    <h1 className='Featured-title'>Featured</h1>
                </div>
            </div>
        );
    }
}
