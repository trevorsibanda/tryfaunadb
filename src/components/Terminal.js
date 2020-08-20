import React, { Component } from "react"

import { Col, Row, Button, Tabs, Tab} from "react-bootstrap";
import PluginBase from 'terminal-in-react/lib/js/components/Plugin';
import Terminal from 'terminal-in-react';
import { FaPlay, FaPauseCircle, FaRecycle, FaClock } from "react-icons/fa"

import {
    withGoogleReCaptcha,
} from 'react-google-recaptcha-v3';

import config from "../config"
import api from "../api/Api"

class TerminalOutput extends Component {
    constructor(props) {
        super(props)
        this.state = { 
            status: 'ready',
            api: null, 
            config: null
        }

        this.setApiAndConfig = this.setApiAndConfig.bind(this)
        this.RunCommandInput = this.RunCommandInput.bind(this)
        this.handleRunButton = this.handleRunButton.bind(this)
        this.handleRunSnippet = this.handleRunSnippet.bind(this)
    }

    RunCommandInput(cmd) {
        switch(cmd) {
            case 'run':
                this.handleRunSnippet()
            break;
            case 'cancel':
            break;
            default:
                this.state.api.printLine("Unknown command `"+ cmd + "`")
            break;
        }
    }

    handleRunSnippet() {
        const termApi = this.state.api
        
        const snapshot = this.props.snapshot()
        termApi.focusInput()
        termApi.printLine("Retrieving reCaptcha token...")
        this.props.googleReCaptchaProps.executeRecaptcha("schedule_snippet_btn")
            .then(token => {
                this.setState({status: 'queued'})
                termApi.removeLine()
                termApi.printLine("Queueing code for execution...")
                setTimeout(_ => {
                    if(this.state.status === 'queued' ){
                        termApi.printLine('Cancelling execution. Queue timeout reached')
                        this.setState({ status: 'failed' })
                        //fix me: api.whiskey.cancel(token, snapshot)
                    }
                }, config.site.queueTimeout)
                return api.whiskey.queue(token, snapshot).catch(err => {
                    this.setState({ status: 'failed' })
                    termApi.printLine('Failed to queue for execution or recaptcha failed. Try again or reload page')
                })
            })
            .then(exec => {
                termApi.removeLine()
                termApi.printLine('Queued, starting please wait...')
                let onConnect = () => {
                    return api.whiskey.invoke(exec.id, exec.challenge, exec.ts).catch(err => {
                        this.setState({ status: 'failed' })
                        termApi.printLine('Error: Failed to execute with error:\n ', err)
                    }).then(_ => {
                        this.setState({ status: 'running' })
                        setTimeout(_ => {
                            if (this.state.status === 'running') {
                                termApi.printLine('Cancelling execution. start timeout reached')
                                this.setState({ status: 'failed' })
                            }
                        }, config.site.maxExecutionTime)
                    })
                }
                let handler = (event, data) => {
                    switch (event) {
                        case 'status':
                            switch (data) {
                                case 'execstarted':
                                    termApi.removeLine()
                                    if (this.state.status !== 'queued' && this.state.status !== 'failed') {
                                        this.setState({ status: 'running' })
                                    }
                                    break;
                                case 'teardown':
                                    this.setState({ status: 'ready' })
                                    break
                                default:
                                    break;
                            }
                            termApi.printLine(api.whiskey.statusMsg(data))
                            break

                        case 'result':
                            //todo: allowing for streaming results where results > 1024bytes
                            var s
                            if (typeof data === 'string' || data instanceof String) {
                                s = data
                            }else {
                                s = JSON.stringify(data)
                            }
                            termApi.printLine(s)
                            break
                        case 'fatal':
                            termApi.printLine("FATAL:")
                            termApi.printLine(data)
                            this.setState({ status: 'failed' })
                            break
                        default:

                            break
                    }
                }
                return api.whiskey.connect(exec.id, onConnect, handler)
            })
            .catch(err => {
                termApi.printLine('Recaptcha failed. Try again')
                this.setState({status: 'failed' })
                console.error(err)
            })

    }

    handleRunButton() {
        switch (this.state.status) {
            case 'running':
                this.state.api.printLine("Execution started... please wait for results.")
                break
            case 'queued':
                this.RunCommandInput('cancel')
            break
            case 'ready':
                this.RunCommandInput('run')
                break
            case 'failed':
                //todo: check if changes applied then rerun
                this.state.api.printLine("Hopefully you fixed what was wrong ;)")
                this.RunCommandInput('run')
                break
            default:
                this.state.api.printLine("Unknown state")
                break
        }
    }

    setApiAndConfig(api, config) {
        this.setState({
            'api': api,
            'config': config
        })
        let controller = {
            onKeyPress: () => { },
            runCommand: this.RunCommandInput
        }
        api.takeControl(controller)
    }


    render() {
        const { status } = this.state
        const setApiAndConfig = this.setApiAndConfig
        class TerminalPlugin extends PluginBase {
            static displayName = 'PlaygroundPlugin';
            static version = '0.1.0';

            constructor(api, config) {
                super(api, config)
                setApiAndConfig(api, config)
            }
        }

        var btnText, btnVariant, btnIcon, disableBtn
        disableBtn = false
        switch(status) {
            case 'ready':
                btnVariant = 'outline-primary'
                btnIcon = <FaPlay />
                btnText = 'Run code'
                if(!this.props.locked){
                    btnText = 'Save and run'
                }
            break
            case 'failed':
                btnVariant = 'outline-warning'
                btnIcon = <FaRecycle />
                btnText = 'Retry run'
                break
            case 'queued':
                btnIcon = <FaPauseCircle/>
                btnText = 'Cancel'
                btnVariant = 'outline-warning'
            break
            case 'running':
                btnVariant = 'danger'
                btnIcon = <FaClock/>
                btnText = 'Running...'
                disableBtn = true
                break
            default:
                disableBtn = true
        }

        return (
            <>
            <Row>
                <Col>
                    <Button disabled={disableBtn} variant={btnVariant} onClick={this.handleRunButton}>{btnIcon} {btnText}</Button>    
                </Col>
            </Row>
                <Tabs defaultActiveKey="terminal" >
                    <Tab eventKey="terminal" title="Terminal">
                        <Row>
                            <Col>
                                <Terminal
                                    color='green'
                                    backgroundColor='black'
                                    barColor='black'
                                    actionHandlers={{
                                        handleClose: (toggleClose) => {
                                            // cants close
                                        },
                                        handleMaximise: (toggleMaximise) => {
                                            // do something on maximise
                                            toggleMaximise();
                                        }
                                    }}
                                    plugins={[
                                        TerminalPlugin,
                                    ]}
                                    allowTabs={false}
                                    hideTopBar={true}
                                    startState='maximised'
                                    style={{ fontWeight: "bold", fontSize: "1em", height: "30vh" }}
                                    commands={{}}
                                    msg=''
                                />
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey="queries" title="Queries" disabled >
                        <p>Not yet active</p>
                    </Tab>
                </Tabs>
           
            </>
        )
    }
}

export default withGoogleReCaptcha(TerminalOutput);