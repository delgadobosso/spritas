import React from 'react';

export default class PureIframe extends React.PureComponent {
    render() {
        const {src, width, height} = this.props;
        return (
            <iframe src={src} width={width} height={height} allowFullScreen
            className='PostMain-videoElem' id={`PostMainVideo-${this.props.id}`} />
        );
    }
}