import React, { Component } from 'react';
import { Container, Image, Input, Message, Modal, Button, Form, Grid, Header, Segment, Step } from 'semantic-ui-react';
import './App.css';
import { APIClient, Openlaw } from 'openlaw';
import utils from './utils'
import MissingConfig from './Shared'

class OpenLaw extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)

    this.openLawConfig = {
      server: utils.buildServiceUrlWithCreds(this, this.openlawRpcEndpoint),
      templateName: 'NDA DEMO (KALEIDO)',
      userName: this.openlawAccountEmail,
      password: this.openlawAccountPassword
    }

    this.apiClient = new APIClient({
      root: this.openlawRpcEndpoint,
      auth: {
        username: this.appCredsUsername,
        password: this.appCredsPassword
      }
    });
    
    this.state = {
      missingConfig: false,
      formLoading: false,
      errorMessage: "",
      successMessage: "",
      step1Complete: false,
      step1Active: true,
      step2Active: false,
      partyA: "",
      partyAOfficer: "",
      partyAOfficerTitle: "",
      partyAEmail: "",
      partyB: "",
      partyBOfficer: "",
      partyBOfficerTitle: "",
      partyBEmail: "",
      ndaLength: "",
      ndaPreviewText: "",
      ndaModalOpen: false,
      ndaAgreementId: ""
    };
  }

  componentDidMount = () => {
    if (!this.appCredsUsername || !this.appCredsPassword || !this.openlawRpcEndpoint ||
        !this.openlawAccountEmail || !this.openlawAccountPassword) {
      this.setState(() => ({
        missingConfig: true
      }))
      return
    }
  }

  processNDA = async(event) => {
    event.preventDefault();
    this.setState({loading: true});
    try {
      this.apiClient.login(this.openLawConfig.userName, this.openLawConfig.password);

      const ndaTemplate = await this.apiClient.getTemplate(this.openLawConfig.templateName);
      console.log(ndaTemplate);

      const partyAOLUser = await this.apiClient.getUserDetails(this.state.partyAEmail);
      console.log("partyAOLUser", partyAOLUser);
      const partyBOLUser = await this.apiClient.getUserDetails(this.state.partyBEmail);
      console.log("ndaTemplate", ndaTemplate);

      const ctResponse = Openlaw.compileTemplate(ndaTemplate.content);
      if (ctResponse.isError) {
        throw "Template error: " + ctResponse.errorMessage;
      }
      console.log("ctResponse", ctResponse);

      const params = this.buildOpenLawParamsObj(ndaTemplate, partyAOLUser, partyBOLUser);
      const executionResult = Openlaw.execute(ctResponse.compiledTemplate, {}, params);
      const agreements = Openlaw.getAgreements(executionResult.executionResult);

      const html = Openlaw.renderForReview(agreements[0].agreement, {});
      console.log("html", html);

      this.setState({step1Active: false, step1Complete: true, step2Active: true, ndaPreviewText: html});

    } catch (e) {
      this.setState({errorMessage: e.toString()});
      console.log("exception caught", e);
    }
    this.setState({loading: false});
  }

  uploadNDA = async(event) => {
    event.preventDefault();
    this.setState({loading: true});
    try {
      this.apiClient.login(this.openLawConfig.userName, this.openLawConfig.password);

      const ndaTemplate = await this.apiClient.getTemplate(this.openLawConfig.templateName);
      const partyAOLUser = await this.apiClient.getUserDetails(this.state.partyAEmail);
      console.log("partyAOLUser", partyAOLUser);
      const partyBOLUser = await this.apiClient.getUserDetails(this.state.partyBEmail);
      console.log("ndaTemplate", ndaTemplate);

      const uploadParams = this.buildOpenLawParamsObj(ndaTemplate, partyAOLUser, partyBOLUser);
      console.log("uploadParams", uploadParams);

      const result = await this.apiClient.uploadContract(uploadParams);
      console.log(result);

      this.setState({successMessage: "processed", step1Active: false, step1Complete: true});
      this.setState({ndaModalOpen: true, ndaAgreementId: result});

    } catch (e) {
      this.setState({errorMessage: e.toString()});
      console.log("exception caught", e);
    }
    this.setState({loading: false});
  }

  buildOpenLawParamsObj = function(ndaTemplate, userA, userB) {
    const object = {
      templateId: ndaTemplate.id,
      title: this.openLawConfig.templateName,
      text: ndaTemplate.content,
      creator: userA.id,
      parameters: {
        "PartyA": this.state.partyA,
        "PartyB": this.state.partyB,
        "Length": this.state.ndaLength,
        "PartyA Email": JSON.stringify(convertUserObject(userA)),
        "PartyA Officer": this.state.partyAOfficer,
        "PartyA Officer Title": this.state.partyAOfficerTitle,
        "PartyB Email": JSON.stringify(convertUserObject(userB)),
        "PartyB Officer": this.state.partyBOfficer,
        "PartyB Officer Title": this.state.partyBOfficerTitle
      },
      overriddenParagraphs: {},
      agreements: {},
      readonlyEmails: [],
      editEmails: [],
      draftId: ""
    };
    return object;
  };

  navigateToNda = async() => {
    window.open(this.openLawConfig.server + "/contract/" + this.state.ndaAgreementId, '_blank')
  }

  refreshPage = async() => {
    window.location.reload()
  }

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig header="OpenLaw" text="be sure to configure the OpenLaw RPC endpoint along with a valid Openlaw account email & password" />
      )
    }

    return (
      <Container>
        <Image style={{marginTop:'135px'}} src={process.env.PUBLIC_URL + '/imgs/top-image.png'} />
        <Header as='h1' attached='top'>
          Create New Joint Venture Project 
          <a target='blank' href="https://github.com/kaleido-io/kaleido-samples-gallery/tree/master/docs/openlaw" 
             style={{marginLeft: '50px', fontSize: 'small'}}>view instructions
          </a>
        </Header>
        <Segment attached>
          <Header.Subheader>New land development, farm exploration, or other joint venture projects</Header.Subheader>
          <Step.Group ordered>
            <Step completed={this.state.step1Complete} active={this.state.step1Active}>
              <Step.Content>
                <Step.Title>Parties</Step.Title>
                <Step.Description>Project members</Step.Description>
              </Step.Content>
            </Step>
            <Step active={this.state.step2Active}>
              <Step.Content>
                <Step.Title>Non Disclosure</Step.Title>
                <Step.Description>On OpenLaw</Step.Description>
                </Step.Content>
            </Step>
            <Step>
              <Step.Content>
                <Step.Title>Scope Project</Step.Title>
                <Step.Description>Success criteria</Step.Description>
              </Step.Content>
            </Step>
            <Step>
              <Step.Content>
                <Step.Title>Budget</Step.Title>
              </Step.Content>
            </Step>
            <Step>
              <Step.Content>
                <Step.Title>Finalize</Step.Title>
                <Step.Description>On OpenLaw</Step.Description>
              </Step.Content>
            </Step>
          </Step.Group>
          {this.state.step1Active &&
            <Segment>
              <Form loading={this.state.formLoading} error={!!this.state.errorMessage}
                success={!!this.state.successMessage} onSubmit={this.processNDA}>
                <Grid columns={2} divided>
                  <Grid.Row columns={1}>
                    <Message error header='Error' content={this.state.errorMessage} />
                    <Message success header='Success' content={this.state.successMessage} />
                  </Grid.Row>
                  <Grid.Row style={{marginLeft:'0px'}}>
                    <Grid.Column>
                      <Header as="h4">First Participant</Header>
                        <Form.Input label="Company Name"
                          type="text" placeholder="Corporate name"
                          onChange={event => this.setState({partyA: event.target.value})} />
                        <Form.Input label="Officer"
                          type="text" placeholder="First and last name"
                          onChange={event => this.setState({partyAOfficer: event.target.value})} />
                        <Form.Input label="Title"
                          type="text" placeholder="Officer's title (e.g., COO)"
                          onChange={event => this.setState({partyAOfficerTitle: event.target.value})} />
                        <Form.Input label="Email"
                          type="text" placeholder="Email address where signature form should be sent"
                          onChange={event => this.setState({partyAEmail: event.target.value})} />
                    </Grid.Column>
                    <Grid.Column>
                      <Header as="h4">Second Participant</Header>
                        <Form.Input label="Company Name"
                          type="text" placeholder="Corporate name"
                          onChange={event => this.setState({partyB: event.target.value})} />
                        <Form.Input label="Officer"
                          type="text" placeholder="First and last name"
                          onChange={event => this.setState({partyBOfficer: event.target.value})} />
                        <Form.Input label="Title"
                          type="text" placeholder="Officer's title (e.g., COO)"
                          onChange={event => this.setState({partyBOfficerTitle: event.target.value})} />
                        <Form.Input label="Email"
                          type="text" placeholder="Email address where signature form should be sent"
                          onChange={event => this.setState({partyBEmail: event.target.value})} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1} style={{marginLeft:'0px'}}>
                    <Grid.Column>
                      <Form.Field inline>
                        <label>How long do you want the non-disclosure agreement ("NDA") to continue after disclosures?</label>
                        <Input placeholder='years' onChange={event => this.setState({ndaLength: event.target.value})} />
                      </Form.Field>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1}>
                    <Grid.Column textAlign="right">
                      <Button type={"submit"} primary>Go To Non-Disclosure Agreeement</Button>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Form>
            </Segment>
          }
          {this.state.step2Active &&
            <Segment>
              <Header>Preview</Header>
              <Form onSubmit={this.uploadNDA} loading={this.state.formLoading} error={!!this.state.errorMessage}
                success={!!this.state.successMessage}>
                <Grid>
                  <Grid.Row columns={1}>
                    <Grid.Column textAlign="right">
                      <Button primary size="large">Begin Signature Process</Button>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1}>
                    <Grid.Column>
                      <div className="ndaPreview" dangerouslySetInnerHTML={{__html: this.state.ndaPreviewText}} />
                    </Grid.Column>
                    <Grid.Column>&nbsp;</Grid.Column>
                  </Grid.Row>
                </Grid>
              </Form>
              <Modal open={this.state.ndaModalOpen} closeIcon>
                <Modal.Header>Non-Disclosure Agreement</Modal.Header>
                <Modal.Content image >
                  <Image src={process.env.PUBLIC_URL + '/imgs/openlaw-300.png'} wrapped size="small" />
                  <Modal.Description>
                    <p>You will now be redirected to OpenLaw where both parties will execute the NDA. Evidence of the agreement
                      will be stored on the blockchain.</p>
                    <Button primary onClick={this.navigateToNda}>Sign NDA On OpenLaw</Button>
                    <Button style={{marginLeft: '50px'}} default onClick={this.refreshPage}>close & conclude demo</Button>
                  </Modal.Description>
                </Modal.Content>
              </Modal>
            </Segment>
          }
          <Segment>
            <p>Agriculture Network is a demonstration project by <strong><a href="http://openlaw.io">OpenLaw </a></strong>
              and <strong><a href="https://kaleido.io">Kaleido</a></strong>.</p>
          </Segment>
        </Segment>
      </Container>
    );
  }

};

function convertUserObject(original) {
  const object = {
    id: {
      id: original.id
    },
    email: original.email,
    identifiers: [
      {
        identityProviderId: "openlaw",
        identifier: original.identifiers[0].id
      }
    ]
  }
  return object;
}

export default OpenLaw;
