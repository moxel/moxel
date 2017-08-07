import React, {Component} from 'react';
import {Flex} from "layout-components";
import styles from './signup-modal.css';
import AuthStore from "../../stores/AuthStore";
import FixedWidthRow from "../../components/fixed-width-row";
import Markdown from 'react-markdownit';
import { Button, Card, Row, Col } from 'react-materialize';

class LandingPage extends Component {
  constructor() {
    super()

    this.state = {
      dogURL: "/images/tf-dog.jpg",
      width: window.innerWidth,
    }
  }

  componentWillMount() {
      this.setState({ width: window.innerWidth });
      window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
      window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
      this.setState({ width: window.innerWidth });
  };


  detectDog() {
    this.setState({
      dogURL: "/images/tf-dog-box.png"  
    })
  }

  
  render() {
    const screenWidth = this.state.width;
    const isMobile = screenWidth <= 900;    

    var deployText = (
      <div className={isMobile ? "col s12" : "col s4 m5 offset-m1"}>
        <div style={{height: "100px"}}>
        </div>
        <div style={{fontSize: (isMobile ? "40px" : "40px"), textAlign: "center"}}>
          Deploy Your <br/> Machine Learning Model
        </div>
        <div style={{fontSize: (isMobile ? "20px" : "30px"), textAlign: "center"}}>
          With one line of command.
        </div>
        <div style={{fontSize: "20px", textAlign: "center", marginTop: "20px"}}>
          {/*<a href="#"> Sign Up</a> &nbsp; &nbsp; &nbsp;
          <a href="#"> Learn More</a>*/}
        </div>
      </div>
    );

    var deployVideo = (

      <div className={isMobile ? "col s10 offset-s1" : "col s4 m5 "}>
        <div style={{width: ((isMobile ? 1200 : 650) / 1436 * screenWidth) + "px", overflow:"hidden"}}> 
          <video width={(isMobile ? 1436 : 800) / 1436 * screenWidth } autoPlay muted playsInline loop style={{marginLeft: (isMobile ? -118 : -65) / 1436 * screenWidth + "px"}}>
            <source src="/videos/demo-medium.mp4" type="video/mp4"/>
          </video>
        </div>
      </div>
    );

    var discoverCode = (<div className={isMobile ? "col s12 m10 offset-m1" : "col s4 m5"} style={{boxShadow: "0px 0px 100px #aaa", height: "300px", backgroundColor: "rgb(246, 248, 250)", padding: "0px", position: "relative"}}>
      <Markdown tagName="instruction" className="markdown-body " style={{overflow: "hidden"}}>
        <br/>
        {`   
            \`\`\`python
            import requests, os, base64
            URL = "http://beta.dummy.ai"

            # Send a POST request to API endpoint
            response = requests.post(
              URL + "/dummy/tf-object-detection/latest", 
              json={'image': image}
            ).json()

            \`\`\`

        `}
      </Markdown>  
      <Button id="run-button" name="run-button" waves="light" className="blue" style={{float: "right", right: "5px", bottom: "5px", position: "absolute"}} onClick={() => this.detectDog()}>Run</Button>
    </div>);

    var discoverImage = (
      <div className={isMobile ? "col s12 m10 offset-m1" : "col s4 m5 offset-m2"} style={{boxShadow: "0px 0px 100px #aaa", height: "300px", overflow: "hidden", padding: "0px", backgroundImage: `url(${this.state.dogURL})`, backgroundSize: "cover"}}>
      </div>
    );


    return (  
      <div>
        <div>
            {
              isMobile 
                ?
                (<div>
                  <div className="row" style={{paddingTop: "100px", paddingBottom: "0px", marginBottom: "0px"}}>
                    {deployText}
                  </div>
                  <div className="row" style={{paddingTop: "50px", paddingBottom: "0px", marginBottom: "50px"}}>
                    {deployVideo}
                  </div>
                </div>
                )
                : 
                (
                  <div className="row" style={{paddingTop: "100px", paddingBottom: "0px", marginBottom: "100px"}}>
                    {deployText}
                    {deployVideo}
                  </div>
                )
            }
        </div>

        <div className="row" style={{height: "700px", backgroundColor: "#f6f9fc", marginBottom: "0px"}}>
          <div className={isMobile ? "col s12" : "col s8 offset-s2 m10 offset-m1"} >
            <div style={{height: "100px"}}>
            </div>
            <div style={{fontSize: (isMobile ? "40px" : "40px"), textAlign: "center"}}>
              Discover the Best Open AI models 
            </div>
            <div style={{fontSize: (isMobile ? "18px" : "25px"), textAlign: "center"}}>
              Browse through trending models. Access models through APIs.
            </div>
            <div style={{height: "80px"}}>
            </div>

            {
              isMobile
              ?
              (<div>
                <div className="row">
                  <div className="col s12">
                    {discoverCode}
                  </div>
                </div>
                <div className="row" style={{marginBottom: "100px"}}>
                  <div className="col s12">
                    {discoverImage}
                  </div>
                </div>
              </div>)
              :
              (
                 <div className="row">
                  <div className="col s10 m12">
                    {discoverCode}
                    {discoverImage}
                  </div>
                </div>
              )
            }
           

          </div>
        </div>

        <div className="row" style={{backgroundColor: "rgb(252, 253, 253)", marginBottom: "0px"}}>
          <div className="col s12 ">
            <div style={{height: "100px"}}> 
            </div>
          </div>
        </div>

        <div className="row" style={{paddingTop: "100px", height: "700px", paddingBottom: "0px", marginBottom: "0px", backgroundImage: "url(\"/images/dock.png\")", backgroundSize: "cover"}}>


            <div className="col s12 ">
              <div className="col s4 m5 ">
                <div style={{width: "650px", overflow:"hidden"}}> 
                </div>
              </div>

              <div className={isMobile ? "col s12 " : "col s4 m5 "}>
                {isMobile 
                  ?
                 (
                  <div style={{fontSize: "40px", textAlign: "center"}}>
                    Focus on <br/> the Great Work
                  </div>
                  )
                 :
                 (
                  <div style={{fontSize: "40px", textAlign: "center"}}>
                    Focus on the Great Work
                  </div>
                 )
                }
                <div style={{fontSize: (isMobile ? "18px" : "25px"), textAlign: "center"}}>
                  We serve it to the world for you.
                </div>

              </div>  
            </div>

            
        </div>
      </div>
    );
  }
}

export default LandingPage;