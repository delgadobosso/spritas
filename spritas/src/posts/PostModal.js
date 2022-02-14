import './PostModal.css';
import React from 'react';

export default class PostModal extends React.Component {
    constructor(props) {
        super(props);
        this.handleResize = this.handleResize.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.toggleRender = this.toggleRender.bind(this);
        this.toggleZoom = this.toggleZoom.bind(this);
        this.state = ({
            image: null,
            imgElem: null,
            container: null,
            resize: true,
            imgSharp: true,
            imgZoom: false,
            everZoomed: false,
            dragging: false
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
                imgElem: imgElem,
                container: container
            });
        }
        const imgElem = document.getElementById(`PostModal-img-${this.props.id}`);
        image.src = this.props.link;

        imgElem.addEventListener('mousedown', this.handleClick);
        imgElem.addEventListener('touchstart', this.handleClick);
        imgElem.addEventListener('mouseup', this.handleClick);
        imgElem.addEventListener('touchend', this.handleClick);
        window.addEventListener('mousemove', this.handleMove);
        window.addEventListener('touchmove', this.handleMove);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this.handleClick);
        window.removeEventListener('touchstart', this.handleClick);
        window.removeEventListener('mouseup', this.handleClick);
        window.removeEventListener('touchend', this.handleClick);
        window.removeEventListener('mousemove', this.handleMove);
        window.removeEventListener('touchmove', this.handleMove);
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        // Throttle resize handle
        if (this.state.resize) {
            this.setState({ resize: false });
            setTimeout(() => this.setState({ resize: true }), 500);
        }
    }

    handleClick(e) {
        if (this.state.imgZoom) {
            if ((e.type === 'mousedown' && e.which === 1) || e.type === 'touchstart') this.setState({ dragging: true });
            else this.setState({ dragging: false });
        } else if ((e.type === 'mousedown' && e.which === 1) || e.type === 'touchstart') this.toggleZoom();
    }

    handleMove(e) {
        if (this.state.dragging) {
            var transform = this.state.imgElem.style.transform;
            var current = transform.slice(10, -3).split('px, ');
            var x, y;
            if (e.type === 'mousemove') {
                x = parseInt(current[0]) + e.movementX;
                x = Math.min(Math.max(x, -1140), 0); // clamp x
                y = (current.length > 1) ? parseInt(current[1]) + e.movementY
                    : e.movementY;
                this.state.imgElem.style.transform = `translate(${x}px, ${y}px)`;
            } else if (e.type === 'touchmove') {
                var touch = e.touches[0] || e.changedTouches[0];
                this.state.imgElem.style.transform = `translate(${touch.pageX}px, ${touch.pageY}px)`;
            }
        }
    }

    toggleRender() {
        this.setState(state => ({
            imgSharp: !state.imgSharp
        }));
    }

    toggleZoom() {
        if (this.state.everZoomed) {
            this.setState(state => ({
                imgZoom: !state.imgZoom
            }));
        } else {
            this.setState(state => ({
                imgZoom: !state.imgZoom,
                everZoomed: true
            }));
        }
    }

    render() {
        var resWidth = 'initial';
        var resHeight = 'initial';
        var offset = '';
        var trans = (this.state.everZoomed) ? 'width 0.5s, height 0.5s' : 'width 0.5s, height 0.5s';
        var cursor = (this.state.imgZoom) ? 'move' : 'select';
        if (this.state.image && this.state.container) {
            const image = this.state.image;
            const container = this.state.container;
            const scale = (this.state.imgZoom) ? 2 : 1;
            const ratio = (image.width < (container.clientWidth * 0.5) && image.height < (container.clientHeight * 0.5))
            ? Math.min((container.clientWidth * 0.5 * scale) / image.width, (container.clientHeight * 0.5 * scale) / image.height)
            : Math.min(container.clientWidth * scale / image.width, container.clientHeight * scale / image.height);
            resWidth = image.width * ratio;
            resHeight =  image.height *  ratio;
            const offsetX = (resWidth < container.clientWidth) ? container.clientWidth * 0.5 - resWidth * 0.5 : 0;
            const offsetY = (resHeight < container.clientHeight) ? container.clientHeight * 0.5 - resHeight * 0.5 : 0;
            offset = `translate(${offsetX}px,${offsetY}px)`;
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
            imageRendering: imgRend,
            cursor: cursor,
            transform: offset,
            transition: trans
        };

        return (
            <div className='PostModal' id={'PostModal-' + this.props.id}>
                <div className='PostModal-backing'></div>
                <div className={'PostModal-container'}>
                    <div className='PostModal-imageControls'>
                        <div className='PostModal-imageButton'
                            onClick={() => window.history.go(-1)}>Close Image</div>
                    </div>
                    <div id={`PostModal-imageContainer-${this.props.id}`}
                        className={`PostModal-imageContainer`}
                        onClick={(e) => { if (e.target === e.currentTarget) window.history.go(-1); }}>
                        <img id={`PostModal-img-${this.props.id}`}
                            className={`PostModal-img`}
                            src={this.props.link}
                            alt="Modal"
                            style={imgStyle}
                            draggable='false' />
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