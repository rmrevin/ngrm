import { EventEmitter, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { isEqualStruct } from '@ngrm/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, skipWhile, startWith, takeUntil } from 'rxjs/operators';

const cloneDeep = require('lodash/cloneDeep');

export interface FormErrorsCollection
{
  [key: string]: ValidationErrors & { children?: FormErrorsCollection };
}

export type FormControlPath = Array<string | number> | string;

export class NgrmForm<T> extends FormGroup implements OnDestroy
{
  public readonly value: T;
  public readonly defaultValue: T;

  private readonly _value$ = new BehaviorSubject<T>(undefined);
  public readonly value$ = this._value$.asObservable();

  private readonly _snapshot$ = new BehaviorSubject<T>(undefined);
  public readonly snapshot$ = this._snapshot$.asObservable();

  public readonly valueChanges: Observable<T>;

  private readonly _submitted$ = new BehaviorSubject<boolean>(false);
  public readonly submitted$ = this._submitted$.asObservable();

  private readonly _destroyed$ = new EventEmitter<void>();
  public readonly destroyed$ = this._destroyed$.asObservable();

  protected formInstance: FormGroupDirective;

  /*
   * Lifecycle
   */

  public constructor (
    controls: { [key: string]: AbstractControl },
    validatorOrOpts?: ValidatorFn | Array<ValidatorFn> | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | Array<AsyncValidatorFn> | null,
  ) {
    super(controls, validatorOrOpts, asyncValidator);

    this.defaultValue = this.getRawValue();

    this.valueChanges.pipe(
      takeUntil(this.destroyed$),
      startWith(this.value),
    ).subscribe(this._value$);

    this.makeSnapshot();
  }

  // alias for ngOnDestroy
  public complete (): void {
    // tslint:disable-next-line:no-lifecycle-call
    this.ngOnDestroy();
  }

  public ngOnDestroy (): void {
    this._value$.complete();
    this._snapshot$.complete();
    this._submitted$.complete();

    this._destroyed$.next();
    this._destroyed$.complete();
  }

  /*
   * Form instance
   */

  public setFormInstance (formInstance: FormGroupDirective): void {
    this.formInstance = formInstance;

    this.formInstance.ngSubmit.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(() => this.syncSubmitted());
  }

  public markAsSubmitted (value: boolean = true): void {
    if (this.formInstance) {
      (this.formInstance as { submitted: boolean }).submitted = value;
    } else {
      // @todo replace by logger service
      // console.warn('BaseForm: form instance is not set. Call setFormInstance(ngForm) after form initialized.');
    }
  }

  protected syncSubmitted (): void {
    if (this.formInstance) {
      this._submitted$.next(this.formInstance.submitted);
    }
  }

  /*
   * Form value interaction
   */

  public patchValue (value: Partial<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    super.patchValue(value, options);
  }

  public makeSnapshot (): void {
    this._snapshot$.next(cloneDeep(this.value));
  }

  public get (id: FormControlPath): AbstractControl | null {
    const result = super.get(id);

    if (!result && console) {
      console.warn(`Form control "${id}" not found.`);
    }

    return result;
  }

  public group (controlId: FormControlPath): FormGroup | null {
    const result = this.get(controlId) as FormGroup | null;

    if (!result && console) {
      console.warn(`Form group "${controlId}" not found.`);
    }

    return result;
  }

  public control (controlId: FormControlPath): FormControl | null {
    const result = this.get(controlId) as FormControl | null;

    if (!result && console) {
      console.warn(`Form control "${controlId}" not found.`);
    }

    return result;
  }

  public array (controlId: FormControlPath): FormArray | null {
    const result = this.get(controlId) as FormArray | null;

    if (!result && console) {
      console.warn(`Form array "${controlId}" not found.`);
    }

    return result;
  }

  public groupControlKeys (id: string): Array<string> {
    return Object.keys(this.group(id).controls);
  }

  public onValuesChanged (keys?: Array<keyof T | string>): Observable<T> {
    return this.value$.pipe(
      takeUntil(this.destroyed$),
      skipWhile(value => !value),
      distinctUntilChanged(isEqualStruct<T>(keys)),
    );
  }

  public onSnapshotChanged (keys?: Array<keyof T | string>): Observable<T> {
    return this.snapshot$.pipe(
      takeUntil(this.destroyed$),
      skipWhile(value => !value),
      distinctUntilChanged(isEqualStruct<T>(keys)),
    );
  }

  /*
   * Reset
   */

  public reset (value?: Partial<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    this.resetSubmitted();

    super.reset(value || this.defaultValue, options);

    this.markAsUntouched();
    this.markAsPristine();
  }

  public resetErrors (): void {
    this.reset(this.getRawValue());
  }

  public resetSubmitted (): void {
    this.markAsSubmitted(false);
    this.syncSubmitted();
  }

  /*
   * Validation and errors
   */

  public setError (controlId: string, error: string, value: any = true): (is: boolean) => void {
    return (isInvalid: boolean): void => {
      const ctrl = this.control(controlId);

      const nextErrors = {
        ...(ctrl.errors || {}),
      };

      if (nextErrors.hasOwnProperty(error)) {
        delete nextErrors[error];
      }

      if (isInvalid) {
        nextErrors[error] = value;
      }

      ctrl.setErrors(Object.keys(nextErrors).length > 0 ? nextErrors : null);
    };
  }

  public getErrors (controlId?: FormControlPath): FormErrorsCollection {
    const fetchErrors = (controls: { [key: string]: AbstractControl } | Array<AbstractControl>) => {
      const result = {};

      Object.keys(controls).forEach(field => {
        const control = controls[field];

        if (control instanceof FormControl) {
          result[field] = control.errors;
        } else if (control instanceof FormGroup || control instanceof FormArray) {
          result[field] = control.errors || {};

          if (Object.keys(control.controls).length > 0) {
            result[field].children = fetchErrors(control.controls);
          }
        }
      });

      return result;
    };

    return fetchErrors(controlId ? this.group(controlId).controls : this.controls);
  }
}
