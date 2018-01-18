import anyExtension from './extensions/any'
import objectExtension from './extensions/object'
import stringExtension from './extensions/string'

import Schema from './schema'
import boolExtension from './extensions/bool'
import {IValidationContext} from './types'

const vald = new Schema()
  .extend('any', anyExtension)
  .extend('bool', boolExtension)
  .extend('string', stringExtension)
  .extend('object', objectExtension)

export {
  Schema,
  SchemaBase
} from './schema'

export {
  Step,
  IValidator,
  IValidationResult,
  IValidationStepResult,
  ValidatorInsertType,
  ValidationStepResultOp,
  IValidationOptions,
  IValidationContext
} from './types'

export default vald
