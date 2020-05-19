import React, {Component, ReactNode} from 'react';
import styled from 'styled-components';
import {Inject} from '@wizardoc/injector';

import {UserModel, Time} from 'src/app/services';

import {Avatar} from '../../common';

interface MessageItemProps {
  from: UserModel;
  sendTime: number;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const UserInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.titleColor};
  font-size: 18px;
`;

const SendTime = styled.div`
  color: ${props => props.theme.shallowSubTitleGray};
  font-size: 13px;
`;

const StyledAvatar = styled(Avatar)`
  width: 40px;
  height: 40px;
`;

export class MessageItem extends Component<MessageItemProps> {
  @Inject
  timeService!: Time;

  get sendTime(): string {
    return this.timeService
      .new(this.props.sendTime)
      .format('YYYY-MM-DD hh:mm:ss');
  }

  render(): ReactNode {
    const {
      from: {avatar, username},
    } = this.props;

    return (
      <Wrapper>
        <StyledAvatar lnk={avatar}></StyledAvatar>
        <UserInfoWrapper>
          <UserName>{username}</UserName>
          <SendTime>{this.sendTime}</SendTime>
        </UserInfoWrapper>
      </Wrapper>
    );
  }
}
