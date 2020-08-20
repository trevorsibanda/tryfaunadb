import React, { Component } from "react"

import CreateSnippetModal from "./CreateSnippetModal"
import { Link } from "react-router-dom"

class SnippetNotFoundModal extends Component {
    constructor(props) {
        super(props)
        this.onHide = this.onHide.bind(this)
    }

    onHide () {
        return this.props.onHide ? this.props.onHide() : {}
    }

    render() {
        return (
            <CreateSnippetModal
                header={this.props.header}
                title={this.props.title ? this.props.title : <p>:( Snippet not found - Create a new snippet instead.</p>}
                msg={this.props.msg ? this.props.msg : <span>Either the snippet never existed, was deleted or your URL is incorrect. <Link to="/" onClick={this.onHide} >Go to Homepage</Link></span>}
                backdrop={this.props.backdrop ? this.props.backdrop : 'static'}
                showModal={this.props.showModal}
                onHide={this.onHide}
            />
        )
    }
}

export default SnippetNotFoundModal;