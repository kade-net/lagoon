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
    InvalidOperation,
    OtherError
}

export function parsePostgresErrorType(code: string): PostgresErrors {
    if (['08000', '08003', '08006', '08001', '08004', '08007', '08P901'].includes(code)) {
        return PostgresErrors.ConnectionError;
    } else if (['22000', '22005', '22007', '22019', '22023', '22004', '22003', '22032'].includes(code)) {
        return PostgresErrors.DataExceptionError;
    } else if (code === '23505') {
        return PostgresErrors.UniqueViolation;
    } else if (code == '23503') {
        return PostgresErrors.ForeignKeyViolation;
    } else if (['23000', '23502'].includes(code)) {
        return PostgresErrors.IntegrityViolation;
    } else if (['24000', '25000', '25001', '25002', '25008', '25005', '25006', '25P01', '25P02', '25P03'].includes(code)) {
        return PostgresErrors.InvalidCursorTransactionState;
    } else if (['53000', '53100', '53200', '53300', '53400'].includes(code)) {
        return PostgresErrors.InsufficientResources
    } else if (['54000', '54001', '54011', '54023'].includes(code)) {
        return PostgresErrors.ProgramLimitExceeded;
    } else if (['23001', '23514', '23P01'].includes(code)) {
        return PostgresErrors.InvalidOperation;
    } 
    else {
        return PostgresErrors.OtherError;
    }
}