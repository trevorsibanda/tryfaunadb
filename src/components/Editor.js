import React, { Component } from "react"
import Editor from '@monaco-editor/react'


class CodeEditor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lang: this.props.lang,
            height: this.props.height ? this.props.height : '60vh',
            code:  this.props.code ? this.props.code : '',
            state: 'loading',
        }
        this.handleEditorMount = this.handleEditorMount.bind(this)
    }

    handleEditorMount(_, editor) {
        this.props.handleEditorReady(editor)
        this.setState({
            state: 'ready'
        })
    }

    render() {
        return (
             
            <Editor 
                height={this.props.height}
                language={this.props.lang} 
                editorDidMount={this.handleEditorMount}
                value={''} 
            />
        )
    }
}

export default CodeEditor;