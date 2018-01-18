import * as _ from 'lodash'
import { Map } from 'immutable'
import {
  IValidator,
  ValidatorInsertType,
  Step,
  IValidationResult,
  IValidationStepResult,
  ValidationStepResultOp,
  ISchemaBase,
  ISchema,
  IValidationContext,
  IValidationOptions,
} from './types'

export class SchemaBase implements ISchemaBase {
  methods: Map<string, IValidator>
  defaultValidator: IValidator // protected sub schema bases
  defaultValidatorParam: any

  constructor(methods: Map<string, IValidator>) {
    this.methods = methods
  }

  clone(): SchemaBase {
    const clone = new SchemaBase(this.methods)
    clone.defaultValidator = this.defaultValidator
    clone.defaultValidatorParam = this.defaultValidatorParam
    return clone
  }

  extend(methods: Map<string, IValidator>): SchemaBase {
    const clone = this.clone()
    clone.methods = clone.methods.merge(methods)
    return clone
  }

  merge(base: SchemaBase): SchemaBase {
    return this.extend(base.methods)
  }

  setDefaultValidator(func: IValidator): SchemaBase {
    const clone = this.clone()
    clone.defaultValidator = func
    return clone
  }

  set(name, func: IValidator): SchemaBase {
    return this.extend(Map<string, IValidator>().set(name, func))
  }

  has(name: string) {
    return this.methods.has(name)
  }

  get(name: string): IValidator {
    if (!this.has(name)) {
      throw new Error(`method ${name} does not exist`)
    }

    return this.methods.get(name)
  }

  toString(): string {
    return `'[SchemaBase {${this.methods.valueSeq().toArray().join(', ')}}]'`
  }
}

// STEPS ===========================================================
// Steps are has this order
// PRE SETUP STEPS
// SETUP STEP
// VALIDATION STEPS

// Here is insert position's definitions (ValidatorInsertType enum)
// PRE_SETUP: before setup step. last one will run first
// SETUP: setup step. only one setup step is supported now
// HEAD: after setup step. last one will run first
// TAIL: after all steps. last one will run last
// =================================================================

export class Schema implements ISchema {
  bases: Map<string, SchemaBase>
  steps: Array<Step>

  private currentBase: SchemaBase = null
  private currentBaseName: string = null
  private lastStepId: number = 1

  constructor() {
    this.bases = Map<string, SchemaBase>()
    this.steps = Array<Step>()
  }

  private static getCurrentBaseName(schema: Schema) {
    return schema.currentBaseName
  }

  private clone(currentBaseName: string, bases: Map<string, SchemaBase>, steps: Array<Step>): Schema {
    const clone = new Schema()
    clone.lastStepId = this.lastStepId
    clone.bases = bases
    clone.steps = steps.slice()
    clone._setBase(currentBaseName)
    return clone
  }

  extend(name: string, base: SchemaBase): Schema {
    if (this.bases.has(name)) {
      return this.clone(this.currentBaseName, this.bases.set(name, this.bases.get(name).merge(base)), this.steps.slice())
    }

    return this.clone(this.currentBaseName, this.bases.set(name, base), this.steps.slice())
  }

  static _findLastOccurenceOfStepGroupHead(group: Array<any>, keySearching: any, compare: (keySearching: any, key: any) => boolean): number {
    let index = 0

    if (group.length === 0) {
      return 0
    }

    if (compare(keySearching, _.last(group)) === false) {
      return group.length
    }

    _.forEachRight(group, (key, i) => {
      // do not do anything if index is found
      if (index !== 0) {
        return
      }

      if (compare(keySearching, key) === false) {
        index = Number(i) + 1
      }
    })

    return index
  }

  private static _compareStepGroup(stepSearching: Step, step: Step): boolean {
    return step.setupStep !== true && step.baseName === stepSearching.baseName
  }

  private static _insertStep(currentBaseName: string, steps: Array<Step>, step: Step) {
    const setupIndexFilter = step => step.setupStep && step.baseName === currentBaseName
    let lastSetupIndex = _.findLastIndex(steps, setupIndexFilter)
    const lastHeadIndex = Schema._findLastOccurenceOfStepGroupHead(steps, step, Schema._compareStepGroup)

    switch (step.insertType) {
      case ValidatorInsertType.PRE_SETUP: {
        if (lastSetupIndex !== -1) {
          let lastPreSetupIndexHead = lastSetupIndex

          for (let i = lastSetupIndex - 1; i >= 0; i--) {
            const preSetupStep = steps[i]

            if (preSetupStep.baseName !== step.baseName) {
              break
            }

            lastPreSetupIndexHead = i
          }

          steps.splice(lastPreSetupIndexHead, 0, step)
        } else {
          steps.splice(lastHeadIndex, 0, step)
        }
      } break
      case ValidatorInsertType.SETUP:
      case ValidatorInsertType.TAIL: {
        steps.push(step)
      } break
      case ValidatorInsertType.AFTER_SETUP:
      case ValidatorInsertType.HEAD: {
        let index = lastSetupIndex

        if (index === -1) {
          index = lastHeadIndex
          steps.splice(index, 0, step)
        } else {
          steps.splice(index + 1, 0, step)
        }
      } break

      default:
        throw new Error(`unknown step insert type: ${step.insertType}`)
    }
  }

  private _addStep(validatorDefinition: IValidator, param: any, name: string): Schema {
    const clone = this.clone(this.currentBaseName, this.bases, this.steps.slice())
    const {func, insertType} = validatorDefinition
    const step: Step = {
      func,
      baseName: clone.currentBaseName,
      param,
      setupStep: insertType === ValidatorInsertType.SETUP,
      name,
      id: clone.lastStepId++,
      insertType
    }

    Schema._insertStep(clone.currentBaseName, clone.steps, step)

    return clone
  }

  private _setBase(name: string) {
    this.currentBase = this.bases.get(name)
    this.currentBaseName = name
  }

  base(name: string): Schema {
    if (!this.bases.has(name)) {
      throw new Error(`base "${name}" does not exist`)
    }

    const clone = this.clone(name, this.bases, this.steps)

    if (name === this.currentBaseName) {
      return clone
    }

    if (clone.currentBase.defaultValidator) {
      return clone._addStep(clone.currentBase.defaultValidator, clone.currentBase.defaultValidatorParam, `${name}.pre`)
    }

    return clone
  }

  step(name: string, param?: any): Schema {
    if (this.currentBase === null) {
      throw new Error('no base selected')
    }

    if (!this.currentBase.has(name)) {
      throw new Error(`method ${this.currentBaseName}.${name} does not exist`)
    }

    return this._addStep(this.currentBase.get(name), param, name)
  }

  private static _createValidationContext(opts: IValidationOptions, value: any): IValidationContext {
    return {
      resolve(path: string): any {
        if (path[0] === '$') {
          return _.get(opts.context, path.substr(1))
        }

        return _.get(value, path)
      }
    }
  }

  validate(value?: any, opts: IValidationOptions = {}): IValidationResult {
    let currentValue = value
    const stepIds = _.map(this.steps, 'id')
    const steps = this.steps.slice()
    const validationContext: IValidationContext = opts.rootValidationContext || Schema._createValidationContext(opts, value)
    let currentSchema: Schema = this

    for (; steps.length;) {
      const step = steps.shift()
      const {
        op,
        error = null,
        value: nValue,
        step: nStep = null,
        schema = null
      }: IValidationStepResult = step.func(currentValue, step.param, validationContext, currentSchema)

      currentValue = nValue

      if (op === ValidationStepResultOp.BYPASS_VALIDATION) {
        break
      }

      if (error || op === ValidationStepResultOp.ERROR) {
        return {
          value: currentValue,
          error: error || new Error('can not validate the value')
        }
      }

      if (op === ValidationStepResultOp.APPEND_STEP) {
        steps.push(nStep)
      }

      if (op === ValidationStepResultOp.PREPEND_STEP) {
        steps.unshift(nStep)
      }

      if (op === ValidationStepResultOp.MODIFY_SCHEMA) {
        if (schema !== null) {
          const nStepIds = _.difference(_.map(schema.steps, 'id'), stepIds)
          const nSteps = schema.steps.filter(step => nStepIds.indexOf(step.id) >= 0)

          nStepIds.forEach(id => stepIds.push(id))
          nSteps.forEach(step => {
            Schema._insertStep(step.baseName, steps, step)
          })

          // set the current schema
          currentSchema = schema as Schema
        }
      }

      // ValidationStepResultOp.CONTINUE
    }

    return {
      value: currentValue,
      error: null
    }
  }
}

export default Schema
