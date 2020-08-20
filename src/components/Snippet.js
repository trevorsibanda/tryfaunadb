import React, { Component } from "react"
import {Col, Row, Alert, FormControl } from "react-bootstrap";

import { monaco } from '@monaco-editor/react';

import CodeEditor from "./Editor"
import TerminalOutput from "./Terminal"
import Panel from "./Panel"

import api from "../api/Api"
import SnippetNotFoundModal from "./SnippetNotFoundModal";


class Snippet extends Component {
    constructor(props) {
        super(props)

        this.state = {
            snippet: {
                _id: '',
                code: '',
                title: '',
                description: '',
                pin: null,
                perms: {
                    readOnly: false,
                    executable: true,
                },
                env: {
                    language: 'go',
                    driver: 'latest',
                    schema: 'emptydb',
                    target: 'faunadb-core',
                },
                stats: {
                    executionsSuccessful: 0,
                    executionsFailed: 0,
                    lastExecutionStatus: null,
                    lastExecutionTime: null,
                }
            },
            status: 'loading',
            show404Modal: false,
            showLoadingModal: true,
            locked: true,
            unlockToken: {
                pin: null,
                challenge: '',
                ts: 0
            },
        }

        this.editor = null
        this.updateEditorState = this.updateEditorState.bind(this)
        this.handleEditorReady = this.handleEditorReady.bind(this)
        this.changeLang = this.changeLang.bind(this)
        this.changeDriver = this.changeDriver.bind(this)
        this.changeSchema = this.changeSchema.bind(this)
        this.changeAutoSave = this.changeAutoSave.bind(this)
        this.updateSnippet = this.updateSnippet.bind(this)
        this.updateDesc = this.updateDesc.bind(this)
        this.updateTitle = this.updateTitle.bind(this)
        this.toggleReadOnly = this.toggleReadOnly.bind(this)
        this.snapshotSnippet = this.snapshotSnippet.bind(this)
        this.unlockSnippet = this.unlockSnippet.bind(this)

        this.titleRef = React.createRef()
        this.props.saveHandler(_ => {
            let snippet = this.snapshotSnippet()
            let { pin, ts, challenge} = this.state.unlockToken
            return api.snippet.update(pin, ts, challenge, snippet)
        })
    }

    componentDidMount( ) {
        api.snippet.read(this.props.lang, this.props.id)
           .then(snipp => {
               this.updateSnippet(snipp)
               //try to unlock from localstorage
               api.snippet.unlock(snipp, null).then(token => {
                   this.setState({
                       unlockToken: token,
                       locked: false,
                   })
               }).catch(_ => {
                   console.log('You are not the owner. cant edit')
               })
           })
           .catch(_ => {
               this.setState({status: 'load_failed',  show404Modal: true})
           })
    }

    updateSnippet(snipp) {
        this.setState({
            snippet: snipp,
            status: 'loaded',
            show404Modal: false,
        })
        console.log(snipp.code)
        if(this.editor !== null){
            this.editor.getModel().setValue(snipp.code)
            this.setState({ showLoadingModal: false })
            this.props.onLoadedSnippet(snipp)
            let val = this.editor.getModel().getValue()
            if(val !== snipp.code) {
                setTimeout(_ => this.updateSnippet(snipp), 100)
            }
        }else {
            this.setState({showLoadingModal: true})
            setTimeout(_ => this.updateSnippet(snipp), 1000)
        }
        
    }

    updateEditorState = (v) => {
        return this.props.snippetChanged ? this.props.snippetChanged(v) : null
    }

    handleEditorReady(editor) {
        this.editor = editor
        this.editor.getModel().setValue(this.state.snippet.code)
        editor.onDidChangeModelContent(this.updateEditorState)
        
    }

    changeLang(lang) {
        this.setState({
            'env': {
                'language': lang
            }
        })
        monaco
            .init()
            .then(monaco => {
                let model = this.editor.getModel();
                monaco.editor.setModelLanguage(model, lang)
            })
            .catch(error => console.error('An error occurred during initialization of Monaco: ', error));
        
    }

    changeSchema(schema) {
        const snippet = this.state.snippet
        snippet.env.schema = schema
        this.setState({
            snippet: snippet
        })
    }

    changeDriver(driver) {
        const snippet = this.state.snippet
        snippet.env.driver = driver
        this.setState({
            snippet: snippet
        })
    }

    changeAutoSave(b) {
        this.setState({
            autoSave: b
        })
    }

    toggleReadOnly(b) {
        this.editor.updateOptions({ readOnly: b })
    }

    snapshotSnippet() {
        let snippet = this.state.snippet
        snippet.code = this.editor.getModel().getValue()
        return snippet
    }

    updateDesc(desc) {
        const snippet = this.state.snippet
        snippet.description = desc.substr(0, 500)
        this.setState({
            snippet: snippet
        })
    }

    updateTitle(title) {
        const snippet = this.state.snippet
        snippet.title = title.substr(0, 128)
        this.setState({
            snippet: snippet
        })
    }

    unlockSnippet(pin) {
        const snippet = this.state.snippet
        return api.snippet.unlock(snippet, pin).then(resp => {
            if(resp.status === 'ok'){
                this.setState({
                    unlockToken: resp.token,
                    locked: false,
                })
            }
        }).catch(_ => {
            alert('Failed to unlock snippet')
            this.setState({
                locked: false,
            })
        })
    }

    render() {
        let lang = this.state.snippet.env.language
        if(lang === 'js'){
            lang = 'javascript'
        }
        var titleComp 
        if(this.state.locked) {
            titleComp = <><b>"</b>{this.state.snippet.title}<b>"</b></>
        } else {
            titleComp = <FormControl 
                role="input" 
                type="text"
                ref={this.titleRef}
                onChange={_ => this.updateTitle(this.titleRef.current.value)}
                value={this.state.snippet.title}
                className="no-border-input" 
                placeholder="Snippet title here" />
        }
        return (
            <>
                <Row>
                    <Col xs={12} md={8}>
                        <p><b>Title:</b><br />
                            {titleComp}
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={8}>
                        <Alert key={0} variant='success' show={this.props.copySuccess}>
                            Copied link to clipboard !
                        </Alert>
                        <CodeEditor
                            lang={lang}
                            height={'60vh'}
                            code={this.state.snippet.code}
                            handleEditorReady={this.handleEditorReady}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <Panel 
                            snippet={this.state.snippet}
                            locked={this.state.locked}
                            controllers={ {
                                changeLang: this.changeLang,
                                changeDriver: this.changeDriver,
                                changeSchema: this.changeSchema,
                                changeAutoSave: this.changeAutoSave,
                                unlockSnippet: this.unlockSnippet,
                            }}
                        />
                    </Col>
                </Row>
                <TerminalOutput locked={this.state.locked} toggleReadOnly={this.toggleReadOnly} snapshot={this.snapshotSnippet} />
                <SnippetNotFoundModal showModal={this.state.show404Modal} />
            </>
        )
    }
}


export default Snippet;