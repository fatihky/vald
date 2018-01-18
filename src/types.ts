import {Map} from 'immutable'

export enum ValidationStepResultOp {
  ERROR = 1,
  CONTINUE,
  BYPASS_VALIDATION,
  MODIFY_SCHEMA,
  APPEND_STEP,
  PREPEND_STEP
}

export interface IValidationStepResult {
  op: ValidationStepResultOp
  value: any
  error?: Error,
  step?: Step, // validation steps can insert new steps if wanted
  schema?: ISchema
}

export interface IValidationContext {
  resolve(path: string): any
}

export type ValidatorFunction = (value: any, param: any, ctx: IValidationContext, schema: ISchema) => IValidationStepResult

export enum ValidatorInsertType {
  HEAD = 1,
  TAIL,
  SETUP,
  PRE_SETUP,
  AFTER_SETUP = HEAD
}

export interface IValidator {
  func: ValidatorFunction
  insertType: ValidatorInsertType
}

export interface Step {
  id?: number, // every step should have an id
  func: ValidatorFunction,
  baseName: string,
  param: any,
  insertType: ValidatorInsertType,
  setupStep?: boolean,
  name?: string
}

export interface IValidationOptions {
  context?: any,
  rootValidationContext?: IValidationContext
}

export interface IValidationResult {
  value: any
  error: Error
}

export interface ISchemaBase {
  methods: Map<string, IValidator>
  defaultValidator: IValidator // protected sub schema bases
  defaultValidatorParam: any

  clone(): ISchemaBase

  extend(methods: Map<string, IValidator>): ISchemaBase

  merge(base: ISchemaBase): ISchemaBase

  setDefaultValidator(func: IValidator): ISchemaBase

  set(name, func: IValidator): ISchemaBase

  has(name: string)

  get(name: string): IValidator

  toString(): string
}

export interface ISchema {
  bases: Map<string, ISchemaBase>
  steps: Array<Step>

  extend(name: string, base: ISchemaBase): ISchema

  base(name: string): ISchema

  step(name: string, param?: any): ISchema

  validate(value?: any): IValidationResult
}
