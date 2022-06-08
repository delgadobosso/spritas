import React from 'react';

export default class PureIframe extends React.PureComponent {
    componentDidUpdate() {
        var ifram = document.getElementById(`PostMainVideo-${this.props.id}`);
        if (ifram) {
            ifram.remove();
            document.getElementsByClassName('PostMain-video')[0].appendChild(ifram);
        }
    }
    
    render() {
        const {src, width, height} = this.props;
        return (
            <iframe src={src} width={width} height={height} allowFullScreen
            className='PostMain-videoElem' id={`PostMainVideo-${this.props.id}`} />
        );
    }
}