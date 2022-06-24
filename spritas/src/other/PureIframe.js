import React from 'react';

export default class PureIframe extends React.PureComponent {
    componentDidUpdate() {
        var ifram = document.getElementById(this.props.elementId);
        if (ifram) {
            ifram.remove();
            document.getElementsByClassName('PostMain-mediaContainer')[0].appendChild(ifram);
        }
    }
    
    render() {
        const {src, width, height} = this.props;
        return (
            <iframe src={src} width={width} height={height} allowFullScreen
            className='PostMain-videoElem' id={this.props.elementId} />
        );
    }
}