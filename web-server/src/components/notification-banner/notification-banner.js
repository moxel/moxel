// @flow
import React, {Component} from 'react';
import {Flex} from "layout-components";
import styled from "styled-components";
import NotificationSystem from 'react-notification-system';

const StyledLayout = styled(Flex)`
    .notifications-wrapper {
        z-index: 99999999;
    }

    .notifications-tr {
        z-index: 99999999 !important;
    }

`;

class NotificationBanner extends Component {
    constructor() {
        super()

        this.addNotification = this.addNotification.bind(this);
    }

    addNotification(obj) {
        this.notificationSystem.addNotification(obj);
    }

    render() {
        var self = this;

        return (
            <StyledLayout>
                <NotificationSystem ref={(notificationSystem) => {self.notificationSystem = notificationSystem;}} {...self.props}/>
            </StyledLayout>
        )
    }
}

export default NotificationBanner;