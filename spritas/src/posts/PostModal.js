import './PostModal.css';
import React from 'react';

export default class PostModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='PostModal'>
                <div className='PostModal-backing'></div>
                <div className='PostModal-container'>
                    <img className='PostModal-img'
                        src={this.props.link}
                        alt="Modal" />
                </div>
            </div>
        )
    }
}