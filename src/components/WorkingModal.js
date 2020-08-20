import React, { Component } from "react"

import { Modal, Row, Col, Spinner } from "react-bootstrap"

class WorkingModal extends Component {
    constructor(props) {
        super(props)
        this.onHide = this.onHide.bind(this)
    }

    onHide() {
        this.props.onHide()
    }

    render() {

        return (
            <>
                <Modal
                    show={this.props.showModal}
                    onHide={this.onHide}
                    keyboard={false}
                    backdrop='static'
                    centered
                >
                    <Modal.Body>
                        <label closeButton>{this.props.title} </label>
                        <Row>
                            <Col>
                                <small>{this.props.msg}</small>
                            </Col>
                            <Col>
                                <Spinner animation="border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </Spinner>
                            </Col>
                        </Row>
                        
                    </Modal.Body>
                </Modal>
            </>
        )
    }
}

export default WorkingModal;