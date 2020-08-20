import React, { Component} from "react"
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import NavLink from 'react-bootstrap/NavLink'

import { Container} from "react-bootstrap"

import {FaPlus, FaSave, FaShareAlt} from 'react-icons/fa'
import CreateSnippetModal from "./CreateSnippetModal"


class ActionNav extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ready: this.props.ready ? this.props.ready: false,
            changed: this.props.changed ? this.props.changed : false,
            showModal: false
        }

        this.setShow = b => {
            this.setState({showModal: b})
        }
        this.setShow = this.setShow.bind(this)

        this.handleClose = () => this.setShow(false);
        this.handleShow = () => this.setShow(true);
        
        this.handleClickNewSnippet = this.handleClickNewSnippet.bind(this)
    }

    handleSave = () => {
        this.props.handleSave()
    }


    handleClickNewSnippet() {
        this.handleShow()
    }

    handleShareSnippet = () => {
            navigator.clipboard.writeText(this.props.url)
           this.props.shareSnippet()
    }


    render() {
        return (
            <Navbar bg="light" variant="light" expand="lg">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Button variant="outline-success" onClick={this.handleClickNewSnippet}><FaPlus /> Create Snippet</Button>
                    <NavLink>
                        <Button variant="outline-primary" onClick={this.handleShareSnippet} disabled={!this.props.ready}><FaShareAlt /> Share</Button>
                    </NavLink>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <FormControl
                            placeholder={this.props.url}
                            variant="url"
                            disabled
                        />
                        <NavLink>
                            <Button variant="danger" onClick={this.handleSave} disabled={!this.props.ready && this.props.mustSave} className={this.props.ready && this.props.mustSave  ? 'btn-glowing': ''}><FaSave /></Button>
                        </NavLink>
                    </Navbar.Collapse>
                    <CreateSnippetModal showModal={this.state.showModal} onHide={this.handleClose} >
                    </CreateSnippetModal>
                </Container>
            </Navbar>
        )
    }
}

export default ActionNav;