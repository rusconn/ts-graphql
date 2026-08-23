import type * as Types from "../../../app/graphql/types.generated.ts";
interface DefinedFields {
  EmailAlreadyTakenError: 'message';
  ExpiredVerificationTokenError: 'message';
  InvalidVerificationTokenError: 'message';
  Mutation: 'accessTokenRefresh' | 'login' | 'logout' | 'signupComplete';
  AccessTokenRefreshSuccess: 'accessToken' | 'refreshToken';
  InvalidRefreshTokenError: 'message';
  RefreshTokenExpiredError: 'message';
  RefreshTokenReuseError: 'message';
  LoginSuccess: 'accessToken' | 'refreshToken';
  LoginFailedError: 'message';
  SignupCompleteSuccess: 'accessToken' | 'refreshToken';
};

export type EmailAlreadyTakenError = Pick<Types.EmailAlreadyTakenError, DefinedFields['EmailAlreadyTakenError']>;
export type Error = Types.Error;
export type ExpiredVerificationTokenError = Pick<Types.ExpiredVerificationTokenError, DefinedFields['ExpiredVerificationTokenError']>;
export type InvalidVerificationTokenError = Pick<Types.InvalidVerificationTokenError, DefinedFields['InvalidVerificationTokenError']>;
export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
export type AccessTokenRefreshResult = Types.AccessTokenRefreshResult;
export type AccessTokenRefreshSuccess = Pick<Types.AccessTokenRefreshSuccess, DefinedFields['AccessTokenRefreshSuccess']>;
export type InvalidRefreshTokenError = Pick<Types.InvalidRefreshTokenError, DefinedFields['InvalidRefreshTokenError']>;
export type RefreshTokenExpiredError = Pick<Types.RefreshTokenExpiredError, DefinedFields['RefreshTokenExpiredError']>;
export type RefreshTokenReuseError = Pick<Types.RefreshTokenReuseError, DefinedFields['RefreshTokenReuseError']>;
export type LoginResult = Types.LoginResult;
export type LoginSuccess = Pick<Types.LoginSuccess, DefinedFields['LoginSuccess']>;
export type InvalidInputErrors = Types.InvalidInputErrors;
export type LoginFailedError = Pick<Types.LoginFailedError, DefinedFields['LoginFailedError']>;
export type Void = Types.Void;
export type SignupCompleteResult = Types.SignupCompleteResult;
export type SignupCompleteSuccess = Pick<Types.SignupCompleteSuccess, DefinedFields['SignupCompleteSuccess']>;

export type EmailAlreadyTakenErrorResolvers = Pick<Types.EmailAlreadyTakenErrorResolvers, DefinedFields['EmailAlreadyTakenError'] | '__isTypeOf'>;
export type ExpiredVerificationTokenErrorResolvers = Pick<Types.ExpiredVerificationTokenErrorResolvers, DefinedFields['ExpiredVerificationTokenError'] | '__isTypeOf'>;
export type InvalidVerificationTokenErrorResolvers = Pick<Types.InvalidVerificationTokenErrorResolvers, DefinedFields['InvalidVerificationTokenError'] | '__isTypeOf'>;
export type MutationResolvers = Required<Pick<Types.MutationResolvers, DefinedFields['Mutation']>>;
export type AccessTokenRefreshSuccessResolvers = Pick<Types.AccessTokenRefreshSuccessResolvers, DefinedFields['AccessTokenRefreshSuccess'] | '__isTypeOf'>;
export type InvalidRefreshTokenErrorResolvers = Pick<Types.InvalidRefreshTokenErrorResolvers, DefinedFields['InvalidRefreshTokenError'] | '__isTypeOf'>;
export type RefreshTokenExpiredErrorResolvers = Pick<Types.RefreshTokenExpiredErrorResolvers, DefinedFields['RefreshTokenExpiredError'] | '__isTypeOf'>;
export type RefreshTokenReuseErrorResolvers = Pick<Types.RefreshTokenReuseErrorResolvers, DefinedFields['RefreshTokenReuseError'] | '__isTypeOf'>;
export type LoginSuccessResolvers = Pick<Types.LoginSuccessResolvers, DefinedFields['LoginSuccess'] | '__isTypeOf'>;
export type LoginFailedErrorResolvers = Pick<Types.LoginFailedErrorResolvers, DefinedFields['LoginFailedError'] | '__isTypeOf'>;
export type SignupCompleteSuccessResolvers = Pick<Types.SignupCompleteSuccessResolvers, DefinedFields['SignupCompleteSuccess'] | '__isTypeOf'>;

export interface Resolvers {
  EmailAlreadyTakenError?: EmailAlreadyTakenErrorResolvers;
  ExpiredVerificationTokenError?: ExpiredVerificationTokenErrorResolvers;
  InvalidVerificationTokenError?: InvalidVerificationTokenErrorResolvers;
  Mutation: MutationResolvers;
  AccessTokenRefreshSuccess?: AccessTokenRefreshSuccessResolvers;
  InvalidRefreshTokenError?: InvalidRefreshTokenErrorResolvers;
  RefreshTokenExpiredError?: RefreshTokenExpiredErrorResolvers;
  RefreshTokenReuseError?: RefreshTokenReuseErrorResolvers;
  LoginSuccess?: LoginSuccessResolvers;
  LoginFailedError?: LoginFailedErrorResolvers;
  SignupCompleteSuccess?: SignupCompleteSuccessResolvers;
};