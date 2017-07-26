import React, {Component} from 'react';
import {Flex} from "layout-components";
import styles from './signup-modal.css';
import AuthStore from "../../stores/AuthStore";
import FixedWidthRow from "../../components/fixed-width-row";
import Markdown from 'react-markdownit';
import { Button, Card, Row, Col } from 'react-materialize';

class LandingPage extends Component {
  render() {
    return (
      <div>
    
        <div className="row" style={{paddingTop: "100px", paddingBottom: "0px", marginBottom: "0px"}}>
            <div className="col s4 m5 offset-m1">
              <div style={{height: "180px"}}>
              </div>
              <div style={{fontSize: "40px", textAlign: "center"}}>
                Deploy Your <br/> Machine Learning Model
              </div>
              <div style={{fontSize: "30px", textAlign: "center"}}>
                With one line of command.
              </div>
              <div style={{fontSize: "20px", textAlign: "center", marginTop: "20px"}}>
                <a href="#"> Sign Up</a> &nbsp; &nbsp; &nbsp; 
                <a href="#"> Learn More</a>
              </div>
            </div>
            <div className="col s4 m5 ">
              <div style={{width: "650px", overflow:"hidden"}}> 
                <video width="800" height="600" autoPlay loop style={{marginLeft: "-65px"}}>
                  <source src="/videos/demo-medium.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
        </div>
        <div className="row" style={{height: "700px", backgroundColor: "#f6f9fc", marginBottom: "0px"}}>
          <div className="col s8 offset-s2 m10 offset-m1" >
            <div style={{height: "80px"}}>
            </div>
            <div style={{fontSize: "40px", textAlign: "center"}}>
              Discover the best <b>open</b> AI models 
            </div>
            <div style={{fontSize: "25px", textAlign: "center"}}>
              Browse through trending models. Access models through REST APIs.
            </div>
            <div style={{height: "80px"}}>
            </div>

            <div className="row">
              <div className="col s4 m5" style={{boxShadow: "0px 0px 100px #aaa", height: "300px", backgroundColor: "rgb(246, 248, 250)", padding: "0px"}}>
                <Markdown tagName="instruction" className="markdown-body ">
                  <br/>
                  {`   
                      \`\`\`python
                      import requests, os, base64
                      URL = "http://beta.dummy.ai"

                      response = requests.post(
                        URL + "/dummy/tf-object-detection/latest", 
                        json={'image': image}
                      ).json()

                      \`\`\`

                  `}
                </Markdown>  
              </div>
              <div className="col s4 m5 offset-m2" style={{boxShadow: "0px 0px 100px #aaa", height: "300px", overflow: "hidden", padding: "0px"}}>
                <img src="/images/tf-dog.jpg" style={{width: "auto", height: "100%"}}></img>
              </div>
            </div>


            <div className="row">
              <div style={{height: "20px"}}>
              </div>
              <div style={{fontSize: "15px", textAlign: "center"}}>
                <Button waves="light" className="green">Run</Button>
              </div>
            </div>

          </div>
        </div>


        <div className="row" style={{paddingTop: "100px", height: "700px", paddingBottom: "0px", marginBottom: "0px", backgroundImage: "url(\"/images/dock.png\")", backgroundSize: "100% auto"}}>
            
            <div className="col s4 m5 offset-m1 ">
              <div style={{width: "650px", overflow:"hidden"}}> 
              </div>
            </div>

            <div className="col s4 m5 ">
              <div style={{height: "60px"}}>
              </div>
              <div style={{fontSize: "40px", textAlign: "center"}}>
                You Focus on the Great Work
              </div>
              <div style={{fontSize: "30px", textAlign: "center"}}>
                We serve it to the world for you.
              </div>

            </div>
        </div>
      </div>
    );
  }
}

export default LandingPage;