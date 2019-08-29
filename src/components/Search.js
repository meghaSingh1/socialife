import React, {Component} from 'react';

import axios from 'axios'



export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        const {query, type} = this.props.match.params;
        axios.post('/api/search', {query: query, search_type:type}).then(res => {
            console.log(res);
        }).catch(err => console.log(err))
    }

    render() {
        return (
            <div></div>
        )
    }
}
