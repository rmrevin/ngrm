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
import { ParamMap, Router } from '@angular/router';
import { isEqual, pick } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, skipWhile, startWith, takeUntil } from 'rxjs/operators';

export interface FormatRuleInterface
{
  fields: Array<string>;
  // tslint:disable-next-line:prefer-method-signature
  formatter: (value: any) => any;
}

export interface FormErrorsCollection
{
  [key: string]: ValidationErrors & { children?: FormErrorsCollection };
}

export class BaseForm<T> extends FormGroup implements OnDestroy
{
  public readonly value: T;
  public readonly defaultValue: T;
  public readonly value$ = new BehaviorSubject<T>(undefined);
  public readonly snapshot$ = new BehaviorSubject<T>(undefined);
  public readonly valueChanges: Observable<T>;

  public readonly submitted$ = new BehaviorSubject<boolean>(false);
  public readonly destroyed$ = new EventEmitter<void>();

  private formInstance: FormGroupDirective;

  public constructor (
    controls: { [key: string]: AbstractControl },
    validatorOrOpts?: ValidatorFn | Array<ValidatorFn> | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | Array<AsyncValidatorFn> | null,
  ) {
    super(controls, validatorOrOpts, asyncValidator);

    this.defaultValue = this.value;

    this.valueChanges.pipe(
      takeUntil(this.destroyed$),
      startWith(this.value),
    ).subscribe(this.value$);

    this.makeSnapshot();
  }

  // alias for ngOnDestroy
  public complete (): void {
    // tslint:disable-next-line:no-lifecycle-call
    this.ngOnDestroy();
  }

  public ngOnDestroy (): void {
    this.value$.complete();
    this.snapshot$.complete();

    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public setFormInstance (formInstance: FormGroupDirective): void {
    this.formInstance = formInstance;

    this.formInstance.ngSubmit.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(() => this.syncSubmitted());
  }

  public extractDataFromParams (params: ParamMap, key: string, formatRules?: Array<FormatRuleInterface>): Partial<T> {
    if (params.has(key)) {
      const data = JSON.parse(params.get(key));

      if (formatRules) {
        Object.keys(data).forEach(field =>
          formatRules
            .filter(rule => rule.fields.indexOf(field) > -1)
            .forEach(rule => data[field] = rule.formatter(data[field])));
      }

      return data;
    }

    return {};
  }

  public remember (key: string): (router: Router) => Promise<boolean> {
    return (router: Router) => {
      return router.navigate([], {queryParams: {[key]: JSON.stringify(this.value)}}).then(result => {
        this.makeSnapshot();

        return result;
      });
    };
  }

  public restore (key: string, formatRules?: Array<FormatRuleInterface>): (params: ParamMap) => T {
    return (params: ParamMap) => {
      if (params.has(key)) {
        const filterData = this.extractDataFromParams(params, key, formatRules);

        this.patchValue(filterData, {emitEvent: true});
      } else {
        this.reset();
      }

      return this.value;
    };
  }

  public makeSnapshot (): void {
    this.snapshot$.next(this.value);
  }

  public get (id: Array<string | number> | string): AbstractControl | null {
    const result = super.get(id);

    if (!result && console) {
      console.warn(`Form control "${id}" not found.`);
    }

    return result;
  }

  public group (id: string): FormGroup | null {
    const result = this.get(id) as FormGroup | null;

    if (!result && console) {
      console.warn(`Form group "${id}" not found.`);
    }

    return result;
  }

  public control (id: string): FormControl | null {
    const result = this.get(id) as FormControl | null;

    if (!result && console) {
      console.warn(`Form control "${id}" not found.`);
    }

    return result;
  }

  public array (id: string): FormArray | null {
    const result = this.get(id) as FormArray | null;

    if (!result && console) {
      console.warn(`Form array "${id}" not found.`);
    }

    return result;
  }

  public groupControlKeys (id: string): Array<string> {
    return Object.keys(this.group(id).controls);
  }

  public onValuesChanged (keys?: Array<keyof T>): Observable<T> {
    return this.value$.pipe(
      takeUntil(this.destroyed$),
      skipWhile(value => !value),
      distinctUntilChanged(isEqualStruct<T>(keys)),
    );
  }

  public onSnapshotChanged (keys?: Array<keyof T>): Observable<T> {
    return this.snapshot$.pipe(
      takeUntil(this.destroyed$),
      skipWhile(value => !value),
      distinctUntilChanged(isEqualStruct<T>(keys)),
    );
  }

  public reset (value?: Partial<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    this.resetSubmitted();

    super.reset(value || this.defaultValue, options);

    this.markAsUntouched();
    this.markAsPristine();
  }

  public resetErrors (): void {
    this.reset(this.value);
  }

  public markAsSubmitted (value: boolean = true): void {
    if (this.formInstance) {
      (this.formInstance as { submitted: boolean }).submitted = value;
    } else {
      // @todo replace by logger service
      // console.warn('BaseForm: form instance is not set. Call setFormInstance(ngForm) after form initialized.');
    }
  }

  public resetSubmitted (): void {
    this.markAsSubmitted(false);
    this.syncSubmitted();
  }

  public patchValue (value: Partial<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    super.patchValue(value, options);
  }

  public getErrors (path?: string): FormErrorsCollection {
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

    return fetchErrors(path ? this.group(path).controls : this.controls);
  }

  private syncSubmitted (): void {
    if (this.formInstance) {
      this.submitted$.next(this.formInstance.submitted);
    }
  }
}

function isEqualStruct<T> (keys?: Array<keyof T>): (x, y) => boolean {
  return (x, y) => isEqual(
    keys ? pick(x, keys) : x,
    keys ? pick(y, keys) : y,
  );
}
