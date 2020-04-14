import {action, computed, observable} from 'mobx';
import {Inject, Injectable} from 'react-ts-di';

import {BaseInfoData} from '../../components';
import {Optional} from '../../types/type-utils';
import {emptyAssert} from '../../utils';
import {HTTP} from '../http';
import {DialogService} from '../dialog';
import {JWT} from '../jwt-service';
import {MessageService} from '../message';

import {UserBaseInfo, UserInfoDTO, ValidResult} from './user-service.dto';
import {UserServiceAPI} from './@user-service.api';

interface UserInfoAvatarPart {
  avatar: string;
  displayName: string;
}

interface OrganizationInfo {
  organizationName: string;
  organizationDescription?: string;
}

interface LoginResData {
  jwt: string;
  userInfo: UserBaseInfo;
}

export type ParsedRegisterData = UserBaseInfo & OrganizationInfo;

export type RegisterData = Optional<ParsedRegisterData>;

@Injectable()
export class User {
  @Inject
  private http!: HTTP;

  @Inject
  private jwt!: JWT;

  @Inject
  private dialog!: DialogService;

  @Inject
  messageService!: MessageService;

  @Inject
  api!: UserServiceAPI;

  registerData: RegisterData = {};

  @observable
  userInfo: UserBaseInfo | undefined;

  @observable
  isLogin: boolean = false;

  constructor() {
    if (this.jwt.isExist) {
      // 刷新时带上 JWT 拿到用户的信息
      this.initUserInfo();
    }
  }

  @action
  setUserInfo(userInfo: UserBaseInfo): void {
    this.userInfo = userInfo;
    this.isLogin = true;
  }

  @action
  async initUserInfo(): Promise<void> {
    this.dialog.loading(async () => {
      const result = await this.http.get<UserInfoDTO>(this.api.info);

      result
        .expect(() => '获取用户信息失败')
        .success(data =>
          emptyAssert(data, data => {
            this.setUserInfo(data.userInfo);
            // initialize websocket
            this.messageService.initWebSocket();
          }),
        );
    });
  }

  @action
  async login(username: string, password: string): Promise<boolean> {
    const result = await this.http.post<LoginResData>(this.api.login, {
      username,
      password,
    });

    return result
      .expect(() => '登录失败')
      .success(data => emptyAssert(data, resData => this.saveToken(resData)))
      .ok;
  }

  async validBaseInfo(baseInfo: BaseInfoData): Promise<boolean | undefined> {
    const result = await this.http.post<ValidResult, BaseInfoData>(
      this.api.validBaseInfo,
      baseInfo,
    );

    return result.expect(() => '获取验证结果失败').data?.isValid;
  }

  @computed
  get getIsLogin(): boolean {
    return this.isLogin;
  }

  @computed
  get avatar(): string {
    return !this.userInfo ? '' : getAvatar(this.userInfo);
  }

  async register(): Promise<void> {
    const result = await this.http.post<LoginResData>(
      this.api.register,
      this.registerData,
    );

    result
      .expect(() => '注册失败')
      .success(data => emptyAssert(data, data => this.saveToken(data)));
  }

  collectBaseInfo(baseInfo: BaseInfoData): void {
    this.registerData = {...this.registerData, ...baseInfo};
  }

  ensureOrganization(
    organizationName: string,
    organizationDescription?: string,
  ): void {
    this.registerData = {
      ...this.registerData,
      organizationName,
      organizationDescription,
    };
  }

  logout(): void {
    this.jwt.remove();

    // reset userData
    this.userInfo = undefined;
    this.isLogin = false;
  }

  async updateAvatar(avatar: string): Promise<void> {
    const result = await this.http.put(this.api.updateAvatar, {avatar});

    result.expect(() => '更新头像失败');

    this.userInfo!.avatar = avatar;
  }

  private saveToken({jwt, userInfo}: LoginResData): void {
    this.jwt.save(jwt);
    this.setUserInfo(userInfo);
  }
}

export function getAvatar(userInfo: UserInfoAvatarPart): string {
  if (!userInfo) {
    return '';
  }

  const {avatar, displayName} = userInfo;

  return avatar === '' || !avatar ? displayName[0] : avatar;
}
