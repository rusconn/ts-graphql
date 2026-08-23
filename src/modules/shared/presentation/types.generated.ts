import type * as Types from "../../../app/graphql/types.generated.ts";
interface DefinedFields {
  InvalidInputError: 'field' | 'message';
  InvalidInputErrors: 'errors';
  PageInfo: 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor';
  ResourceLimitExceededError: 'message';
  ResourceNotFoundError: 'message';
  Error: 'message';
};

interface DefinedEnumValues {
  ErrorCode: 'ACCESS_TOKEN_EXPIRED' | 'AUTHENTICATION_ERROR' | 'BAD_USER_INPUT' | 'FORBIDDEN' | 'INTERNAL_SERVER_ERROR' | 'QUERY_TOO_COMPLEX' | 'RATE_LIMITED';
};

export type Error = Pick<Types.Error, DefinedFields['Error']>;
export type ErrorCode = DefinedEnumValues['ErrorCode'];
export type InvalidInputError = Pick<Types.InvalidInputError, DefinedFields['InvalidInputError']>;
export type InvalidInputErrors = Pick<Types.InvalidInputErrors, DefinedFields['InvalidInputErrors']>;
export type PageInfo = Pick<Types.PageInfo, DefinedFields['PageInfo']>;
export type ResourceLimitExceededError = Pick<Types.ResourceLimitExceededError, DefinedFields['ResourceLimitExceededError']>;
export type ResourceNotFoundError = Pick<Types.ResourceNotFoundError, DefinedFields['ResourceNotFoundError']>;

export type Scalars = Pick<Types.Scalars, 'DateTimeISO' | 'EmailAddress' | 'Void'>;
export type DateTimeIsoScalarConfig = Types.DateTimeIsoScalarConfig;
export type EmailAddressScalarConfig = Types.EmailAddressScalarConfig;
export type VoidScalarConfig = Types.VoidScalarConfig;

export type InvalidInputErrorResolvers = Pick<Types.InvalidInputErrorResolvers, DefinedFields['InvalidInputError'] | '__isTypeOf'>;
export type InvalidInputErrorsResolvers = Pick<Types.InvalidInputErrorsResolvers, DefinedFields['InvalidInputErrors']>;
export type PageInfoResolvers = Pick<Types.PageInfoResolvers, DefinedFields['PageInfo']>;
export type ResourceLimitExceededErrorResolvers = Pick<Types.ResourceLimitExceededErrorResolvers, DefinedFields['ResourceLimitExceededError'] | '__isTypeOf'>;
export type ResourceNotFoundErrorResolvers = Pick<Types.ResourceNotFoundErrorResolvers, DefinedFields['ResourceNotFoundError'] | '__isTypeOf'>;
export type ErrorResolvers = Pick<Types.ErrorResolvers, DefinedFields['Error']>;

export interface Resolvers {
  InvalidInputError?: InvalidInputErrorResolvers;
  InvalidInputErrors?: InvalidInputErrorsResolvers;
  PageInfo?: PageInfoResolvers;
  ResourceLimitExceededError?: ResourceLimitExceededErrorResolvers;
  ResourceNotFoundError?: ResourceNotFoundErrorResolvers;
  DateTimeISO?: Types.Resolvers['DateTimeISO'];
  EmailAddress?: Types.Resolvers['EmailAddress'];
  Void?: Types.Resolvers['Void'];
};