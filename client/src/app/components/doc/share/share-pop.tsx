import {WithStyles, createStyles, withStyles} from '@material-ui/core';
import {StyleRules} from '@material-ui/core/styles';
import {action, observable} from 'mobx';
import {observer} from 'mobx-react';
import React, {Component, ReactNode} from 'react';
import styled from 'styled-components';

import QQIcon from '../../../assets/static/share/qq-transparent.png';
import WechatIcon from '../../../assets/static/share/wechat-transparent.png';
import WeiboIcon from '../../../assets/static/share/weibo-transparent.png';

import {Shape} from './@shape';

interface ShareIcon {
  className: string;
  icon: string;
  clickHandler(): void;
}

const styles = (): StyleRules =>
  createStyles({
    wrapper: {
      position: 'fixed',
      right: '110px',
      bottom: '90px',
    },
    target: {
      display: 'flex',
      textAlign: 'center',
      position: 'relative',
      padding: '10px',
      userSelect: 'none',
      filter: 'url("#goo")',
      width: '140px',
      height: '120px',
      justifyContent: 'center',
    },
    weibo: {
      transform: `scale(1) translate(60px, -40px)`,
    },
    wechat: {
      transform: `scale(1) translate(0, -75px)`,
    },
    qq: {
      transform: `scale(1) translate(-60px, -40px)`,
    },
  });

const IconWrapper = styled.span`
  position: absolute;
  width: 48px;
  height: 48px;
  background-color: ${props => props.theme.secondaryColor};
  border-radius: 50%;
  transition: transform 0.5s;
  bottom: 16px;
  left: 0;
  right: 0;
  margin: auto;
  cursor: pointer;
`;

const IconImage = styled.img`
  display: block;
  width: 30px;
  height: 30px;
  margin: 9px auto;
`;

const ShareButtonLabel = styled.label`
  display: block;
  width: 56px;
  line-height: 56px;
  background-color: ${props => props.theme.secondaryColor};
  color: white;
  border-radius: 50%;
  margin-top: auto;
  position: relative;
  z-index: 1;
  cursor: pointer;
`;

export interface SharePopProps extends WithStyles<typeof styles> {}

@observer
export class TSharePop extends Component<SharePopProps> {
  @observable
  private isOpenMenu = false;

  @action
  menuToggle(): void {
    this.isOpenMenu = !this.isOpenMenu;
  }

  getClassOfWrapper = (className: unknown): string =>
    ((this.isOpenMenu && className) || '') as string;

  handleWeiboClick(): void {
    console.info('111 click weibo');
  }

  handleWechatClick(): void {
    console.info('111 click wechat');
  }

  handleQQClick(): void {
    console.info('111 click qq');
  }

  render(): ReactNode {
    const {
      classes: {wrapper, target, weibo, wechat, qq},
    } = this.props;

    const shareIcons: ShareIcon[] = [
      {
        icon: WeiboIcon,
        className: this.getClassOfWrapper(weibo),
        clickHandler: (): void => this.handleWeiboClick(),
      },
      {
        icon: QQIcon,
        className: this.getClassOfWrapper(qq),
        clickHandler: (): void => this.handleQQClick(),
      },
      {
        icon: WechatIcon,
        className: this.getClassOfWrapper(wechat),
        clickHandler: (): void => this.handleWechatClick(),
      },
    ];

    const shareIconNodes = shareIcons.map(
      ({icon, className, clickHandler}: ShareIcon) => (
        <IconWrapper key={icon} className={className} onClick={clickHandler}>
          <IconImage src={icon}></IconImage>
        </IconWrapper>
      ),
    );

    return (
      <div className={wrapper}>
        <Shape></Shape>
        <div className={target}>
          <ShareButtonLabel onClick={() => this.menuToggle()}>
            分享
          </ShareButtonLabel>
          {shareIconNodes}
        </div>
      </div>
    );
  }
}

export const SharePop = withStyles(styles)(TSharePop);
