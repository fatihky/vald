import * as assert from 'assert'
import {IValidationResult} from "./types";

export const isValid = (validationResult: IValidationResult) => assert(validationResult.error === null)
export const notValid = (validationResult: IValidationResult) => assert(validationResult.error !== null)
