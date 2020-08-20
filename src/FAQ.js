import React from "react"
import { Jumbotron, Button, Row, Col } from "react-bootstrap"


class FAQPage extends React.Component {
    render() {
        return (
            < >
                <Jumbotron style={{ 'backgroundColor': 'white', 'marginTop': '0.5em' }}>
                    <h1>Frequently Asked Questions.</h1>
                    <p>
                        A tool for easy online sharing, testing and debugging of complex FaunaDB query problems and their solutions.
  </p>
                    <p>
                        <Button variant="outline-primary" onClick={this.handleRandomModal}>Load random snippet</Button>
                    </p>

                </Jumbotron>
                <Row>
                    <Col xs={12} md={12} >
                        <h2>How do I use this?</h2>
                        <p>
                            This site is most useful to people with prior exposure or working experience with FQL(Fauna Query Language).
                            If you do not have any experience writing FQL queries, then we recommend using the official documentation as a
                            quick start guide to learn FQL - once you get the idea, pick a programming language you are comfortable in,
                            and then come back here.
                            <br />
                            For those already familiar with FQL, this site is just as useful. You can use it to:<br /><br />
                            <ul>
                                <li>Post a tricky query and share the link to get help from someone in the community</li>
                                <li>Compare and contrast FQL functionality between different driver versions.</li>
                                <li>Write FQL queries in the programming language of your choice without too much commitment.</li>
                            </ul>
                        </p>
                    </Col>
                    <Col xs={12} md={12} >
                        <h2>How does it work ?</h2>
                        <p>
                            The FaunaDB Playground is a web service that runs on ****** maintained servers.
                            Users submit code snippets in one of the available programming languages.
                        </p>
                        <p>Each snippet is vetted, compiled, (linked) and run inside an isolated docker container
                        with the results(read stdout output) returned as the result.
                        </p>
                        <p>Due to limited resources, constraints are applied.</p>
                        <p>
                            A new FaunaDB instance is spinned up (or an admin key to a child database provided) for each
                            execution and teared down at the end.<br />
                            This means that database changes do not persist between code executions.
                            <p>
                                Each snippet has a unique URL in the form of <b>/_/:language/:id></b>
                                that refer to a particular language, driver version, target server and schema(preloaded data).
                                You can share the unique URL with anyone, and they will be able to see what you've done so far but not make any persistant changes.
                                <br />
                                <p>When creating a new snippet you are shown a PIN for 30 seconds, copy this pin and keep it safe,
                                     it allows you to - at a later time, unlock the snippet and apply changes.</p>
                                <p>To save changes you have applied to someone else's snippet, press the save red save icon in the top red corner of the screen,
                                     it will create a new snippet, show you the snippet pin and unlock it.</p>
                                <br />
                                <p>If unlocked - code, driver version, target, schema, title and description changes to the snippet are saved at each execution.</p>
                            </p>
                        </p>
                    </Col>
                    <Col xs={12} md={12} >
                        <h2>Where can I find the source code ?</h2>
                        <p>
                            If you are interested in the architecture and implementation of the FaunaPlayground, check out the FaunaDB playground github repos below.
                            <ul>
                                <li>Frontend: <a href="https://github.com/trevorsibanda/tryfaunadb">https://github.com/trevorsibanda/tryfaunadb</a></li>
                                <li>Whiskey Runtime: <a href="https://github.com/trevorsibanda/whiskey">https://github.com/trevorsibanda/whiskey</a></li>
                                <li>Schemas and Preloaded Data: <a href="https://github.com/trevorsibanda/tryfaunadb-data">https://github.com/trevorsibanda/tryfaunadb-data</a></li>
                            </ul>
                        </p>
                    </Col>
                </Row>
            </>
        )
    }
}


export default FAQPage