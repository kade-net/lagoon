export enum PostgresErrors {
    ConnectionError,
    DataExceptionError,
    UniqueViolation,
    NotNullViolation,
    ForeignKeyViolation,
    IntegrityViolation,
    InvalidCursorTransactionState,
    InsufficientResources,
    ProgramLimitExceeded,
    OtherError
}

export function parsePostgresErrorType(errorMessage: string): PostgresErrors {
    const errorCodeIdentifier = 'code';

    // Parse errorMessage to JSON and get errorCode from it
    const parsedError = JSON.parse(errorMessage);
    const errorCode = parsedError[errorCodeIdentifier];

    if (['08000', '08003', '08006', '08001', '08004', '08007', '08P901'].includes(errorCode)) {
        return PostgresErrors.ConnectionError;
    } else if (['22000', '22005', '22007', '22019', '22023', '22004', '22003', '22032'].includes(errorCode)) {
        return PostgresErrors.DataExceptionError;
    } else if (errorCode === '23505') {
        return PostgresErrors.UniqueViolation;
    } else if (errorCode == '23503') {
        return PostgresErrors.ForeignKeyViolation;
    } else if (['23000', '23001', '23502', '23514', '23P01'].includes(errorCode)) {
        return PostgresErrors.IntegrityViolation;
    } else if (['24000', '25000', '25001', '25002', '25008', '25005', '25006', '25P01', '25P02', '25P03'].includes(errorCode)) {
        return PostgresErrors.InvalidCursorTransactionState;
    } else if (['53000', '53100', '53200', '53300', '53400'].includes(errorCode)) {
        return PostgresErrors.InsufficientResources
    } else if (['54000', '54001', '54011', '54023'].includes(errorCode)) {
        return PostgresErrors.ProgramLimitExceeded;
    } else {
        return PostgresErrors.OtherError;
    }
}