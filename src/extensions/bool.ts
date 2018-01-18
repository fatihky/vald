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

const boolExtension: SchemaBase = anyExtension
  .setDefaultValidator({
    insertType: ValidatorInsertType.SETUP,
    func: (value: any, param: object): IValidationStepResult => {
      if (_.isBoolean(value)) {
        return {
          op: ValidationStepResultOp.CONTINUE,
          value
        }
      }

      return {
        op: ValidationStepResultOp.ERROR,
        value,
        error: new Error('value is not boolean')
      }
    }
  })

export default boolExtension
