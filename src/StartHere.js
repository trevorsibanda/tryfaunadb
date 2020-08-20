
import React, { Component } from "react";
import {Row, Col, Button, Jumbotron} from "react-bootstrap"
import  {DiGo, DiPython, DiNodejs} from "react-icons/di"
import api from "./api/Api"
import config from "./config"

import WorkingModal from "./components/WorkingModal"
import SnippetNotFoundModal from "./components/SnippetNotFoundModal"


import {
    withGoogleReCaptcha,
} from 'react-google-recaptcha-v3';


class LandingPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            working: null,
            show404Modal: false,
            showRandomModal: false,
            showRandomModalMsg: '',
        }

        this.createSnippet = this.createSnippet.bind(this)
        this.handleRandomModal = this.handleRandomModal.bind(this)
    }

    handleRandomModal() {
        this.setState({
            showRandomModal: true,
            showRandomModalMsg: 'Loading a random snippet.'
        })
        api.social.randomSnippet('any')
           .then(snippet => {
               window.location = config.site.snippetUrl(snippet.lang, snippet._id)
           })
           .catch(err => {
               this.setState({
                   showRandomModalMsg: 'ERROR: Failed to retrieve a random snippet!'
               })
               setTimeout(_ => this.setState({
                   showRandomModal: false,
               }), 5000)
           })
    }

    createSnippet(lang) {
        this.setState({working: lang})
        this.props.googleReCaptchaProps.executeRecaptcha("create_snippet_landing_page")
            .then(token => {
                return api.snippet.create(token, lang, 'latest', 'emptydb', api.util.makePin(8))
            })
            .then(data => {
                window.location = config.site.snippetUrl(lang, data._id)
                this.setState({ working: false })
            })
            .catch(err => {
                this.setState({ show404Modal: true })
            })
    }

    render() {
        return (
            < >
                <Jumbotron style={{'backgroundColor': 'white', 'marginTop': '0.5em'}}>
                    <h1>FaunaDB Playground.</h1>
                    <p>
                        The playground allows you to run code snippets in NodeJS, Python, Go and Java targetting a FaunaDB instance. This service is for sharing code snippets,
                        illustrating patterns and FQL features.
  </p>
                    <p>
                        <Button variant="outline-primary" as="a" href="/random">Load random snippet</Button>
                    </p>
                    <label>Choose language</label>
                    <Row>
                        <Col>
                            <Button onClick={_ => this.createSnippet('go')} disabled={this.state.working} variant="outline-primary" style={{marginRight: '1em'}} className="btn-squared-default" >
                                <DiGo style={{ width: '100%', height: '100%' }} />
                            </Button>
                            <Button onClick={_ => this.createSnippet('python')} disabled={this.state.working} variant="outline-warning" style={{ marginRight: '1em' }} className="btn-squared-default" >
                                <DiPython style={{ width: '100%', height: '100%' }} />
                            </Button>
                            <Button onClick={_ => this.createSnippet('js')} disabled={this.state.working} variant="outline-danger" style={{ marginRight: '1em' }} className="btn-squared-default" >
                                <DiNodejs style={{ width: '100%', height: '100%' }} />
                            </Button>
                        </Col>
                    </Row>
                </Jumbotron>
            <Row>
                <Col xs={12} md={8} >
                    <label>Quick start templates</label>
                </Col>
                <Col xs={12} md={4} >
                    <label>Feaured snippets</label>
                </Col>
            </Row>
                <SnippetNotFoundModal
                    showModal={this.state.show404Modal}
                    header={'Failed to create new snippet'}
                    title={'Try to create a new snippet.'}
                    msg={'This could be due to a failed recaptcha, the faunadb/api server being down. Reload the page and try again, if that doesnt work, check the API status.'}
                    onHide={_ => this.setState({show404Modal: false})}
                />
                <WorkingModal
                    showModal={this.state.showRandomModal}
                    msg={this.state.showRandomModalMsg}
                />
            </>
        )
    }
}


export default withGoogleReCaptcha(LandingPage);