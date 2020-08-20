import React, {Component} from "react"

import { DiGo, DiPython, DiNodejs } from "react-icons/di"

import { Modal, Row, Button, Col, Spinner } from "react-bootstrap"

import config from "../config"
import api from "../api/Api"



import {
    withGoogleReCaptcha,
} from 'react-google-recaptcha-v3';


class LangButton extends Component {
    render() {
        return (
            <Button onClick={_ => this.props.onClick(this.props.lang)} variant={(this.props.working && this.props.lang === this.props.target) ? this.props.variant : "outline-" + this.props.variant } disabled={this.props.working} style={{ marginRight: '1em' }} className="btn-squared-default" >
                {(this.props.working && this.props.lang === this.props.target) ?
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner> : this.props.icon 
                }
            </Button>
        )
    }
}

class CreateSnippetModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lang: this.props.lang || '',
            loading: false,
            created: false,
            url: '',
        }

        this.handleCreateSnippet = this.handleCreateSnippet.bind(this)

        this.onHide = this.onHide.bind(this)

    }

    componentDidMount() {
        
    }

    handleCreateSnippet(lang) {
        this.setState({loading: true, lang: lang})
        let pin = api.util.makePin(8)
        this.props.googleReCaptchaProps.executeRecaptcha("create_snippet_modal")
            .then(token => api.snippet.create(token, lang, 'latest', 'emptydb', pin))
            .then(data => window.open(config.site.snippetUrl(lang, data._id), "_blank"))
            .then(_ => this.setState({ loading: false }))
            .then(_ => this.onHide())
            .catch(err => {
                this.setState({ loading: true })
                alert('Failed to get recaptcha token with error: ', err)
            })
    }

    onHide() {
        this.setState({loading: false, lang: ''})
        this.props.onHide()
    }

    render(){
        let title = this.props.title ? this.props.title : (this.state.loading ? 'Creating new ' + this.state.lang + ' snippet' : 'Create a new snippet')
        let msg = this.props.msg ? this.props.msg : 'You can specify target, driver version and schema in new page.'
        let header = this.props.header ? <Modal.Header closeButton><Modal.Title>{this.props.header}</Modal.Title></Modal.Header> : ''
        
        return (
            <>
            <Modal
                show={this.props.showModal}
                onHide={this.onHide}
                keyboard={false}
                backdrop={this.props.backdrop}
                centered
            >
                {header}
                <Modal.Body>
                        <label closeButton>{title} </label>
                    <Row>
                        <Col>
                            <LangButton lang='go' onClick={this.handleCreateSnippet} working={this.state.loading} target={this.state.lang} variant="primary" icon={<DiGo style={{ width: '100%', height: '100%' }} />} />
                            <LangButton lang='python' onClick={this.handleCreateSnippet} working={this.state.loading} target={this.state.lang} variant="success" icon={<DiPython style={{ width: '100%', height: '100%' }} />} />
                            <LangButton lang='js' onClick={this.handleCreateSnippet}  working={this.state.loading} target={this.state.lang} variant="warning" icon={<DiNodejs style={{ width: '100%', height: '100%' }} />} />
                        </Col>
                    </Row>
                    <small>{msg}</small>
                </Modal.Body>
            </Modal>
            </>
        )
    }
}

export default withGoogleReCaptcha(CreateSnippetModal);