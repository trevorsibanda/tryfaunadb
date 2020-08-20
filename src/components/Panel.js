import React, { Component } from "react"
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import {Button} from "react-bootstrap";
import {FaRecycle, FaLock, FaLockOpen, FaClock} from "react-icons/fa";

import config from "../config"



class Advanced extends Component {
    constructor(props){
        super(props)
        this.state = {
            pin: '',
            working: false
        }

        this.changePin = this.changePin.bind(this)
        this.handleUnlock = this.handleUnlock.bind(this)

        this.pinRef = React.createRef()
    }

    changePin(pin) {
        
    }

    handleUnlock( ){
        let pin = this.pinRef.current.value
        this.setState({
            working: true
        })
        this.props.unlockSnippet(pin).finally(_ => {
            this.setState({
                working: false
            })
        })
    }

    render() {
        var btnIcon = <FaLock/>
        var unlockMsg = "Unlock snippet"
        if(!this.props.locked) {
            btnIcon = <FaLockOpen />
            unlockMsg = "Unlocked. You can now edit"
        }
        if(this.state.working){
            btnIcon = <FaClock />
            unlockMsg = "Unlocking snippet"
        }
        return (
            <Card.Body>
                <label htmlFor="basic-url">Unlock snippet</label>
                <p>
                    <small>
                        When creating a new snippet you are provided with a snippet pin. 
                        The pin is shown only once when the snippet is retrieved for the first time.
                        Enter the pin below to unlock the snippet to perform administrative actions.
                    </small>
                </p>
                <Form.Control 
                    as="input"
                    type="password"
                    placeholder="Snippet unlock pin here"
                    defaultValue={this.state.pin}
                    ref={this.pinRef}
                />
                <br />
                <Button variant="outline-primary" className="btn-block" onClick={this.handleUnlock} disabled={!this.props.locked || this.state.working}>{btnIcon} {unlockMsg}</Button>
                <br />
                <label >Delete snippet</label>
                <p><small>Once deleted you will not be able to view/execute the snippet.</small></p>
                <Button variant="danger block" className="btn-block" disabled ><FaRecycle /> Delete Snippet</Button>
            </Card.Body>
        )
    }
}

class Panel extends Component {

    constructor(props) {
        super(props);
        this.changeLang = this.changeLang.bind(this)
        this.changeDriver = this.changeDriver.bind(this)
        this.changeSchema = this.changeSchema.bind(this)
        this.changeAutoSave = this.changeAutoSave.bind(this)
        this.updateDesc = this.updateDesc.bind(this)


        this.langRef = React.createRef()
        this.driverRef = React.createRef()
        this.schemaRef = React.createRef()
        this.autoSaveRef = React.createRef()

    }

    changeLang(lang) {
        this.props.controllers.changeLang(lang)
    }

    changeSchema(schema) {
        this.props.controllers.changeSchema(schema)
    }

    changeDriver(driver) {
        this.props.controllers.changeDriver(driver)
    }

    changeAutoSave(b) {
        this.props.controllers.changeAutoSave(b)
    }

    updateDesc() {
        this.props.controllers.updateDesc(this.state.description)
    }

    schemaUrl( ) {
        return config.site.schemaUrl(this.props.snippet.env.schema)
    }

    render() {
        var descComp
        if(this.props.locked) {
            descComp = <pre>{this.props.snippet.description}</pre>
        }else{
            descComp = <textarea value={this.props.snippet.description} onChange={this.updateDesc} className={"form-control no-border-input"} placeholder="Snippet details/description goes here" rows={4} >
            </textarea>
            
        }
        
        return (
        <Accordion defaultActiveKey="0">
            <Card>
                    <Accordion.Toggle as={Card.Header} role="button"  eventKey="0">
                    Snippet 
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <label >Summary</label>
                            <p><small>
                                faunadb-{this.props.snippet.env.language}@{this.props.snippet.env.driver} to server:
                    {this.props.snippet.env.target} boostrapped with {this.props.snippet.env.schema} schema.
                            </small></p>
                            <label >Description</label>
                            <p><small>
                                {descComp}
                            </small></p>
                            <label >Created</label>
                            <p><small>
                                {this.props.snippet.ts} by Guest
                        </small></p>
                            <label >Stats</label>
                            <p><small>
                                Ran {this.props.snippet.stats.executionsSuccessful} times and {this.props.snippet.stats.executionsFailed} failed runs
                                , last run was {this.props.snippet.stats.lastExecutionTime} ms and {this.props.snippet.stats.lastExecutionStatus}
                        </small></p>
                        </Card.Body>
                </Accordion.Collapse>
            </Card>
            <Card>
                <Accordion.Toggle role="button" as={Card.Header} eventKey="1">
                        Environment
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="1">
                        <Card.Body>
                            <label htmlFor="snippet-lang">Language</label>
                            <Form.Control as="select"
                                ref={this.langRef}
                                disabled
                                value={this.props.snippet.env.language}
                                onChange={_ => this.changeLang(this.langRef.current.value)}
                                custom>
                                {Object.keys(config.supportedEnvs).map((k, idx) => {
                                    let env = config.supportedEnvs[k]
                                    return <option value={k} key={idx}>{env.name}</option>
                                })}
                            </Form.Control>
                            <label htmlFor="basic-url">Driver version</label>
                            <Form.Control as="select"
                                value={this.props.snippet.env.driver}
                                ref={this.driverRef}
                                onChange={_ => this.changeDriver(this.driverRef.current.value)}
                                custom>
                                {config.supportedEnvs[this.props.snippet.env.language].drivers.map((drv, idx) => {
                                    return <option value={drv.value} key={idx}>{drv.name}</option>
                                })}
                            </Form.Control>
                            <label htmlFor="basic-url">Schema</label>
                            <Form.Control as="select"
                                value={this.props.snippet.env.schema}
                                ref={this.schemaRef}
                                onChange={_ => this.changeSchema(this.schemaRef.current.value)}
                                custom>
                                {config.schemas.map((schema, idx) => {
                                    return <option value={schema.key} key={idx}>{schema.name}</option>
                                })}
                            </Form.Control>
                            <p>
                                <small>View <a href={this.schemaUrl()} target="_blank" rel="noopener noreferrer" > schema here</a></small>
                            </p>
                        </Card.Body>
                </Accordion.Collapse>
            </Card>
            <Card>
                    <Accordion.Toggle as={Card.Header} role="button"  eventKey="2">
                    Advanced Options
    </Accordion.Toggle>
                <Accordion.Collapse eventKey="2">
                    <Advanced
                        snippet={this.props.snippet}
                        unlockSnippet={this.props.controllers.unlockSnippet}
                        locked={this.props.locked}
                    />
                </Accordion.Collapse>
            </Card>
        </Accordion>
        )
    }
}

export default Panel;