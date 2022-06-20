import React from 'react';

const CrossIcon = props => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 40 40'>
        <title>{props.title}</title>
        <path d='M 14 14 L 26 26 M 26 14 L 14 26'
            className={props.pathClass}
            stroke={props.stroke} strokeWidth='5px'
            strokeLinecap='round' />
    </svg>
);

export default CrossIcon;