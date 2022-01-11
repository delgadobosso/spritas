import './PostModal.css';
import React from 'react';

export default class PostModal extends React.Component {
    constructor(props) {
        super(props);
        this.toggleRender = this.toggleRender.bind(this);
        this.toggleFill = this.toggleFill.bind(this);
        this.state = ({
            image: null,
            imgSharp: true,
            imgFill: false
        });
    }

    componentDidMount() {
        const modal = document.getElementById('PostModal-' + this.props.id);
        setTimeout(() => modal.style.opacity = 1, 10);

        const image = new Image();
        image.onload = (e) => this.setState({ image: e.target });
        image.src = this.props.link;
    }

    toggleRender() {
        this.setState(state => ({
            imgSharp: !state.imgSharp
        }));
    }

    toggleFill() {
        this.setState(state => ({
            imgFill: !state.imgFill
        }));
    }

    render() {
        var imgRend;
        var rendLabel;
        if (this.state.imgSharp) {
            imgRend = 'pixelated';
            rendLabel = 'Pixelated';
        } else {
            imgRend = 'auto';
            rendLabel = 'Smooth';
        }
        const imgStyle = {
            imageRendering: imgRend
        };

        if (this.state.imgFill) {
            console.log('lol');
        }

        return (
            <div className='PostModal' id={'PostModal-' + this.props.id}>
                <div className='PostModal-backing'></div>
                <div className='PostModal-container'>
                    <div className='PostModal-imageControls'>
                        <div className='PostModal-imageButton'
                            onClick={() => window.history.go(-1)}>Close Image</div>
                    </div>
                    <div className='PostModal-imageContainer'>
                        <img className='PostModal-img'
                            src={this.props.link}
                            alt="Modal"
                            onClick={this.toggleFill}
                            style={imgStyle} />
                    </div>
                    <div className='PostModal-imageControls'>
                        <div className='PostModal-imageButton'
                            onClick={this.toggleRender}>{rendLabel}</div>
                    </div>
                </div>
            </div>
        )
    }
}