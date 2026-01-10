import type { AppError } from './errors/app.error';

/**
 * Result Pattern Implementation
 * Provides explicit error handling without exceptions.
 *
 * @template T The success value type
 * @template E The error type (defaults to AppError)
 */
export class Result<T, E = AppError> {
  private readonly _isSuccess: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    if (isSuccess && error) {
      throw new Error(
        'InvalidOperation: A result cannot be successful and contain an error',
      );
    }
    if (!isSuccess && !error) {
      throw new Error(
        'InvalidOperation: A failing result must contain an error',
      );
    }

    this._isSuccess = isSuccess;
    this._value = value;
    this._error = error;

    Object.freeze(this);
  }

  /**
   * Creates a successful Result containing the given value.
   */
  public static ok<U, E = AppError>(value: U): Result<U, E> {
    return new Result<U, E>(true, value, undefined);
  }

  /**
   * Creates a failed Result containing the given error.
   */
  public static fail<U, E = AppError>(error: E): Result<U, E> {
    return new Result<U, E>(false, undefined, error);
  }

  /**
   * Returns true if the Result is successful.
   */
  public isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Returns true if the Result is a failure.
   */
  public isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Returns the success value.
   * @throws Error if the Result is a failure.
   */
  public getValue(): T {
    if (!this._isSuccess) {
      throw new Error(
        'Cannot get the value of a failed Result. Use getError() instead.',
      );
    }
    return this._value as T;
  }

  /**
   * Returns the error.
   * @throws Error if the Result is successful.
   */
  public getError(): E {
    if (this._isSuccess) {
      throw new Error(
        'Cannot get the error of a successful Result. Use getValue() instead.',
      );
    }
    return this._error as E;
  }

  /**
   * Maps the success value to a new value.
   * If the Result is a failure, returns a new failure with the same error.
   */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.ok<U, E>(fn(this._value as T));
    }
    return Result.fail<U, E>(this._error as E);
  }

  /**
   * Chains Result-returning operations.
   * If the Result is a failure, returns a new failure with the same error.
   */
  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value as T);
    }
    return Result.fail<U, E>(this._error as E);
  }

  /**
   * Returns the success value or a default value if failure.
   */
  public getOrElse(defaultValue: T): T {
    if (this._isSuccess) {
      return this._value as T;
    }
    return defaultValue;
  }

  /**
   * Executes a side-effect if successful.
   */
  public onSuccess(fn: (value: T) => void): Result<T, E> {
    if (this._isSuccess) {
      fn(this._value as T);
    }
    return this;
  }

  /**
   * Executes a side-effect if failure.
   */
  public onFailure(fn: (error: E) => void): Result<T, E> {
    if (!this._isSuccess) {
      fn(this._error as E);
    }
    return this;
  }
}
