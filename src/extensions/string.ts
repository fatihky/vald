import * as _ from "lodash";
import {
  IValidationStepResult,
  ValidationStepResultOp,
  ValidatorInsertType,
} from '../types'
import anyExtension from './any'
import {
  SchemaBase
} from '../schema'

const stringExtension: SchemaBase = anyExtension
  .setDefaultValidator({
    insertType: ValidatorInsertType.SETUP,
    func: (value: any, param: object): IValidationStepResult => {
      if (_.isString(value)) {
        return {
          op: ValidationStepResultOp.CONTINUE,
          value
        }
      }

      return {
        op: ValidationStepResultOp.ERROR,
        value,
        error: new Error('value is not a string')
      }
    }
  })
  .set('regex', {
    insertType: ValidatorInsertType.TAIL,
    func: (value: any, param: RegExp): IValidationStepResult => {
      if (param.test(value)) {
        return {
          op: ValidationStepResultOp.CONTINUE,
          value: value,
          error: null
        }
      }

      return {
        op: ValidationStepResultOp.ERROR,
        value,
        error: new Error(`value does not match regex(${param})`)
      }
    }
  })
  .set('json', {
    insertType: ValidatorInsertType.TAIL,
    func: (value: any, param: any): IValidationStepResult => {
      try {
        const json = JSON.parse(value)
        return {
          op: ValidationStepResultOp.CONTINUE,
          value: json
        }
      } catch (error) {
        return {
          op: ValidationStepResultOp.ERROR,
          value,
          error
        }
      }
    }
  })

export default stringExtension
