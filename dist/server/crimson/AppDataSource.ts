import path from "path";
import { DataSource } from "typeorm";

export default new DataSource({
  type: "mongodb",
  url: "mongodb+srv://adamgovier2002:Archie8534!@cluster0.nkyhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  entities: [path.join(__dirname, "../../server/models/*.ts")]
});