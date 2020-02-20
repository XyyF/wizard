import React, {Component, ReactNode} from 'react';
import styled from 'styled-components';

import {MessageOverview, PageHeader, MessageSwitcher} from '../components';

const Wrapper = styled.div`
  width: 100%;
  height: fit-content;
  min-height: ${props => props.theme.heightOmitHeader};
  background: ${props => props.theme.baseGrayBg};
`;

export class MessageCenter extends Component {
  render(): ReactNode {
    return (
      <Wrapper>
        <PageHeader title="消息中心" />
        <MessageSwitcher></MessageSwitcher>
        <MessageOverview></MessageOverview>
      </Wrapper>
    );
  }
}
