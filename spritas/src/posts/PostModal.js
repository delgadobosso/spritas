import './PostModal.css';
import React from 'react';

export default class PostModal extends React.Component {
    constructor(props) {
        super(props);
        this.handleResize = this.handleResize.bind(this);
        this.toggleRender = this.toggleRender.bind(this);
        this.toggleZoom = this.toggleZoom.bind(this);
        this.state = ({
            image: null,
            container: null,
            resize: true,
            imgSharp: true,
            imgZoom: false
        });
    }

    componentDidMount() {
        const modal = document.getElementById('PostModal-' + this.props.id);
        setTimeout(() => modal.style.opacity = 1, 10);

        const image = new Image();
        image.onload = (e) => {
            const container = document.getElementById(`PostModal-imageContainer-${this.props.id}`);
            this.setState({
                image: image,
                container: container
            });
        }
        image.src = this.props.link;

        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        // Throttle resize handle
        if (this.state.resize) {
            this.setState({ resize: false });
            setTimeout(() => this.setState({ resize: true }), 500);
        }
    }

    toggleRender() {
        this.setState(state => ({
            imgSharp: !state.imgSharp
        }));
    }

    toggleZoom() {
        this.setState(state => ({
            imgZoom: !state.imgZoom
        }));
    }

    render() {
        var resWidth = 'initial';
        var resHeight = 'initial';
        if (this.state.image && this.state.container) {
            const image = this.state.image;
            const container = this.state.container;
            var ratio;
            if (image.width < (container.clientWidth * 0.5) && image.height < (container.clientHeight * 0.5)) {
                ratio = Math.min((container.clientWidth * 0.5) / image.width, (container.clientHeight * 0.5) / image.height);
            } else {
                ratio = Math.min(container.clientWidth / image.width, container.clientHeight / image.height);
            }
            resWidth = image.width * ratio;
            resHeight =  image.height *  ratio;
        }

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
            width: resWidth,
            height: resHeight,
            imageRendering: imgRend
        };

        return (
            <div className='PostModal' id={'PostModal-' + this.props.id}>
                <div className='PostModal-backing'></div>
                <div className={'PostModal-container'}>
                    <div className='PostModal-imageControls'>
                        <div className='PostModal-imageButton'
                            onClick={() => window.history.go(-1)}>Close Image</div>
                    </div>
                    <div id={`PostModal-imageContainer-${this.props.id}`} className={`PostModal-imageContainer`}>
                        <img id={`PostModal-img-${this.props.id}`} className={`PostModal-img`}
                            src={this.props.link}
                            alt="Modal"
                            onClick={this.toggleZoom}
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