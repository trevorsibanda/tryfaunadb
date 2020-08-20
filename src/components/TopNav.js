import React, { Component } from "react"
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import {Link} from 'react-router-dom'
import { Container, OverlayTrigger, Tooltip } from "react-bootstrap"
import { FaCircle } from "react-icons/fa"

import api from "../api/Api"

class TopNav extends Component {
    constructor(props) {
        super(props)
        this.state = {
            api: true,
            whiskey: true,
            faunadb: true
        }
        this.updateHealthFail = this.updateHealthFail.bind(this)
        this.updateHealthSuccess = this.updateHealthSuccess.bind(this)
    }

    componentDidMount() {
        api.service.health(this.updateHealthSuccess, this.updateHealthFail)
        setInterval(_ => {
            api.service.health(this.updateHealthSuccess, this.updateHealthFail)
        }, 60000)
        
    }

    updateHealthSuccess(service, state) {
        let data = { }
        data[service] = state
        this.setState(data)
    }

    updateHealthFail(service, err) {
        let data = { }
        data[service] = false
        this.setState(data)
        console.error('Service `' + service + '` is not running.', err)
    }

    render() {
        const {api, whiskey, faunadb} = this.state
        var statusColor = 'orange'
        var statusClass = ''
        
        if( api && whiskey && faunadb) {
            statusColor = 'lightgreen'
        } 
        else if (!api | !faunadb) {
            statusColor = 'red'
            statusClass = 'btn-glowing'
        }
        else if(api && faunadb) {
            statusColor = 'orange'

        } 
        
        return (
            <Navbar bg="fauna" variant="dark" expand="lg">
                <Container >
                    <Link to="/" className="navbar-brand">
                        FaunaDev
                    </Link>
                    <Navbar.Collapse >
                        <Nav className="justify-content-end" >
                            <Link to="/about" className="nav-link" >About</Link>
                            <Link to="/faq" className="nav-link">F.A.Q</Link>
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Text>
                        <OverlayTrigger
                            key={0}
                            placement="bottom"
                            overlay={
                                <Tooltip id="tooltipStatus">
                                    API: <strong><FaCircle style={{ color: api ? 'lightgreen' : 'red' }} /></strong><br />
                                    FaunaDB: <strong><FaCircle style={{ color: faunadb ? 'lightgreen' : 'red' }} /></strong><br />
                                    Whiskey: <strong><FaCircle style={{ color: whiskey ? 'lightgreen' : 'red' }} /></strong><br />
                                </Tooltip>
                            }
                        >
                            <span>Server:
                            <FaCircle style={{ color: statusColor }} className={statusClass} />
                            </span>
                        </OverlayTrigger>
                    </Navbar.Text>
                </Container>
            </Navbar>
        )
    }
}

export default  TopNav;