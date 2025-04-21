import path from "path";
import { DataSource } from "typeorm";

export default new DataSource({
  type: "mongodb",
  url: "<INSERT HERE>",
  entities: [path.join(__dirname, "../../server/models/*.ts")]
});