import 'bootstrap/dist/css/bootstrap.css'
import "./App.css"

import LandingPage from "./StartHere"
import TopNav from "./components/TopNav"
import ActionNav from "./components/ActionNav"
import Snippet from "./components/Snippet"
import AboutPage from "./About"
import FAQPage from "./FAQ"


import React, { Component } from "react"
import { Container } from "react-bootstrap"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import config from './config'

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
        snippUrl: '',
        ready: false,
        mustSave: false,
        canSave: false,
        copySuccess: false,
        triggerSave: null,
    }

    this.onLoadedSnippet = this.onLoadedSnippet.bind(this)
    this.onCodeChange = this.onCodeChange.bind(this)
    this.onShareSnippet = this.onShareSnippet.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.saveHandler = this.saveHandler.bind(this)

    this.LoadSnippet = this.LoadSnippet.bind(this)
  }

  onLoadedSnippet(snippet) {
    this.setState({
        snippUrl: config.site.snippetUrl(snippet.env.language, snippet._id),
        ready: true,
        mustSave: false,
    })
  }

  onCodeChange(val) {
    this.setState({
      mustSave: true
    })
  }

  onShareSnippet() {
    setTimeout(_ => this.setState({
      copySuccess: false
    }), 3000)
    this.setState({
      copySuccess: true
    })
    
  }

  handleSave() {
    this.state.triggerSave().then(_ => {
      this.setState({mustSave: false})
    })
  }

  saveHandler(save) {
    this.setState({
      triggerSave: save
    })
  }

  LoadSnippet() {
    // We can use the `useParams` hook here to access
    // the dynamic pieces of the URL.
    let { id, lang } = useParams();

    return (
      <>
        <Snippet
         id={id}
         lang={lang}
         mustSave={this.state.mustSave}
         triggerSave={this.state.triggerSave}
         saveHandler={this.saveHandler}
         snippetChanged={this.onCodeChange}
         onLoadedSnippet={this.onLoadedSnippet}
         copySuccess={this.state.copySuccess}
        />
      </>
    );
  }

  render() {
    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={config.site.recaptchaSiteKey}
        language="en"
        useRecaptchaNet={true}
      >
        <Router>
          <TopNav />
          <ActionNav ready={this.state.ready} url={this.state.snippUrl} mustSave={this.state.mustSave} handleSave={this.handleSave} shareSnippet={this.onShareSnippet} />
          <Container  >
            <Switch>
              <Route path="/about">
                <AboutPage />
              </Route>
              <Route path="/faq">
                <FAQPage />
              </Route>
              <Route path="/_/:lang/:id" >

                <this.LoadSnippet />
              </Route>
              <Route path="/">
                <LandingPage />
              </Route>

            </Switch>
            <footer class="page-footer font-small bg-fauna" style={{ color: 'white', 'marginTop': '2em' }}>
            <div class="footer-copyright text-center py-3" >© 2020 Copyright:
              <a href="https://tryfaunadb.dev/" style={{ color: 'white' }}> TryFaunaDB</a>
            </div>
          </footer>
          </Container>
        </Router>

      </GoogleReCaptchaProvider>
      
    )
  }
}

export default App
