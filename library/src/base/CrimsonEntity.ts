import { ObjectIdColumn, PrimaryGeneratedColumn, } from "typeorm"

import {ObjectId} from "mongodb";

/**
 * All entity models have these properties, 
 * right now the main one is a _id field. 
 * The great thing about having a base class is the compiler and 
 * IDE can always infer that the primary key will always be called _id.
 */
export default abstract class CrimsonEntity {
  @ObjectIdColumn()
  _id?: ObjectId

  // Work around for missing Vuetify feature.
  actions?: string = "TABLE ACTIONS PLACEHOLDER"
}