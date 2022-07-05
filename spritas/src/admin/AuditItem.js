import React from 'react';
import './AuditItem.css';

export default class AuditItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        const item = this.props.item;
        var result = [];

        switch(item.type) {
            case 'RP':
                result.push([
                    <td>{item.idFrom}</td>,
                    <td>{item.idTo}</td>,
                    <td>{item.idContent}</td>,
                    <td>{item.type}</td>,
                    <td>{item.reason}</td>,
                    <td>{item.ts}</td>
                ])
                break;

            default:
                break;
        }

        return (
            <tr className='AuditItem'>
                {result}
            </tr>
        )
    }
}