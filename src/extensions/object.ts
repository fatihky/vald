import * as _ from "lodash";
import {
  IValidationStepResult,
  ValidationStepResultOp, IValidationResult, ValidatorInsertType, IValidationContext,
} from '../types'
import anyExtension from './any'
import Schema, {SchemaBase} from '../schema'

const objectExtension: SchemaBase = anyExtension
  .setDefaultValidator({
    insertType: ValidatorInsertType.SETUP,
    func: (value: any, param: object): IValidationStepResult => {
      if (_.isPlainObject(value)) {
        return {
          op: ValidationStepResultOp.CONTINUE,
          value
        }
      }

      return {
        op: ValidationStepResultOp.ERROR,
        value,
        error: new Error('value is not an object')
      }
    }
  })
  .set('keys', {
    insertType: ValidatorInsertType.TAIL,
    func: (value: any, param: object, ctx: IValidationContext): IValidationStepResult => {
      const entries: [string, Schema][] = _.entries(param)
      const nobject = {}

      for (let i = 0; i < entries.length; i++) {
        const [key, schema] = entries[i]
        const val = value[key]
        const {value: nVal, error}: IValidationResult = schema.validate(val, {
          rootValidationContext: ctx
        })

        if (error) {
          return {
            op: ValidationStepResultOp.ERROR,
            value,
            error
          }
        }

        nobject[key] = nVal
      }

      // do nothing
      return {
        op: ValidationStepResultOp.CONTINUE,
        value: nobject,
        error: null
      }
    }
  })

// const objectExtension: ValidationExtension = {
//   pre: {
//     func: (value: any, param: object): IValidationStepResult => {
//       if (_.isPlainObject(value)) {
//         return {
//           op: ValidationStepResultOp.CONTINUE,
//           value
//         }
//       }
//
//       return {
//         op: ValidationStepResultOp.ERROR,
//         value,
//         error: new Error('value is not an object')
//       }
//     }
//   },
//   methods: anyExtension.methods
//     .set('keys', {
//       insertOp: ValidationMethodInsertOp.INSERT_FIRST,
//       func: (value: any, param: object): IValidationStepResult => {
//         const entries: [string, Schema][] = _.entries(param)
//         const nobject = {}
//
//         for (let i = 0; i < entries.length; i++) {
//           const [key, schema] = entries[i]
//           const val = value[key]
//           const {value: nVal, error}: IValidationResult = schema.validate(val)
//
//           if (error) {
//             return {
//               op: ValidationStepResultOp.ERROR,
//               value,
//               error
//             }
//           }
//
//           nobject[key] = nVal
//         }
//
//         // do nothing
//         return {
//           op: ValidationStepResultOp.CONTINUE,
//           value: nobject,
//           error: null
//         }
//       }
//     })
// }
//
// export default objectExtension

// export default anyExtension

export default objectExtension
