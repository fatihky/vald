import {Map} from "immutable";
import * as _ from "lodash";
import {
  IValidationStepResult,
  ValidationStepResultOp,
  IValidator, ValidatorInsertType,
} from '../types'
import {
  SchemaBase
} from '../schema'
import when from './any.when'

const anyExtension = new SchemaBase(Map<string, IValidator>())
    .set('optional', {
      insertType: ValidatorInsertType.PRE_SETUP,
      func: (value: any, param: any): IValidationStepResult => {
        if (_.isUndefined(value) || _.isEmpty(value)) {
          return {
            op: ValidationStepResultOp.BYPASS_VALIDATION,
            value,
            error: null
          }
        }

        // do nothing
        return {
          op: ValidationStepResultOp.CONTINUE,
          value,
          error: null
        }
      }
    })
    .set('required', {
      insertType: ValidatorInsertType.PRE_SETUP,
      func: (value: any, param: any): IValidationStepResult => {
        // todo: .isEmpty catches number zero. this is not an expected behavior.
        if (_.isUndefined(value) || _.isEmpty(value)) {
          return {
            op: ValidationStepResultOp.CONTINUE,
            value,
            error: new Error('value is required')
          }
        }

        // do nothing
        return {
          op: ValidationStepResultOp.CONTINUE,
          value,
          error: null
        }
      }
    })
  .set('min', {
    insertType: ValidatorInsertType.TAIL,
    func: (value: string, param: number) => {
      if (value.length < param) {
        return {
          op: ValidationStepResultOp.CONTINUE,
          value,
          error: new Error(`value must be at least ${param} length`)
        }
      }

      return {
        op: ValidationStepResultOp.CONTINUE,
        value,
        error: null
      }
    }
  })
  .set('when', when)

export default anyExtension
